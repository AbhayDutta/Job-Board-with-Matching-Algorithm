import { GoogleGenerativeAI } from "@google/generative-ai";

interface ParsedResume {
  skills: string[];
  education: string[];
  experience: string[];
}

// ─── Master skill keyword list ───────────────────────────────────────────────
const ALL_TECH_SKILLS = [
  // Languages
  "JavaScript", "TypeScript", "Java", "Python", "C++", "C#", "Go", "Rust",
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB",
  // Frontend
  "HTML", "CSS", "React.js", "Next.js", "Vue.js", "Angular", "Svelte",
  "Tailwind CSS", "Bootstrap", "Sass", "SCSS", "Framer Motion", "GSAP",
  "Three.js", "Redux", "Zustand", "Webpack", "Vite", "PWA",
  // Backend
  "Node.js", "Express.js", "NestJS", "Django", "Flask", "FastAPI",
  "Spring Boot", "Laravel", "Rails", "ASP.NET",
  // Databases
  "PostgreSQL", "MongoDB", "MySQL", "SQLite", "Redis", "Firebase",
  "Supabase", "Cassandra", "DynamoDB",
  // DevOps / Cloud
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Vercel", "Netlify",
  "CI/CD", "GitHub Actions", "Jenkins", "Terraform", "Linux",
  // Tools
  "Git", "GitHub", "Postman", "Jira", "Figma", "Blender", "CorelDraw",
  "Illustrator", "Photoshop", "After Effects",
  // Concepts
  "REST API", "GraphQL", "WebSockets", "Socket.io", "gRPC",
  "Microservices", "System Design", "Agile", "Scrum",
  "Machine Learning", "Deep Learning", "Data Analysis", "Data Science",
  "Prisma", "Drizzle", "Mongoose", "Sequelize",
  // Design
  "UI/UX Design", "Responsive Design", "Wireframing", "Prototyping",
];

/**
 * Keyword-based rule parser — used when Gemini API is unavailable.
 * Returns only what it actually finds in the resume text.
 */
function fallbackRuleBasedParser(resumeText: string): ParsedResume {
  const skillsSet = new Set<string>();
  const text = resumeText;

  for (const skill of ALL_TECH_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) skillsSet.add(skill);
  }

  // Short-form aliases
  if (/\b(JS|JavaScript)\b/i.test(text)) skillsSet.add("JavaScript");
  if (/\b(TS|TypeScript)\b/i.test(text)) skillsSet.add("TypeScript");
  if (/\b(React|ReactJS|React\.js)\b/i.test(text)) skillsSet.add("React.js");
  if (/\b(Next|NextJS|Next\.js)\b/i.test(text)) skillsSet.add("Next.js");
  if (/\b(Node|NodeJS|Node\.js)\b/i.test(text)) skillsSet.add("Node.js");
  if (/\b(Express|ExpressJS|Express\.js)\b/i.test(text)) skillsSet.add("Express.js");
  if (/\b(Tailwind|TailwindCSS)\b/i.test(text)) skillsSet.add("Tailwind CSS");
  if (/\b(UI\/UX|UX\/UI)\b/i.test(text)) skillsSet.add("UI/UX Design");

  const skills = Array.from(skillsSet);

  const rawLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  // Education: lines mentioning degrees, schools, GPA, etc.
  const educationMatches = rawLines.filter((l) =>
    /b\.?tech|b\.?e\b|bsc|msc|m\.?tech|m\.?e\b|bachelor|master|phd|mba|diploma|degree|university|college|school|institute|education|engineering|science|gpa|sgpa|cgpa/i.test(l)
  );

  // Experience: lines mentioning job roles and companies
  const experienceMatches = rawLines.filter((l) =>
    /\b(intern|engineer|developer|designer|manager|analyst|consultant|lead|architect|specialist|officer|director|vp|cto|ceo)\b/i.test(l) &&
    l.length < 120 // avoid grabbing bullet points of achievements
  );

  return {
    skills,
    education: educationMatches.slice(0, 4),
    experience: experienceMatches.slice(0, 5),
  };
}

/**
 * Parses raw resume text into structured JSON using Gemini AI.
 * Falls back to keyword-based parser if the API is unavailable.
 */
export async function parseResumeWithGemini(
  resumeText: string
): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;

  const modelsToTry = [
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
  ];

  if (apiKey && resumeText && resumeText.trim().length > 50) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Gemini] Trying model: ${modelName}`);

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" },
          });

          const prompt = `
You are an expert ATS (Applicant Tracking System) resume parser.
Extract structured information from the resume text below.

Respond ONLY with a valid JSON object:
{
  "skills": ["Skill1", "Skill2", ...],
  "education": ["Degree - Institution (Year range or expected graduation)"],
  "experience": ["Job Title - Company Name (Date range or duration)"]
}

Rules:
- Extract ALL technical skills, tools, programming languages, and design skills mentioned.
- For education: include degree, major, institution, and years (e.g. "B.Tech in Computer Science - MIT (2020 – 2024)").
- For experience: include job title, company, and dates (e.g. "Software Engineer - Google (Jun 2022 – Present)").
- If a section has no clear data, return an empty array [].
- Return ONLY the JSON. No markdown, no explanation.

Resume text:
${resumeText.slice(0, 8000)}
          `;

          const result = await model.generateContent(prompt);
          const raw = result.response.text();
          if (!raw) continue;

          let cleaned = raw.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned
              .replace(/^```json\s*/i, "")
              .replace(/```$/, "")
              .trim();
          }

          const data = JSON.parse(cleaned);
          const skills = Array.isArray(data.skills)
            ? data.skills.map((s: any) => String(s).trim()).filter(Boolean)
            : [];
          const education = Array.isArray(data.education)
            ? data.education.map((e: any) => String(e).trim()).filter(Boolean)
            : [];
          const experience = Array.isArray(data.experience)
            ? data.experience.map((ex: any) => String(ex).trim()).filter(Boolean)
            : [];

          console.log(
            `[Gemini] Parsed: ${skills.length} skills, ${education.length} edu, ${experience.length} exp`
          );
          return { skills, education, experience };
        } catch (err: any) {
          console.warn(`[Gemini] Model ${modelName} failed: ${err?.message}`);
        }
      }
    } catch (err: any) {
      console.warn("[Gemini] SDK init failed:", err?.message);
    }
  }

  // Fallback: keyword-based parser
  console.log("[Gemini] Using keyword-based fallback parser.");
  return fallbackRuleBasedParser(resumeText);
}
