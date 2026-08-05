import { GoogleGenerativeAI } from "@google/generative-ai";

interface ParsedResume {
  skills: string[];
  education: string[];
  experience: string[];
}

// ─── Master skill keyword list ───────────────────────────────────────────────
const ALL_TECH_SKILLS = [
  "JavaScript", "TypeScript", "Java", "Python", "C++", "C#", "C", "Go", "Rust",
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "SQL", "HTML", "CSS",
  "React.js", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS",
  "Bootstrap", "Sass", "SCSS", "Framer Motion", "GSAP", "Three.js",
  "Redux", "Zustand", "Webpack", "Vite", "Node.js", "Express.js",
  "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel",
  "PostgreSQL", "MongoDB", "MySQL", "SQLite", "Redis", "Firebase",
  "Supabase", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Vercel",
  "Netlify", "CI/CD", "Git", "GitHub", "Postman", "Jira", "Figma",
  "Blender", "CorelDraw", "Illustrator", "Photoshop", "UI/UX Design",
  "REST API", "GraphQL", "WebSockets", "Socket.io", "Prisma", "Drizzle",
  "Machine Learning", "Deep Learning", "Data Analysis", "Artificial Intelligence",
  "OpenCV", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-Learn"
];

// ─── Degree prefixes / University keywords ──────────────────────────────────
const DEGREE_PATTERNS = [
  /b\.?\s*tech/i, /b\.?\s*e\b/i, /b\.?\s*sc/i, /b\.?\s*com/i, /bba/i, /bca/i,
  /m\.?\s*tech/i, /m\.?\s*e\b/i, /m\.?\s*sc/i, /mba/i, /mca/i, /phd/i, /ph\.d/i,
  /bachelor/i, /master/i, /diploma/i, /associate/i, /degree/i, /high school/i
];
const UNI_KEYWORDS = /university|college|institute|school|academy|iit|nit|bits|iiit|vit|lpu|du|mu|pu/i;
const YEAR_RANGE = /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|ongoing|current)\b/i;

// ─── Job title keywords ──────────────────────────────────────────────────────
const JOB_TITLE_PATTERNS = /\b(intern|engineer|developer|designer|manager|analyst|consultant|lead|architect|specialist|officer|director|vp|cto|ceo|founder|co-founder|associate|trainee|freelancer)\b/i;

/**
 * Attempts to extract clean education lines directly from raw resume text.
 */
function parseEducationLines(rawLines: string[]): string[] {
  const results: string[] = [];
  const seen = new Set<string>();
  let inEducationSection = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    // Detect Education header section
    if (/^education|academic|qualification/i.test(line)) {
      inEducationSection = true;
      continue;
    }
    if (inEducationSection && /^experience|work|projects|skills|summary|certifications/i.test(line)) {
      inEducationSection = false;
    }

    const hasDegree = DEGREE_PATTERNS.some((p) => p.test(line));
    const hasUni = UNI_KEYWORDS.test(line);

    if (hasDegree || hasUni || (inEducationSection && line.length >= 8 && line.length <= 150)) {
      let combined = line;
      if (i + 1 < rawLines.length && rawLines[i + 1].trim().length > 3) {
        const next = rawLines[i + 1].trim();
        if (YEAR_RANGE.test(next) || (UNI_KEYWORDS.test(next) && !hasUni)) {
          combined = `${line} - ${next}`;
          i++;
        }
      }

      const clean = combined.replace(/\s{2,}/g, " ").replace(/\s*[|]\s*/g, " | ").trim();
      const key = clean.toLowerCase().slice(0, 40);
      if (!seen.has(key) && clean.length > 5) {
        seen.add(key);
        results.push(clean);
      }
    }
  }

  return results;
}

/**
 * Attempts to extract clean experience lines directly from raw resume text.
 */
