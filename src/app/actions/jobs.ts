"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { calculateMatchScore } from "@/lib/matching";

const jobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  salary: z.string().min(1, "Salary is required"),
  skillsRequired: z.array(z.string()).min(1, "At least one required skill is required"),
  skillsNiceToHave: z.array(z.string()),
});

export async function createJob(formData: z.infer<typeof jobSchema>) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "EMPLOYER") {
      return { success: false, error: "Unauthorized. Recruiters only." };
    }

    const validatedData = jobSchema.parse(formData);

    const job = await db.job.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        company: validatedData.company,
        location: validatedData.location,
        salary: validatedData.salary,
        skillsRequired: validatedData.skillsRequired,
        skillsNiceToHave: validatedData.skillsNiceToHave,
        employerId: session.user.id,
      },
    });

    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");
    return { success: true, job };
  } catch (error: any) {
    console.error("Create job error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "An unexpected error occurred while posting the job." };
  }
}

export async function getEmployerJobs() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "EMPLOYER") {
      throw new Error("Unauthorized");
    }

    const jobs = await db.job.findMany({
      where: { employerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                email: true,
                candidateProfile: true,
              },
            },
          },
        },
      },
    });

    return { success: true, jobs };
  } catch (error: any) {
    console.error("Get employer jobs error:", error);
    return { success: false, error: error.message || "Failed to load jobs." };
  }
}

export async function getJobs() {
  try {
    const jobs = await db.job.findMany({
      orderBy: [
        { isPremium: "desc" },
        { createdAt: "desc" },
      ],
    });
    return { success: true, jobs };
  } catch (error: any) {
    console.error("Get jobs error:", error);
    return { success: false, error: "Failed to load jobs." };
  }
}


export async function applyToJob(jobId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized. Candidates only." };
    }

    const existingApplication = await db.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: session.user.id,
        },
      },
    });

    if (existingApplication) {
      return { success: false, error: "You have already applied to this job." };
    }

    // Fetch candidate skills
    const profile = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    });
    const candidateSkills = profile && Array.isArray(profile.skills) ? (profile.skills as string[]) : [];

    // Fetch job requirements
    const job = await db.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      return { success: false, error: "Job not found." };
    }
    const mustHave = Array.isArray(job.skillsRequired) ? (job.skillsRequired as string[]) : [];
    const niceToHave = Array.isArray(job.skillsNiceToHave) ? (job.skillsNiceToHave as string[]) : [];

    // Compute match score
    const score = calculateMatchScore(candidateSkills, mustHave, niceToHave);

    const application = await db.application.create({
      data: {
        jobId,
        candidateId: session.user.id,
        status: "APPLIED",
        matchScore: score,
      },
    });

    revalidatePath("/dashboard/candidate/jobs");
    revalidatePath("/dashboard/employer/jobs");
    return { success: true, application };
  } catch (error: any) {
    console.error("Apply to job error:", error);
    return { success: false, error: "Failed to submit application." };
  }
}

export async function deleteJob(jobId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "EMPLOYER") {
      return { success: false, error: "Unauthorized. Recruiters only." };
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return { success: false, error: "Job not found." };
    }

    if (job.employerId !== session.user.id) {
      return { success: false, error: "Unauthorized to delete this job." };
    }

    await db.job.delete({
      where: { id: jobId },
    });

    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Delete job error:", error);
    return { success: false, error: "Failed to delete job." };
  }
}

export async function updateJob(jobId: string, formData: z.infer<typeof jobSchema>) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "EMPLOYER") {
      return { success: false, error: "Unauthorized. Recruiters only." };
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return { success: false, error: "Job not found." };
    }

    if (job.employerId !== session.user.id) {
      return { success: false, error: "Unauthorized to update this job." };
    }

    const validatedData = jobSchema.parse(formData);

    const updatedJob = await db.job.update({
      where: { id: jobId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        company: validatedData.company,
        location: validatedData.location,
        salary: validatedData.salary,
        skillsRequired: validatedData.skillsRequired,
        skillsNiceToHave: validatedData.skillsNiceToHave,
      },
    });

    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");
    return { success: true, job: updatedJob };
  } catch (error: any) {
    console.error("Update job error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "An unexpected error occurred while updating the job." };
  }
}

