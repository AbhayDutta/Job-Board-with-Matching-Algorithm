import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const companies = [
  "Vercel", "Supabase", "Linear", "Figma", "Neon", "Discord", "OpenAI", "Shopify", "Apple", "Google",
  "Microsoft", "Amazon", "Slack", "Netflix", "Uber", "Airbnb", "Meta", "Adobe", "Canva", "Retool",
  "Webflow", "Clerk", "Inngest", "Resend", "Prisma", "Railway", "Fly.io", "Hugging Face", "Anthropic",
  "Midjourney", "Framer", "Notion", "Spotify", "Pinterest", "Zoom", "Slack", "Stripe", "Auth0", "Datadog",
  "Sentry", "Postman", "Twilio", "Cloudflare", "HashiCorp", "Vanta", "Linear", "Retool", "Buster", "Airtable"
];

const locations = [
  "Remote (Global)", "San Francisco, USA", "New York, USA", "Seattle, USA", "Bengaluru, India",
  "Hyderabad, India", "Singapore", "Tokyo, Japan", "London, UK", "Berlin, Germany", "Paris, France",
  "Sydney, Australia", "Remote (US)", "Remote (EU)", "Remote (APAC)", "Toronto, Canada", "Amsterdam, Netherlands"
];

const salaryRanges = [
  "₹12L - ₹18L per annum", "₹18L - ₹25L per annum", "₹25L - ₹35L per annum", "₹35L - ₹48L per annum",
  "₹48L - ₹65L per annum", "₹65L - ₹90L per annum", "₹80k - ₹120k USD/yr", "₹120k - ₹160k USD/yr",
  "₹160k - ₹220k USD/yr", "₹14L - ₹20L per annum", "₹20L - ₹30L per annum"
];

const frontendSkills = ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vue", "Angular", "Svelte", "Redux", "Zustand", "HTML5", "CSS3", "JavaScript", "Framer Motion", "GSAP", "Three.js", "WebGL"];
const backendSkills = ["Node.js", "Express.js", "NestJS", "Go", "Golang", "Python", "Django", "FastAPI", "Ruby", "Rails", "Java", "Spring Boot", "C#", ".NET", "Rust", "GraphQL", "REST APIs"];
const dbSkills = ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "Prisma", "Drizzle", "Mongoose", "Cassandra", "Neo4j"];
const devopsSkills = ["Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Terraform", "CI/CD", "GitHub Actions", "Linux", "Nginx", "Prometheus", "Grafana"];
const mobileSkills = ["React Native", "Flutter", "Swift", "SwiftUI", "Kotlin", "Android SDK", "Objective-C", "Dart"];
const aiSkills = ["Python", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "NumPy", "SQL", "OpenAI API", "LangChain", "Hugging Face"];
const designSkills = ["Figma", "Adobe XD", "Sketch", "Framer", "Illustrator", "Photoshop", "After Effects", "Blender", "Cinema 4D", "Design Systems", "Typography", "Color Theory", "Wireframing", "Prototyping", "User Research"];

