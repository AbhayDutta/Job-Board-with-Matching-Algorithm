import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding more jobs to the database...");

  // Find or create connections employer
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

  const moreJobs = [
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

  let addedCount = 0;
  for (const job of moreJobs) {
    const existing = await db.job.findFirst({
      where: { title: job.title, company: job.company },
    });

    if (!existing) {
      await db.job.create({
        data: {
          title: job.title,
          description: job.description,
          company: job.company,
          location: job.location,
          salary: job.salary,
          skillsRequired: job.skillsRequired,
          skillsNiceToHave: job.skillsNiceToHave,
          employerId: systemEmployer.id,
        },
      });
      console.log(`Added: ${job.title} at ${job.company}`);
      addedCount++;
    } else {
      console.log(`Already exists: ${job.title} at ${job.company}`);
    }
  }

  console.log(`Success! Seeding complete. Added ${addedCount} new job postings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
