import { GoogleGenerativeAI } from "@google/generative-ai";

interface ParsedResume {
  skills: string[];
  education: string[];
  experience: string[];
}

// ─── Master skill keyword list for matching ────────────────────────────────
const ALL_TECH_SKILLS = [
  "JavaScript", "TypeScript", "Java", "Python", "C++", "C#", "C", "Go", "Rust",
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "SQL", "HTML5", "HTML",
  "CSS3", "CSS", "React", "React.js", "Next.js", "Vue.js", "Angular", "Svelte",
  "Tailwind CSS", "Tailwind", "Bootstrap", "Sass", "SCSS", "Framer Motion",
  "GSAP", "Three.js", "Shadcn UI", "Shadcn", "Recharts", "Redux", "Zustand",
  "Webpack", "Vite", "Node.js", "Express.js", "NestJS", "Django", "Flask",
  "FastAPI", "Spring Boot", "Laravel", "PostgreSQL", "MongoDB", "Mongoose",
  "MySQL", "SQLite", "Redis", "Firebase", "Supabase", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "Vercel", "Netlify", "CI/CD", "Git", "GitHub", "Postman",
  "Jira", "Figma", "VS Code", "Blender", "CorelDraw", "Illustrator", "Photoshop",
  "UI/UX Design", "REST API", "GraphQL", "WebSockets", "Socket.io", "Prisma",
  "Drizzle", "JWT", "Google OAuth", "OAuth", "Zod", "Multer"
];

const DEGREE_PATTERNS = [
  /b\.?\s*tech/i, /b\.?\s*e\b/i, /b\.?\s*sc/i, /b\.?\s*com/i, /bba/i, /bca/i,
  /m\.?\s*tech/i, /m\.?\s*e\b/i, /m\.?\s*sc/i, /mba/i, /mca/i, /phd/i, /ph\.d/i,
  /bachelor/i, /master/i, /diploma/i, /associate/i, /degree/i, /high school/i
];
const UNI_KEYWORDS = /university|college|institute|school|academy|iit|nit|bits|iiit|vit|lpu|du|mu|pu|adamas/i;
const YEAR_RANGE = /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|ongoing|current|expected\s+(may|june|july|august|september|october|november|december)?\s*(19|20)\d{2})\b/i;

const JOB_TITLE_PATTERNS = /\b(creator|intern|engineer|developer|designer|manager|analyst|consultant|lead|architect|specialist|officer|director|vp|cto|ceo|founder|co-founder|associate|trainee|freelancer|writer|content)\b/i;

/**
 * Fallback parser — extracts actual skills, college names, and experience directly from text.
 */
