import { GoogleGenerativeAI } from "@google/generative-ai";

interface ParsedResume {
  skills: string[];
  education: string[];
  experience: string[];
}

/**
 * Parses raw resume text into a structured JSON schema using Gemini models.
 * Implements a robust failover chain to handle high-demand (503 Service Unavailable) or rate-limit issues.
 *
 * @param resumeText Plain text extracted from the resume.
 */
export async function parseResumeWithGemini(resumeText: string): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Failover chain of models to try in sequence
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite", // Excellent backup: low-latency, high-availability
    "gemini-3.1-pro"
  ];
  
  let lastError: any = null;

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
        throw new Error("Received empty response from Gemini API");
      }

      // Clean up response if the model returned markdown ticks despite requests
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const data = JSON.parse(cleanText);

      // Validate the array types
      const skills = Array.isArray(data.skills) ? data.skills.map((s: any) => String(s).trim()) : [];
      const education = Array.isArray(data.education) ? data.education.map((e: any) => String(e).trim()) : [];
      const experience = Array.isArray(data.experience) ? data.experience.map((ex: any) => String(ex).trim()) : [];

      console.log(`[Gemini Parser] Successfully parsed resume using model: ${modelName}`);
      return { skills, education, experience };

    } catch (error: any) {
      console.warn(`[Gemini Parser] Model ${modelName} failed: ${error.message || error}`);
      lastError = error;
      // Continue loop to try the next model in the failover chain
    }
  }

  // If we run out of models to try
  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || lastError}`);
}