function parseExperienceLines(rawLines: string[]): string[] {
  const results: string[] = [];
  const seen = new Set<string>();
  let inExpSection = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    // Detect Experience header section
    if (/^experience|work history|employment|projects|internships/i.test(line)) {
      inExpSection = true;
      continue;
    }
    if (inExpSection && /^education|skills|summary|certifications|languages/i.test(line)) {
      inExpSection = false;
    }

    const hasTitle = JOB_TITLE_PATTERNS.test(line);
    const hasYear = YEAR_RANGE.test(line);

    if (hasTitle || (inExpSection && hasYear) || (inExpSection && line.length >= 8 && line.length <= 140)) {
      let combined = line;
      if (!hasYear && i + 1 < rawLines.length) {
        const next = rawLines[i + 1].trim();
        if (YEAR_RANGE.test(next)) {
          combined = `${line} (${next})`;
          i++;
        }
      }

      const clean = combined.replace(/\s{2,}/g, " ").replace(/\s*[|]\s*/g, " | ").trim();
      if (clean.length <= 140 && !clean.startsWith("•") && !clean.startsWith("-")) {
        const key = clean.toLowerCase().slice(0, 40);
        if (!seen.has(key) && clean.length > 5) {
          seen.add(key);
          results.push(clean);
        }
      }
    }
  }

  return results;
}

/**
 * Rule-based fallback resume parser — strictly extracts only actual data found in the resume.
 */
function fallbackRuleBasedParser(resumeText: string): ParsedResume {
  const skillsSet = new Set<string>();
  const text = resumeText || "";

  // Exact skill matchers
  for (const skill of ALL_TECH_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) skillsSet.add(skill);
  }

  // Alias & shorthand matchers
  if (/\b(JS|JavaScript)\b/i.test(text)) skillsSet.add("JavaScript");
  if (/\b(TS|TypeScript)\b/i.test(text)) skillsSet.add("TypeScript");
  if (/\b(React|ReactJS|React\.js)\b/i.test(text)) skillsSet.add("React.js");
  if (/\b(Next|NextJS|Next\.js)\b/i.test(text)) skillsSet.add("Next.js");
  if (/\b(Node|NodeJS|Node\.js)\b/i.test(text)) skillsSet.add("Node.js");
  if (/\b(Express|ExpressJS|Express\.js)\b/i.test(text)) skillsSet.add("Express.js");
  if (/\b(Tailwind|TailwindCSS)\b/i.test(text)) skillsSet.add("Tailwind CSS");
  if (/\b(UI\/UX|UX\/UI)\b/i.test(text)) skillsSet.add("UI/UX Design");
  if (/\b(Postgres|PostgreSQL)\b/i.test(text)) skillsSet.add("PostgreSQL");
  if (/\b(Mongo|MongoDB)\b/i.test(text)) skillsSet.add("MongoDB");
  if (/\b(Figma)\b/i.test(text)) skillsSet.add("Figma");
  if (/\b(Git)\b/i.test(text)) skillsSet.add("Git");
  if (/\b(GitHub)\b/i.test(text)) skillsSet.add("GitHub");

  const skills = Array.from(skillsSet);

  const rawLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && !/^[%<>{}\[\]\\]/.test(l));

  const education = parseEducationLines(rawLines);
  const experience = parseExperienceLines(rawLines);

  return {
    skills: skills.slice(0, 30),
    education: education.slice(0, 5),
    experience: experience.slice(0, 5),
  };
}

/**
 * Parses raw resume text into structured JSON using Gemini AI or fallback parser.
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
You are an accurate Applicant Tracking System (ATS) resume parser.
Extract ONLY true information explicitly present in the candidate's resume text below.

STRICT INSTRUCTIONS:
- Do NOT invent, mock, or assume any fake universities, companies, degrees, or skills.
- Extract ONLY the actual skills, programming languages, software tools, frameworks, and design skills explicitly written in the resume text.
- Format education entries as "Degree/Major - Institution (Dates)" using only the text from the resume.
- Format experience entries as "Job Title - Company/Project (Dates)" using only the text from the resume.
- If a section (skills, education, or experience) has no entries in the resume, return an empty array [] for that section.

Respond strictly with valid JSON:
{
  "skills": ["ExactSkill1", "ExactSkill2"],
  "education": ["Exact Education Details"],
  "experience": ["Exact Experience Details"]
}

Resume Text:
${resumeText.slice(0, 10000)}
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
            skills,
            education,
            experience,
          };
        } catch (err: any) {
          console.warn(`[Gemini] Model ${modelName} error: ${err?.message}`);
        }
      }
    } catch (err: any) {
      console.warn("[Gemini] SDK error:", err?.message);
    }
  }

  // Fallback: strict rule-based parser
  console.log("[Resume Parser] Using rule-based text extractor.");
  return fallbackRuleBasedParser(resumeText);
}