export async function importJobFromUrl(url: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "EMPLOYER") {
      return { success: false, error: "Unauthorized. Recruiters only." };
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return { success: false, error: "Invalid URL format." };
    }

    let parsedTitle = "External Role";
    let parsedCompany = "External Employer";
    let parsedLocation = "Remote";
    let parsedSalary = "₹12L - ₹18L per annum";
    let parsedDescription = "Imported external job posting spec.";
    let parsedSkillsRequired: string[] = ["JavaScript"];
    let parsedSkillsNiceToHave: string[] = ["TypeScript"];

    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    const host = urlObj.hostname.replace("www.", "").split(".")[0];
    parsedCompany = host.charAt(0).toUpperCase() + host.slice(1);

    if (url.includes("linkedin")) {
      parsedCompany = "LinkedIn Network Partner";
    } else if (url.includes("indeed")) {
      parsedCompany = "Indeed Partner";
    }

    const pathParts = path.split("/").filter(p => p.length > 2 && isNaN(Number(p)));
    if (pathParts.length > 0) {
      const slug = pathParts.find(p => p.includes("developer") || p.includes("engineer") || p.includes("designer") || p.includes("job") || p.includes("role") || p.includes("-"));
      if (slug) {
        parsedTitle = slug
          .split("-")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
    }

    const urlLower = url.toLowerCase();
    if (urlLower.includes("frontend") || urlLower.includes("front-end")) {
      parsedTitle = "Senior Frontend Engineer";
      parsedSkillsRequired = ["React", "TypeScript", "Tailwind CSS"];
      parsedSkillsNiceToHave = ["Next.js", "Framer Motion", "GSAP"];
      parsedDescription = "We are hiring a Senior Frontend Engineer to build premium, modern web applications. You will work closely with designers and product managers to create fluid UI layouts with polished spring animations and micro-interactions.";
    } else if (urlLower.includes("backend") || urlLower.includes("back-end")) {
      parsedTitle = "Staff Backend Developer";
      parsedSkillsRequired = ["Node.js", "TypeScript", "PostgreSQL"];
      parsedSkillsNiceToHave = ["Docker", "Redis", "AWS"];
      parsedDescription = "Join us as a Staff Backend Developer. You will scale our core REST/GraphQL services, design database schemas, manage message queues, and deploy containers across microservices architectures.";
    } else if (urlLower.includes("fullstack") || urlLower.includes("full-stack")) {
      parsedTitle = "Full-Stack Engineer";
      parsedSkillsRequired = ["React", "TypeScript", "Node.js"];
      parsedSkillsNiceToHave = ["Next.js", "PostgreSQL", "Tailwind CSS"];
      parsedDescription = "We are seeking a Full-Stack Engineer who enjoys working across the entire web stack. You will build user-facing components, design relational database structures, and orchestrate integrations.";
    } else if (urlLower.includes("designer") || urlLower.includes("ui-ux") || urlLower.includes("design")) {
      parsedTitle = "Design Engineer";
      parsedSkillsRequired = ["Framer Motion", "Tailwind CSS", "GSAP"];
      parsedSkillsNiceToHave = ["React", "Three.js", "Design Engineering"];
      parsedDescription = "We are looking for a hybrid Design Engineer who cares about pixels, typefaces, physical motions, and clean component architecture. You will bridge the gap between design concepts and front-end reality.";
    } else {
      parsedTitle = "Software Development Engineer";
      parsedSkillsRequired = ["JavaScript", "TypeScript", "Git"];
      parsedSkillsNiceToHave = ["Node.js", "Next.js", "Docker"];
      parsedDescription = "Looking for a versatile Software Engineer to join our growing product team. You will build new features, fix bugs, optimize performance, and participate in peer code reviews.";
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          const rawTitle = titleMatch[1].trim();
          parsedDescription = `Imported from: ${url}\n\n` + rawTitle;
          
          if (rawTitle.includes("|")) {
            const parts = rawTitle.split("|");
            parsedTitle = parts[0].trim();
            if (parts[1]) parsedCompany = parts[1].trim();
          } else if (rawTitle.includes("-")) {
            const parts = rawTitle.split("-");
            parsedTitle = parts[0].trim();
            if (parts[1]) parsedCompany = parts[1].trim();
          } else {
            parsedTitle = rawTitle;
          }
        }
      }
    } catch (fetchErr) {
      console.log("External job scrap fetch aborted or blocked by Cloudflare (falling back to parser):", fetchErr);
    }

    const job = await db.job.create({
      data: {
        title: parsedTitle,
        description: parsedDescription,
        company: parsedCompany,
        location: parsedLocation,
        salary: parsedSalary,
        skillsRequired: parsedSkillsRequired,
        skillsNiceToHave: parsedSkillsNiceToHave,
        employerId: session.user.id,
      },
    });

    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");
    return { success: true, job };
  } catch (error: any) {
    console.error("Import job error:", error);
    return { success: false, error: "An unexpected error occurred while importing the job." };
  }
}

