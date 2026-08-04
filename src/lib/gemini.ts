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
  "Illustrator", "Photoshop", "After Effects", "IBM watsonx",
  // Concepts
  "REST API", "GraphQL", "WebSockets", "Socket.io", "gRPC",
  "Microservices", "System Design", "Agile", "Scrum",
  "Machine Learning", "Deep Learning", "Data Analysis", "Data Science",
  "Prisma", "Drizzle", "Mongoose", "Sequelize",
  // Design
  "UI/UX Design", "Responsive Design", "Wireframing", "Prototyping",
];

// ─── Degree prefixes / University keywords ──────────────────────────────────
const DEGREE_PATTERNS = [
  /b\.?\s*tech/i, /b\.?\s*e\b/i, /b\.?\s*sc/i, /b\.?\s*com/i, /bba/i,
  /m\.?\s*tech/i, /m\.?\s*e\b/i, /m\.?\s*sc/i, /mba/i, /phd/i, /ph\.d/i,
  /bachelor/i, /master/i, /diploma/i, /associate/i,
];
const UNI_KEYWORDS = /university|college|institute|school|iit|nit|bits|iiit|vit|lpu|du|mu|pu/i;
const YEAR_RANGE = /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|ongoing|current)\b/i;

// ─── Job title keywords ──────────────────────────────────────────────────────
const JOB_TITLE_PATTERNS = /\b(intern|engineer|developer|designer|manager|analyst|consultant|lead|architect|specialist|officer|director|vp|cto|ceo|founder|co-founder)\b/i;

/**
 * Attempts to extract a clean education line from a group of raw lines.
 * Returns formatted: "Degree in Major - Institution (Years)" or best available.
 */
function parseEducationLines(rawLines: string[]): string[] {
  const results: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line || line.length < 5 || line.length > 200) continue;

    const hasDegree = DEGREE_PATTERNS.some((p) => p.test(line));
    const hasUni = UNI_KEYWORDS.test(line);

    if (hasDegree || hasUni) {
      // Try to assemble a clean single line by peeking at neighbors
      let combined = line;
      if (i + 1 < rawLines.length && rawLines[i + 1].trim().length > 3) {
        const next = rawLines[i + 1].trim();
        // Merge if next line looks like a continuation (year range, university name)
        if (
          YEAR_RANGE.test(next) ||
          (UNI_KEYWORDS.test(next) && !hasDegree) ||
          (hasDegree && !hasUni && UNI_KEYWORDS.test(next))
        ) {
          combined = `${line} - ${next}`;
          i++; // skip next line
        }
      }

      // Clean up excess whitespace
      const clean = combined.replace(/\s{2,}/g, " ").replace(/\s*[|]\s*/g, " | ").trim();
      const key = clean.toLowerCase().slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        results.push(clean);
      }
    }
  }

  return results.slice(0, 4);
}

/**
 * Attempts to extract clean experience lines.
 * Returns formatted: "Job Title - Company (Dates)"
 */
function parseExperienceLines(rawLines: string[]): string[] {
  const results: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line || line.length < 5 || line.length > 160) continue;

    const hasTitle = JOB_TITLE_PATTERNS.test(line);
    const hasYear = YEAR_RANGE.test(line);

    if (hasTitle) {
      let combined = line;
      // Check next line for date range
      if (!hasYear && i + 1 < rawLines.length) {
        const next = rawLines[i + 1].trim();
        if (YEAR_RANGE.test(next)) {
          combined = `${line} (${next})`;
          i++;
        }
      }

      const clean = combined.replace(/\s{2,}/g, " ").replace(/\s*[|]\s*/g, " | ").trim();
      // Only keep concise lines that look like job titles, not bullet points
      if (clean.length <= 120 && !clean.startsWith("•") && !clean.startsWith("-")) {
        const key = clean.toLowerCase().slice(0, 40);
        if (!seen.has(key)) {
          seen.add(key);
          results.push(clean);
        }
      }
    }
  }

  return results.slice(0, 5);
}

/**
 * Keyword-based rule parser — used when Gemini API is unavailable.
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
  if (/\bGSAP\b/i.test(text)) skillsSet.add("GSAP");
  if (/\bBlender\b/i.test(text)) skillsSet.add("Blender");
  if (/\bPostman\b/i.test(text)) skillsSet.add("Postman");
  if (/\b(CorelDraw|Corel Draw)\b/i.test(text)) skillsSet.add("CorelDraw");
  if (/\bIllustrator\b/i.test(text)) skillsSet.add("Illustrator");
  if (/\b(Framer Motion|Framer)\b/i.test(text)) skillsSet.add("Framer Motion");

  const skills = Array.from(skillsSet);

  const rawLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && !/^[%<>{}\[\]\\]/.test(l));

  const education = parseEducationLines(rawLines);
  const experience = parseExperienceLines(rawLines);

  return { skills, education, experience };
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
  "education": ["Degree in Major - Institution Name (Start Year – End Year or Expected)"],
  "experience": ["Job Title - Company Name (Month Year – Month Year)"]
}

Rules:
- Extract ALL technical skills, tools, programming languages, frameworks, and design skills mentioned.
- For education: format as "Degree in Major - Institution (Start – End)" e.g. "B.Tech in Computer Science - Assam Down Town University (2024 – 2028)".
- For experience: format as "Title - Company (Dates)" e.g. "UI/UX Design Intern - Reve Cult (Sep – Nov 2025)".
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
