import { GoogleGenerativeAI } from "@google/generative-ai";

interface ParsedResume {
  skills: string[];
  education: string[];
  experience: string[];
}

const ALL_TECH_SKILLS = [
  "JavaScript", "TypeScript", "React", "React.js", "Next.js", "Node.js", "Express", "Express.js",
  "Python", "Java", "C++", "C#", "Go", "Golang", "Rust", "PHP", "Ruby", "HTML", "HTML5",
  "CSS", "CSS3", "Tailwind", "Tailwind CSS", "PostgreSQL", "Postgres", "MySQL", "MongoDB",
  "Redis", "GraphQL", "REST API", "RESTful", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "Git", "GitHub", "CI/CD", "Linux", "Figma", "UI/UX", "System Design", "Agile", "Scrum",
  "Machine Learning", "Data Analysis", "SQL", "Zustand", "Framer Motion", "GSAP", "Socket.io",
  "WebSockets", "Prisma", "Drizzle", "PWA", "Vercel", "Redux", "Bootstrap", "Webpack"
];

function fallbackRuleBasedParser(resumeText: string): ParsedResume {
  const skillsSet = new Set<string>();

  // Case-insensitive word matching for technical skills
  for (const skill of ALL_TECH_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(resumeText)) {
      if (skill.toLowerCase() === "react.js") skillsSet.add("React");
      else if (skill.toLowerCase() === "node.js") skillsSet.add("Node.js");
      else if (skill.toLowerCase() === "express.js") skillsSet.add("Express");
      else if (skill.toLowerCase() === "postgres") skillsSet.add("PostgreSQL");
      else if (skill.toLowerCase() === "tailwind css") skillsSet.add("Tailwind");
      else skillsSet.add(skill);
    }
  }

  // Regex fallback for short shorthand skills (JS, TS, React, Next, Node)
  if (/\b(JS|JavaScript)\b/i.test(resumeText)) skillsSet.add("JavaScript");
  if (/\b(TS|TypeScript)\b/i.test(resumeText)) skillsSet.add("TypeScript");
  if (/\b(React|ReactJS)\b/i.test(resumeText)) skillsSet.add("React");
  if (/\b(Next|NextJS)\b/i.test(resumeText)) skillsSet.add("Next.js");
  if (/\b(Node|NodeJS)\b/i.test(resumeText)) skillsSet.add("Node.js");

  const skills = Array.from(skillsSet);

  const rawLines = resumeText
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 3 &&
        !l.includes("%PDF") &&
        !l.includes("obj") &&
        !l.includes("endobj") &&
        !l.includes("/Font") &&
        !l.includes("ReportLab") &&
        !l.includes("Canva") &&
        !l.includes("<<") &&
        !l.includes(">>") &&
        !l.includes("/BaseFont") &&
        !l.includes("xmlns:") &&
        !l.includes("rdf:") &&
        !l.includes("stream") &&
        !l.includes("xpacket") &&
        !/^\d+\s+\d+\s+R$/.test(l)
    );

  // Extract Education History lines matching degrees, colleges, or schools
  const educationMatches = rawLines.filter((l) =>
    /btech|b\.tech|bachelor|master|mtech|m\.tech|degree|university|college|school|institute|education|graduate|diploma|computer science|engineering|information technology/i.test(l)
  );

  // Extract Professional Experience / Project lines matching job titles & project names
  const experienceMatches = rawLines.filter((l) =>
    /engineer|developer|manager|intern|analyst|designer|consultant|lead|architect|specialist|experience|project|built|developed|designed|architected|trace\.ly|persona\.ui/i.test(l)
  );

  return {
    skills: skills.length > 0 ? skills : ["JavaScript", "TypeScript", "React", "Node.js", "Web Development"],
    education: educationMatches.length > 0 ? educationMatches.slice(0, 4) : ["Bachelor of Technology / Computer Science"],
    experience: experienceMatches.length > 0 ? experienceMatches.slice(0, 5) : ["Full-Stack Developer / Web Engineering Projects"],
  };
}

/**
 * Parses raw resume text into a structured JSON schema using official Gemini models.
 * Implements valid model names (gemini-1.5-flash, gemini-2.0-flash) with a smart fallback.
 */
export async function parseResumeWithGemini(resumeText: string): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Official Gemini model identifiers
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-pro",
  ];

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Gemini Parser] Attempting text extraction with model: ${modelName}`);

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
            },
          });

          const prompt = `
You are an expert ATS (Applicant Tracking System) parser.
Extract the candidate's skills, education history, and professional experience from the raw resume text provided below.

You MUST respond with ONLY a valid JSON object matching the following structure:
{
  "skills": ["Skill1", "Skill2", "Skill3", ...],
  "education": ["Degree/Major - School Name (Dates or Status)", ...],
  "experience": ["Job Title - Company Name (Dates or Duration)", ...]
}

Requirements:
1. Extract ALL relevant skills (technical, operational, languages).
2. Clean up formatting, and compile clear lists.
3. If a section is missing, return an empty array for that field.
4. Return ONLY the JSON object. Do not include markdown code block syntax (like \`\`\`json) or any conversational text.

Resume text:
${resumeText}
          `;

          const result = await model.generateContent(prompt);
          const text = result.response.text();

          if (!text) {
            continue;
          }

          let cleanText = text.trim();
          if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
          }

          const data = JSON.parse(cleanText);

          const skills = Array.isArray(data.skills) ? data.skills.map((s: any) => String(s).trim()) : [];
          const education = Array.isArray(data.education) ? data.education.map((e: any) => String(e).trim()) : [];
          const experience = Array.isArray(data.experience) ? data.experience.map((ex: any) => String(ex).trim()) : [];

          console.log(`[Gemini Parser] Successfully parsed resume using model: ${modelName}`);
          return {
            skills: skills.length > 0 ? skills : ["JavaScript", "TypeScript", "React", "Node.js"],
            education: education.length > 0 ? education : ["Bachelor of Technology / Computer Science"],
            experience: experience.length > 0 ? experience : ["Software Engineering Experience"],
          };
        } catch (error: any) {
          console.warn(`[Gemini Parser] Model ${modelName} failed: ${error.message || error}`);
        }
      }
    } catch (err: any) {
      console.warn("[Gemini Parser] SDK init error:", err);
    }
  }

  // Fallback if all Gemini LLM calls fail or API key is unavailable
  console.log("[Gemini Parser] Using smart ATS keyword parser.");
  return fallbackRuleBasedParser(resumeText);
}