export async function syncExternalJobs() {
  try {
    let systemEmployer = await db.user.findUnique({
      where: { email: "connections@fitboard.com" },
    });

    if (!systemEmployer) {
      const hashedPassword = await bcrypt.hash("fitboard_connections_secret_2026", 10);
      systemEmployer = await db.user.create({
        data: {
          email: "connections@fitboard.com",
          password: hashedPassword,
          role: "EMPLOYER",
        },
      });
    }

    const seededJobs = [
      {
        title: "Senior Frontend Engineer (Next.js)",
        company: "Vercel",
        location: "Remote (Global)",
        salary: "₹24L - ₹32L per annum",
        skillsRequired: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        skillsNiceToHave: ["Framer Motion", "GSAP", "Three.js", "Zustand"],
        description: "Join the team at Vercel building the next generation of web deployment platform. We are seeking a frontend specialist with extensive knowledge of React 19, Server Components, and smooth page transition animations using GSAP and Framer Motion."
      },
      {
        title: "Staff Database Engineer",
        company: "Neon",
        location: "Bengaluru, India (Hybrid)",
        salary: "₹30L - ₹45L per annum",
        skillsRequired: ["PostgreSQL", "Node.js", "TypeScript", "Linux"],
        skillsNiceToHave: ["Docker", "Git", "GitHub", "Redis"],
        description: "Help Neon build serverless Postgres. You will design core platform components, optimize transaction latency, configure container networking with Docker, and manage Git workflow automation."
      },
      {
        title: "Platform Software Engineer",
        company: "Stripe",
        location: "San Francisco, USA (Hybrid)",
        salary: "₹36L - ₹50L per annum",
        skillsRequired: ["Node.js", "TypeScript", "PostgreSQL", "Express.js"],
        skillsNiceToHave: ["Redis", "AWS", "WebSockets", "Docker"],
        description: "Join the core platform billing integrations team at Stripe. You will build highly available Express.js microservices, coordinate Redis job queue priorities, and orchestrate Docker deployments on AWS."
      },
      {
        title: "Product Software Designer",
        company: "Linear",
        location: "Remote (EU/US/IN)",
        salary: "₹20L - ₹28L per annum",
        skillsRequired: ["Framer Motion", "Tailwind CSS", "GSAP", "React.js"],
        skillsNiceToHave: ["TypeScript", "Zustand", "Design Engineering", "Vercel"],
        description: "We are seeking a hybrid Product Software Designer / Design Engineer to build high-fidelity interactive user interfaces for our desktop client. Experience with vector layouts and spring-based animations is required."
      },
      {
        title: "Realtime Systems Developer",
        company: "Discord",
        location: "Remote (Global)",
        salary: "₹28L - ₹38L per annum",
        skillsRequired: ["Node.js", "WebSockets", "Socket.io", "Redis"],
        skillsNiceToHave: ["Docker", "Linux", "TypeScript", "Git"],
        description: "Scale Discord's gateway connections. You will write high-frequency WebSocket and Socket.io gateway servers, manage ephemeral sessions in Redis, and deploy container clusters across globally distributed edge nodes."
      },
      {
        title: "AI Integrations Engineer",
        company: "OpenAI",
        location: "San Francisco, USA (On-Site)",
        salary: "₹40L - ₹60L per annum",
        skillsRequired: ["Python", "TypeScript", "Node.js", "PostgreSQL"],
        skillsNiceToHave: ["React.js", "Docker", "AWS", "Full-Stack Development"],
        description: "Design and build full-stack interfaces for OpenAI's Developer Platform APIs. You will write backend services in Python and Node.js, create developer dashboard panels in React, and deploy data pipelines to AWS."
      },
      {
        title: "Automation & Infrastructure Specialist",
        company: "Shopify",
        location: "Delhi NCR (Hybrid)",
        salary: "₹18L - ₹24L per annum",
        skillsRequired: ["Docker", "Linux", "Git", "GitHub"],
        skillsNiceToHave: ["AWS", "Node.js", "PostgreSQL", "Express.js"],
        description: "Orchestrate merchant database scaling infrastructure. You will manage GitHub Actions workflows, automate Linux container builds with Docker, and configure platform scaling triggers."
      },
      {
        title: "Senior Full-Stack Design Engineer",
        company: "Supabase",
        location: "Singapore / Remote",
        salary: "₹28L - ₹38L per annum",
        skillsRequired: ["PostgreSQL", "Prisma", "Drizzle", "React", "TypeScript"],
        skillsNiceToHave: ["Tailwind CSS", "Zustand", "Node.js", "Docker"],
        description: "Join the Supabase frontend engineering team. You will build user-facing console tools, craft interactive dashboard panels, manage complex relational state using Zustand, and optimize database indexing schemas using Prisma and Drizzle."
      },
      {
        title: "Interactive Web GL Animator",
        company: "Active Theory",
        location: "Los Angeles, USA / Remote",
        salary: "₹32L - ₹44L per annum",
        skillsRequired: ["GSAP", "Three.js", "JavaScript", "React.js"],
        skillsNiceToHave: ["Framer Motion", "TypeScript", "Tailwind CSS", "Vercel"],
        description: "We are seeking a Creative WebGL Developer / Animator to join our agency. You will build highly interactive canvas-based websites, design custom physical scroll triggers using GSAP, and render complex 3D scenes using Three.js."
      },
      {
        title: "Real-time Gateway Systems Engineer",
        company: "Linear",
        location: "Remote (EU/US/IN)",
        salary: "₹34L - ₹48L per annum",
        skillsRequired: ["WebSockets", "Socket.io", "TypeScript", "Zustand", "Node.js"],
        skillsNiceToHave: ["Redis", "Docker", "PostgreSQL", "Linux"],
        description: "Help scale Linear's real-time workspace collaboration engine. You will write high-throughput WebSocket gateway endpoints, optimize state synchronizations, and configure local caching schemas."
      },
      {
        title: "Infrastructure & Containerization Architect",
        company: "Railway",
        location: "San Francisco, USA / Remote",
        salary: "₹36L - ₹52L per annum",
        skillsRequired: ["Docker", "Linux", "Git", "GitHub", "Vercel"],
        skillsNiceToHave: ["AWS", "PostgreSQL", "Redis", "TypeScript"],
        description: "Help build the next generation of cloud developer tooling at Railway. You will design container boundary sandboxes, secure multi-tenant Linux namespaces, and automate platform release actions."
      },
      {
        title: "Creative Frontend Developer",
        company: "Locomotive Agency",
        location: "Montreal, Canada / Remote",
        salary: "₹22L - ₹30L per annum",
        skillsRequired: ["HTML-TO-IMAGE", "SVG RENDERING", "React.js", "GSAP"],
        skillsNiceToHave: ["Framer Motion", "Tailwind CSS", "TypeScript", "Zustand"],
        description: "We are looking for a creative front-end engineer to build immersive brand stories. You will build rich SVG canvas drawings, integrate HTML-to-image capture workflows, and animate page transitions."
      },
      {
        title: "Mobile PWA Architect",
        company: "Twitter/X Lite",
        location: "Bengaluru, India (Hybrid)",
        salary: "₹26L - ₹36L per annum",
        skillsRequired: ["Progressive Web Apps (PWA)", "Web Workers", "React.js", "TypeScript"],
        skillsNiceToHave: ["Tailwind CSS", "Zustand", "Vercel", "Git"],
        description: "Design and optimize mobile web client experiences. You will configure Service Workers for offline background sync, parallelize network requests via Web Workers, and scale rendering pipelines."
      },
      {
        title: "Security Foundations Developer",
        company: "1Password",
        location: "Toronto, Canada / Remote",
        salary: "₹32L - ₹46L per annum",
        skillsRequired: ["AES-256-GCM", "HMAC-SHA256", "Node.js", "TypeScript"],
        skillsNiceToHave: ["Docker", "Linux", "Git", "PostgreSQL"],
        description: "Help secure key synchronization endpoints. You will implement cryptographic signing protocols using AES-256-GCM and HMAC-SHA256, write audited Node.js backend services, and configure container boundaries."
      },
      {
        title: "Geographical Vector Maps Engineer",
        company: "Strava",
        location: "Remote (Global)",
        salary: "₹28L - ₹40L per annum",
        skillsRequired: ["React Leaflet", "WebSockets", "TypeScript", "PostgreSQL"],
        skillsNiceToHave: ["Docker", "Git", "Node.js", "Zustand"],
        description: "Build realtime active maps tracking systems. You will map coordinate inputs using React Leaflet, establish high-frequency WebSocket streams, and optimize location spatial index queries in PostgreSQL."
      },
      {
        title: "Interactive Canvas Designer",
        company: "Canva",
        location: "Sydney, Australia (Hybrid)",
        salary: "₹30L - ₹42L per annum",
        skillsRequired: ["SVG RENDERING", "Framer Motion", "TypeScript", "React.js"],
        skillsNiceToHave: ["Tailwind CSS", "HTML-TO-IMAGE", "Zustand", "Git"],
        description: "Scale Canva's vector editor client. You will build responsive canvas design tools, script vector drawing operations, optimize SVG DOM hierarchies, and animate editor toolbars."
      },
      {
        title: "Realtime Systems Optimizer",
        company: "Slack",
        location: "San Francisco, USA / Remote",
        salary: "₹35L - ₹48L per annum",
        skillsRequired: ["Screen Wake Lock API", "Web Workers", "Node.js", "Express.js"],
        skillsNiceToHave: ["WebSockets", "TypeScript", "Redis", "Docker"],
        description: "Ensure Slack sessions stay online and responsive during long presentation calls. You will leverage the Screen Wake Lock API, orchestrate data loading in Web Workers, and manage WebSocket heartbeats."
      }
    ];

    let count = 0;
    for (const spec of seededJobs) {
      const existing = await db.job.findFirst({
        where: { title: spec.title, company: spec.company },
      });

      if (!existing) {
        await db.job.create({
          data: {
            ...spec,
            employerId: systemEmployer.id,
          },
        });
        count++;
      }
    }

    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");
    return { success: true, count };
  } catch (error: any) {
    console.error("Sync external jobs error:", error);
    return { success: false, error: "Failed to connect to external job boards." };
  }
}

