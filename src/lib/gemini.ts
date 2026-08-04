import { GoogleGenerativeAI } from "@google/generative-ai";

interface ParsedResume {
  skills: string[];
  education: string[];
  experience: string[];
}

const COMMON_SKILLS_KEYWORDS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++",
  "C#", "Go", "Rust", "PHP", "Ruby", "HTML", "CSS", "Tailwind", "PostgreSQL", "MySQL",
  "MongoDB", "Redis", "GraphQL", "REST API", "Docker", "Kubernetes", "AWS", "GCP",
  "Azure", "Git", "GitHub", "CI/CD", "Linux", "Figma", "UI/UX", "System Design",
  "Agile", "Scrum", "Machine Learning", "Data Analysis", "SQL", "Express"
];

function fallbackRuleBasedParser(resumeText: string): ParsedResume {
  const skillsSet = new Set<string>();
  const textLower = resumeText.toLowerCase();

  for (const kw of COMMON_SKILLS_KEYWORDS) {
    const kwLower = kw.toLowerCase();
    if (textLower.includes(kwLower)) {
      skillsSet.add(kw);
    }
  }

  // Regex term matcher for common technologies
  const techTerms = resumeText.match(/\b(React|Next\.js|Node|TypeScript|JavaScript|Python|Java|C\+\+|SQL|Postgres|HTML|CSS|Tailwind|Docker|AWS|Git|MongoDB|Express|REST|Figma)\b/gi);
  if (techTerms) {
    techTerms.forEach(t => skillsSet.add(t.trim()));
  }

  const skills = Array.from(skillsSet);

  const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l.length > 3);
  const education = lines.filter(l => /degree|bachelor|master|university|college|bs|ms|btech|mtech|diploma|education/i.test(l)).slice(0, 4);
  const experience = lines.filter(l => /engineer|developer|manager|intern|analyst|designer|consultant|lead|architect|specialist|experience|work/i.test(l)).slice(0, 5);

  return {
    skills: skills.length > 0 ? skills : ["Software Engineering", "Problem Solving", "Web Development"],
    education: education.length > 0 ? education : ["Relevant Education / Degree"],
    experience: experience.length > 0 ? experience : ["Software Project & Work Experience"],
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
            skills: skills.length > 0 ? skills : ["Software Engineering", "Problem Solving"],
            education,
            experience,
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
  console.log("[Gemini Parser] Using fallback rule-based parser.");
  return fallbackRuleBasedParser(resumeText);
}