const templates = [
  // Tech: Frontend
  {
    titles: ["Senior Frontend Engineer", "Staff Frontend Developer", "Creative Frontend Developer", "UI Engineer", "Web Applications Developer", "Lead Frontend Developer"],
    skillsReq: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
    skillsNice: ["Next.js", "Framer Motion", "GSAP", "Zustand", "Redux"],
    desc: "We are seeking a talented frontend specialist to design and implement highly polished, responsive web experiences. You will collaborate with design teams, optimize rendering cycles, establish modular components, and build smooth UI animation flows."
  },
  // Tech: Backend
  {
    titles: ["Staff Backend Developer", "Senior API Engineer", "Backend Systems Engineer", "Lead Backend Developer", "Microservices Engineer", "Infrastructure Developer"],
    skillsReq: ["Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    skillsNice: ["Docker", "Redis", "Express.js", "GraphQL", "NestJS", "Kubernetes"],
    desc: "Join our core backend systems team. You will be responsible for designing database schemas, scaling high-frequency API endpoints, building background task processing systems, and securing endpoints across our microservices architecture."
  },
  // Tech: Full-Stack
  {
    titles: ["Full-Stack Engineer", "Senior Full-Stack Developer", "Software Development Engineer (Full-Stack)", "Solutions Architect", "Product Engineer"],
    skillsReq: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    skillsNice: ["Next.js", "Tailwind CSS", "Prisma", "Drizzle", "Docker", "Git"],
    desc: "Looking for a versatile engineer who enjoys working across both frontend client apps and backend databases. You will own features from design documents to staging, maintain integrations, and optimize overall site latency."
  },
  // Tech: DevOps
  {
    titles: ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Operations Architect", "Platform Infrastructure Engineer", "Automation Specialist"],
    skillsReq: ["Docker", "Linux", "Git", "GitHub Actions"],
    skillsNice: ["AWS", "Google Cloud", "Kubernetes", "Terraform", "Nginx", "CI/CD"],
    desc: "Responsible for scaling and securing our infrastructure pipelines. You will orchestrate container configurations, maintain deployment automation playbooks, configure monitoring metrics, and manage host environments."
  },
  // Tech: AI & Data
  {
    titles: ["Data Scientist", "Machine Learning Engineer", "AI Integrations Specialist", "NLP Engineer", "Data Pipeline Developer"],
    skillsReq: ["Python", "SQL", "Pandas", "Scikit-Learn"],
    skillsNice: ["OpenAI API", "PyTorch", "TensorFlow", "LangChain", "Hugging Face", "Docker"],
    desc: "We are looking for an AI/Data specialist to build machine learning models, parse vector embeddings, set up NLP search pipelines, and integrate generative models directly into our core product features."
  },
  // Tech: Mobile
  {
    titles: ["Senior Mobile App Engineer", "React Native Developer", "iOS Developer", "Android Developer", "Flutter Developer"],
    skillsReq: ["TypeScript", "Swift", "Kotlin", "Git"],
    skillsNice: ["React Native", "Flutter", "SwiftUI", "Android SDK", "REST APIs"],
    desc: "Build fluid, physical mobile user experiences. You will design responsive native layouts, handle background local caching sync states, and optimize app startup times and memory utilization."
  },
  // Designing: UI/UX
  {
    titles: ["UI/UX Designer", "Senior Product Designer", "UX Architect", "Lead Interaction Designer", "User Experience Researcher"],
    skillsReq: ["Figma", "Design Systems", "Prototyping", "Color Theory"],
    skillsNice: ["Framer", "Adobe XD", "Typography", "After Effects", "User Research", "Wireframing"],
    desc: "Own user research and interactive design flows. You will audit user journeys, establish global design systems, draft high-fidelity interactive prototypes, and collaborate with frontend developers to bring designs to life."
  },
  // Designing: Graphic & Motion
  {
    titles: ["Motion Designer", "Lead Visual Animator", "Brand Illustrator", "3D Modeler & Designer", "Creative Brand Designer"],
    skillsReq: ["Photoshop", "Illustrator", "Typography", "Color Theory"],
    skillsNice: ["After Effects", "Blender", "Cinema 4D", "Figma", "Sketch", "Prototyping"],
    desc: "Create beautiful, engaging marketing collateral and visual brand identities. You will design vector logos, script web animations, design immersive 3D mockups, and develop style guidelines."
  },
  // Hybrid: Design Engineer
  {
    titles: ["Design Engineer", "Creative Technologist", "Frontend Design Engineer", "Canvas UI Developer"],
    skillsReq: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    skillsNice: ["GSAP", "Three.js", "WebGL", "SVG RENDERING", "HTML-TO-IMAGE", "Figma"],
    desc: "Bridge the gap between design concepts and front-end reality. You will craft high-end web experiences using custom canvas components, responsive grids, and physical web transitions."
  }
];

async function main() {
  console.log("Cleaning up previous connections jobs...");
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

  // Delete existing seeded jobs to avoid messiness
  await db.job.deleteMany({
    where: { employerId: systemEmployer.id }
  });
  console.log("Previous connections jobs deleted.");

  console.log("Generating 200 jobs covering all tech & design fields...");

  let addedCount = 0;
  const targetCount = 205; // Seed slightly over 200 to guarantee approx 200

  for (let i = 0; i < targetCount; i++) {
    // Select template sequentially to ensure even distribution
    const t = templates[i % templates.length];
    
    // Select random elements
    const title = t.titles[Math.floor(Math.random() * t.titles.length)] + ` (Batch #${Math.floor(i / templates.length) + 1})`;
    const company = companies[i % companies.length];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const salary = salaryRanges[Math.floor(Math.random() * salaryRanges.length)];

    // Combine skills ensuring realistic matches
    const skillsRequired = [...t.skillsReq];
    const skillsNiceToHave = [...t.skillsNice];

    // Randomly add a few additional skills from the category arrays to make them diverse
    if (i % 3 === 0) {
      skillsRequired.push("Git");
    }
    if (i % 5 === 0) {
      skillsNiceToHave.push("GitHub");
    }

    // Build unique job title-company combination description suffix to prevent clashes
    const uniqueDescription = `${t.desc}\n\n[Ref: FB-JOB-${1000 + i}] - At ${company}, we strive for excellence in both software architecture and client onboarding workflows.`;

    await db.job.create({
      data: {
        title,
        company,
        location,
        salary,
        skillsRequired,
        skillsNiceToHave,
        description: uniqueDescription,
        employerId: systemEmployer.id,
      }
    });

    addedCount++;
    if (addedCount % 20 === 0) {
      console.log(`Seeded ${addedCount} jobs...`);
    }
  }

  console.log(`Success! Seeding complete. Added exactly ${addedCount} new jobs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