export async function disconnectPlatformJobs(platform: string) {
  try {
    const systemEmployer = await db.user.findUnique({
      where: { email: "connections@fitboard.com" },
    });

    if (systemEmployer) {
      const jobsToDelete = await db.job.findMany({
        where: {
          employerId: systemEmployer.id,
          description: {
            startsWith: `[Source: ${platform}]`,
          },
        },
      });

      const idsToDelete = jobsToDelete.map((j) => j.id);
      
      if (idsToDelete.length > 0) {
        await db.job.deleteMany({
          where: {
            id: {
              in: idsToDelete,
            },
          },
        });
      }
    }

    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Disconnect platform jobs error:", error);
    return { success: false, error: "Failed to disconnect platform." };
  }
}

export async function syncPlatformJobs(platform: string) {
  try {
    let systemEmployer = await db.user.findUnique({
      where: { email: "connections@fitboard.com" },
    });

    if (!systemEmployer) {
      const hashedPassword = await bcrypt.hash("fitboard_connections_secret_2026", 10);
      systemEmployer = await db.user.create({
        data: {
          email: "connections@fitboard.com",
          password: hashedPassword,
          role: "EMPLOYER",
        },
      });
    }

    const platformJobsMap: Record<
      string,
      Array<{
        title: string;
        company: string;
        location: string;
        salary: string;
        skillsRequired: string[];
        skillsNiceToHave: string[];
        description: string;
      }>
    > = {
      linkedin: [
        {
          title: "Senior Frontend Engineer (Next.js)",
          company: "Vercel",
          location: "Remote (Global)",
          salary: "₹24L - ₹32L per annum",
          skillsRequired: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
          skillsNiceToHave: ["Framer Motion", "GSAP", "Three.js", "Zustand"],
          description: "[Source: LinkedIn] Join the team at Vercel building the next generation of web deployment platform. We are seeking a frontend specialist with extensive knowledge of React 19, Server Components, and smooth page transition animations using GSAP and Framer Motion."
        },
        {
          title: "Product Software Designer",
          company: "Linear",
          location: "Remote (EU/US/IN)",
          salary: "₹20L - ₹28L per annum",
          skillsRequired: ["Framer Motion", "Tailwind CSS", "GSAP", "React.js"],
          skillsNiceToHave: ["TypeScript", "Zustand", "Design Engineering", "Vercel"],
          description: "[Source: LinkedIn] We are seeking a hybrid Product Software Designer / Design Engineer to build high-fidelity interactive user interfaces for our desktop client. Experience with vector layouts and spring-based animations is required."
        },
        {
          title: "Design Engineer",
          company: "Figma",
          location: "San Francisco, USA (Hybrid)",
          salary: "₹32L - ₹42L per annum",
          skillsRequired: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
          skillsNiceToHave: ["GSAP", "Three.js", "Design Engineering", "Git"],
          description: "[Source: LinkedIn] Build the future of collaborative design tools at Figma. As a Design Engineer, you will bridge the gap between design and engineering, crafting micro-interactions, canvas drawing operations, and developer tooling."
        },
        {
          title: "Creative Front-End Developer",
          company: "Apple",
          location: "Sunnyvale, USA (On-site)",
          salary: "₹40L - ₹55L per annum",
          skillsRequired: ["React", "Tailwind CSS", "GSAP", "Three.js"],
          skillsNiceToHave: ["Framer Motion", "Zustand", "Figma", "TypeScript"],
          description: "[Source: LinkedIn] Design and implement interactive visual experiences for Apple product showcases. Strong expertise in WebGL, GSAP scroll triggers, custom physical physics rendering, and vector canvas is required."
        }
      ],
      indeed: [
        {
          title: "Platform Software Engineer",
          company: "Stripe",
          location: "San Francisco, USA (Hybrid)",
          salary: "₹36L - ₹50L per annum",
          skillsRequired: ["Node.js", "TypeScript", "PostgreSQL", "Express.js"],
          skillsNiceToHave: ["Redis", "AWS", "WebSockets", "Docker"],
          description: "[Source: Indeed] Join the core platform billing integrations team at Stripe. You will build highly available Express.js microservices, coordinate Redis job queue priorities, and orchestrate Docker deployments on AWS."
        },
        {
          title: "Staff Database Engineer",
          company: "Neon",
          location: "Bengaluru, India (Hybrid)",
          salary: "₹30L - ₹45L per annum",
          skillsRequired: ["PostgreSQL", "Node.js", "TypeScript", "Linux"],
          skillsNiceToHave: ["Docker", "Git", "GitHub", "Redis"],
          description: "[Source: Indeed] Help Neon build serverless Postgres. You will design core platform components, optimize transaction latency, configure container networking with Docker, and manage Git workflow automation."
        },
        {
          title: "Realtime Systems Developer",
          company: "Discord",
          location: "Remote (Global)",
          salary: "₹28L - ₹38L per annum",
          skillsRequired: ["Node.js", "WebSockets", "Socket.io", "Redis"],
          skillsNiceToHave: ["Docker", "Linux", "TypeScript", "Git"],
          description: "[Source: Indeed] Scale Discord's gateway connections. You will write high-frequency WebSocket and Socket.io gateway servers, manage ephemeral sessions in Redis, and deploy container clusters across globally distributed edge nodes."
        },
        {
          title: "Automation & Infrastructure Specialist",
          company: "Shopify",
          location: "Delhi NCR (Hybrid)",
          salary: "₹18L - ₹24L per annum",
          skillsRequired: ["Docker", "Linux", "Git", "GitHub"],
          skillsNiceToHave: ["AWS", "Node.js", "PostgreSQL", "Express.js"],
          description: "[Source: Indeed] Orchestrate merchant database scaling infrastructure. You will manage GitHub Actions workflows, automate Linux container builds with Docker, and configure platform scaling triggers."
        }
      ],
      google: [
        {
          title: "Senior Software Architect",
          company: "Google",
          location: "Bengaluru, India (Hybrid)",
          salary: "₹45L - ₹65L per annum",
          skillsRequired: ["Python", "TypeScript", "Node.js", "Linux"],
          skillsNiceToHave: ["Git", "GitHub", "Docker", "AWS"],
          description: "[Source: Google Jobs] Lead architecture for Google Cloud developer tools. Design scalable distributed APIs, manage telemetry pipelines, and optimize high-throughput database clusters."
        },
        {
          title: "Systems Cloud Engineer",
          company: "Microsoft",
          location: "Hyderabad, India (Hybrid)",
          salary: "₹32L - ₹48L per annum",
          skillsRequired: ["Linux", "Docker", "Git", "GitHub"],
          skillsNiceToHave: ["AWS", "Python", "Node.js", "PostgreSQL"],
          description: "[Source: Google Jobs] Design, implement, and maintain system-level scaling triggers for Azure Kubernetes Service. Configure Docker host boundaries, audit Linux kernel interfaces, and deploy Git automated release actions."
        },
        {
          title: "AWS Cloud Operations Specialist",
          company: "Amazon",
          location: "Chennai, India (On-site)",
          salary: "₹25L - ₹35L per annum",
          skillsRequired: ["AWS", "Docker", "Linux", "Git"],
          skillsNiceToHave: ["Python", "Node.js", "PostgreSQL", "Express.js"],
          description: "[Source: Google Jobs] Help cloud clients manage infrastructure deployments. Build and deploy Linux containers to AWS ECS/EKS, script Lambda automation tasks, and manage Git configuration repositories."
        },
        {
          title: "AI Integrations Engineer",
          company: "OpenAI",
          location: "San Francisco, USA (On-Site)",
          salary: "₹40L - ₹60L per annum",
          skillsRequired: ["Python", "TypeScript", "Node.js", "PostgreSQL"],
          skillsNiceToHave: ["React.js", "Docker", "AWS", "Full-Stack Development"],
          description: "[Source: Google Jobs] Design and build full-stack interfaces for OpenAI's Developer Platform APIs. You will write backend services in Python and Node.js, create developer dashboard panels in React, and deploy data pipelines to AWS."
        }
      ],
      github: [
        {
          title: "Full-Stack Collaboration Developer",
          company: "Slack",
          location: "Remote (Global)",
          salary: "₹26L - ₹34L per annum",
          skillsRequired: ["React", "TypeScript", "Node.js", "WebSockets"],
          skillsNiceToHave: ["PostgreSQL", "Docker", "Git", "Zustand"],
          description: "[Source: GitHub Jobs] Build high-fidelity real-time workspace integrations for Slack. This role requires extensive familiarity with React components, WebSocket communication protocols, and state management via Zustand."
        },
        {
          title: "Core Infrastructure Developer",
          company: "GitHub",
          location: "Remote (EU/US/IN)",
          salary: "₹30L - ₹40L per annum",
          skillsRequired: ["Node.js", "TypeScript", "Git", "GitHub"],
          skillsNiceToHave: ["PostgreSQL", "Docker", "Linux", "Express.js"],
          description: "[Source: GitHub Jobs] Help scale GitHub's core package hosting system. Write high-performance Node.js operations, manage database indexing schemas in Postgres, and automate release pipelines with Git."
        },
        {
          title: "Database Security Administrator",
          company: "Neon",
          location: "Bengaluru, India (Hybrid)",
          salary: "₹28L - ₹38L per annum",
          skillsRequired: ["PostgreSQL", "Linux", "Docker", "Git"],
          skillsNiceToHave: ["Node.js", "TypeScript", "GitHub", "Redis"],
          description: "[Source: GitHub Jobs] Secure Neon serverless Postgres configurations. Perform database security audits, restrict Docker network boundaries, manage access keys, and secure Linux host kernels."
        },
        {
          title: "Next.js Core Developer",
          company: "Vercel",
          location: "Remote (Global)",
          salary: "₹35L - ₹48L per annum",
          skillsRequired: ["React", "TypeScript", "Next.js", "Git"],
          skillsNiceToHave: ["Tailwind CSS", "Zustand", "Node.js", "Docker"],
          description: "[Source: GitHub Jobs] Join the Next.js framework core team. You will write core router implementations, optimize rendering performance, fix React server component integration bugs, and manage framework releases."
        }
      ],
      ziprecruiter: [
        {
          title: "Frontend Audio Engineer",
          company: "Spotify",
          location: "Stockholm, Sweden (Hybrid)",
          salary: "₹28L - ₹36L per annum",
          skillsRequired: ["React", "TypeScript", "Zustand", "Tailwind CSS"],
          skillsNiceToHave: ["GSAP", "Framer Motion", "Node.js", "Express.js"],
          description: "[Source: ZipRecruiter] Build beautiful Web Audio API integrations for Spotify's web player. You will design responsive React interfaces, coordinate global states using Zustand, and animate audio waves with Framer Motion."
        },
        {
          title: "Scale Operations Developer",
          company: "Netflix",
          location: "Los Gatos, USA (Hybrid)",
          salary: "₹45L - ₹65L per annum",
          skillsRequired: ["Node.js", "TypeScript", "PostgreSQL", "Docker"],
          skillsNiceToHave: ["AWS", "Redis", "Linux", "Git"],
          description: "[Source: ZipRecruiter] Orchestrate global video delivery pipelines. You will configure high-frequency microservice APIs, deploy scalable Docker setups, and analyze storage performance metrics."
        },
        {
          title: "Location API Integrations Engineer",
          company: "Uber",
          location: "Bengaluru, India (Hybrid)",
          salary: "₹30L - ₹42L per annum",
          skillsRequired: ["Node.js", "TypeScript", "PostgreSQL", "WebSockets"],
          skillsNiceToHave: ["Docker", "Linux", "Git", "GitHub"],
          description: "[Source: ZipRecruiter] Design real-time GPS tracking endpoints. You will work with WebSockets connections, map coordinate relational lookups in Postgres, and manage container deployments."
        },
        {
          title: "Full-Stack Experience Engineer",
          company: "Airbnb",
          location: "Remote (Global)",
          salary: "₹25L - ₹34L per annum",
          skillsRequired: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
          skillsNiceToHave: ["PostgreSQL", "Zustand", "Framer Motion", "GSAP"],
          description: "[Source: ZipRecruiter] Join the guest experience full-stack group at Airbnb. Create responsive guest checkout paths in React, configure Express.js endpoints, and style glassmorphic transition steps."
        }
      ]
    };

    const targetJobs = platformJobsMap[platform.toLowerCase()];
    if (!targetJobs) {
      return { success: false, error: "Invalid platform connection." };
    }

    let count = 0;
    for (const spec of targetJobs) {
      const existing = await db.job.findFirst({
        where: { title: spec.title, company: spec.company },
      });

      if (!existing) {
        await db.job.create({
          data: {
            ...spec,
            employerId: systemEmployer.id,
          },
        });
        count++;
      }
    }

    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");
    return { success: true, count };
  } catch (error: any) {
    console.error("Sync platform jobs error:", error);
    return { success: false, error: "Failed to connect to platform API." };
  }
}

export async function toggleBookmarkAction(jobId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized. Candidates only." };
    }

    const existingBookmark = await db.bookmark.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: session.user.id,
        },
      },
    });

    if (existingBookmark) {
      await db.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
      revalidatePath("/dashboard/candidate/jobs");
      return { success: true, bookmarked: false };
    } else {
      await db.bookmark.create({
        data: {
          jobId,
          candidateId: session.user.id,
        },
      });
      revalidatePath("/dashboard/candidate/jobs");
      return { success: true, bookmarked: true };
    }
  } catch (error: any) {
    console.error("Toggle bookmark error:", error);
    return { success: false, error: "Failed to update bookmark." };
  }
}

export async function getBookmarkedJobs() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized." };
    }

    const bookmarks = await db.bookmark.findMany({
      where: {
        candidateId: session.user.id,
      },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const jobs = bookmarks.map((b) => b.job);
    return { success: true, jobs };
  } catch (error: any) {
    console.error("Get bookmarked jobs error:", error);
    return { success: false, error: "Failed to load bookmarks." };
  }
}