function fallbackRuleBasedParser(text: string): ParsedResume {
  const skillsSet = new Set<string>();
  const rawLines = (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Scan explicit skill category lines e.g. "Languages: JavaScript, TypeScript" or "Frontend: React, Next.js"
  for (const line of rawLines) {
    if (/^(languages|frontend|backend|tools|technical skills|skills|frameworks|database|technologies):/i.test(line)) {
      const parts = line.split(/:(.+)/)[1] || "";
      const tokens = parts.split(/[,•|/]/).map((t) => t.trim()).filter((t) => t.length > 0 && t.length < 30);
      tokens.forEach((t) => {
        // Clean trailing dots
        const cleanToken = t.replace(/\.$/, "").trim();
        if (cleanToken) skillsSet.add(cleanToken);
      });
    }
  }

  // 2. Scan keywords across full text
  for (const skill of ALL_TECH_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      skillsSet.add(skill);
    }
  }

  // Shorthand matchers
  if (/\b(JS|JavaScript)\b/i.test(text)) skillsSet.add("JavaScript");
  if (/\b(TS|TypeScript)\b/i.test(text)) skillsSet.add("TypeScript");
  if (/\b(React|ReactJS|React\.js)\b/i.test(text)) skillsSet.add("React");
  if (/\b(Next|NextJS|Next\.js)\b/i.test(text)) skillsSet.add("Next.js");
  if (/\b(Node|NodeJS|Node\.js)\b/i.test(text)) skillsSet.add("Node.js");
  if (/\b(Express|ExpressJS|Express\.js)\b/i.test(text)) skillsSet.add("Express.js");
  if (/\b(Tailwind|TailwindCSS)\b/i.test(text)) skillsSet.add("Tailwind CSS");
  if (/\b(UI\/UX|UX\/UI)\b/i.test(text)) skillsSet.add("UI/UX Design");

  const skills = Array.from(skillsSet);

  // 3. Scan Education Section — ALWAYS INCLUDE COLLEGE NAME
  const education: string[] = [];
  let inEdu = false;
  let currentEduTokens: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (/^education|academic|qualification/i.test(line)) {
      inEdu = true;
      continue;
    }
    if (inEdu && /^experience|projects|technical skills|skills|summary|work history/i.test(line)) {
      inEdu = false;
    }

    if (inEdu) {
      const isUni = UNI_KEYWORDS.test(line);
      const isDegree = DEGREE_PATTERNS.some((p) => p.test(line));
      if (isUni || isDegree || line.length < 120) {
        if (!line.toLowerCase().includes("education")) {
          currentEduTokens.push(line);
        }
      }
    }
  }

  if (currentEduTokens.length > 0) {
    // Join university name + degree
    education.push(currentEduTokens.slice(0, 3).join(" - "));
  } else {
    // Search general text for university + degree line
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (UNI_KEYWORDS.test(line)) {
        let combined = line;
        if (i + 1 < rawLines.length && DEGREE_PATTERNS.some((p) => p.test(rawLines[i + 1]))) {
          combined = `${line} - ${rawLines[i + 1]}`;
        }
        education.push(combined);
        break;
      }
    }
  }

  // 4. Scan Experience / Internships Section — IF NONE PRESENT, KEEP IT BLANK ([])
  const experience: string[] = [];
  let inExp = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (/^experience|work history|employment|internship/i.test(line)) {
      inExp = true;
      continue;
    }
    if (inExp && /^projects|technical skills|skills|education|summary|certifications/i.test(line)) {
      inExp = false;
    }

    if (inExp) {
      const hasTitle = JOB_TITLE_PATTERNS.test(line);
      const hasYear = YEAR_RANGE.test(line);
      if ((hasTitle || hasYear) && !line.startsWith("•") && !line.startsWith("-") && line.length < 140) {
        let entry = line;
        if (i + 1 < rawLines.length && (YEAR_RANGE.test(rawLines[i + 1]) || rawLines[i + 1].includes("—"))) {
          if (!entry.includes(rawLines[i + 1])) {
            entry = `${line} ${rawLines[i + 1]}`;
          }
        }
        if (!experience.some((ex) => ex.toLowerCase().includes(entry.toLowerCase().slice(0, 20)))) {
          experience.push(entry);
        }
      }
    }
  }

  return {
    skills: skills.slice(0, 35),
    education: education.slice(0, 4),
    experience: experience.slice(0, 5),
  };
}

/**
 * Parses raw resume text into structured JSON using Gemini AI or section fallback parser.
 */
export async function parseResumeWithGemini(
  resumeText: string
): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
  ];

  if (apiKey && resumeText && resumeText.trim().length > 30) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Gemini] Attempting extraction with model: ${modelName}`);

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" },
          });

          const prompt = `
You are an expert ATS (Applicant Tracking System) resume parser.
Extract structured information from the resume text provided below.

STRICT ACCURACY INSTRUCTIONS:
1. SKILLS: Extract ALL technical skills, programming languages, frameworks, libraries, tools, and design tools explicitly listed in the resume (e.g. JavaScript, TypeScript, React, Next.js, Tailwind CSS, Node.js, Express.js, MongoDB, Mongoose, JWT, Google OAuth, Zod, Multer, Git, GitHub, Postman, Vercel, Figma, VS Code, etc.).
2. EDUCATION HISTORY: Extract the candidate's education background. Include the EXACT College / University name, degree (e.g. Bachelor of Technology in CS), and dates. Format: "College Name - Degree (Dates)".
3. PROFESSIONAL EXPERIENCE: Extract actual work experience, jobs, or internships listed. Format: "Job Title/Role - Company Name (Dates)".
4. CRITICAL RULE FOR EXPERIENCE: If there is NO work experience or internship section present in the resume, return an EMPTY ARRAY [] for experience.
5. Do NOT invent, assume, or add fake default data under any circumstances.

Respond strictly with valid JSON:
{
  "skills": ["Skill1", "Skill2", ...],
  "education": ["College Name - Degree (Dates)"],
  "experience": ["Job Title - Company Name (Dates)"]
}

Resume Text:
${resumeText.slice(0, 12000)}
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
            `[Gemini Success] Extracted ${skills.length} skills, ${education.length} edu, ${experience.length} exp`
          );

          return {
            skills: skills.length > 0 ? skills : fallbackRuleBasedParser(resumeText).skills,
            education: education.length > 0 ? education : fallbackRuleBasedParser(resumeText).education,
            experience: experience, // Keep blank if empty!
          };
        } catch (err: any) {
          console.warn(`[Gemini] Model ${modelName} error: ${err?.message}`);
        }
      }
    } catch (err: any) {
      console.warn("[Gemini] SDK error:", err?.message);
    }
  }

  // Fallback: rule-based parser
  console.log("[Resume Parser] Using section fallback text extractor.");
  return fallbackRuleBasedParser(resumeText);
}
