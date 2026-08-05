"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import path from "path";
import { extractTextFromBuffer } from "@/lib/extractor";
import { parseResumeWithGemini } from "@/lib/gemini";
import { calculateMatchScore } from "@/lib/matching";

// Configure Vercel serverless function max duration (if applicable)

/**
 * Recalculates and updates the match score for all job applications submitted by a candidate.
 */
async function updateAppliedJobsScores(candidateId: string, candidateSkills: string[]) {
  try {
    const applications = await db.application.findMany({
      where: { candidateId },
      include: { job: true },
    });

    for (const app of applications) {
      const job = app.job;
      const mustHave = Array.isArray(job.skillsRequired) ? (job.skillsRequired as string[]) : [];
      const niceToHave = Array.isArray(job.skillsNiceToHave) ? (job.skillsNiceToHave as string[]) : [];

      const newScore = calculateMatchScore(candidateSkills, mustHave, niceToHave);

      await db.application.update({
        where: { id: app.id },
        data: { matchScore: newScore },
      });
    }
  } catch (error) {
    console.error("[ResumeUpload] Error updating application match scores:", error);
  }
}

/**
 * Handles resume upload, text extraction, and parsing via Gemini / rule-based parser.
 * Operates purely in-memory (no disk writes) for Vercel serverless compatibility.
 */
export async function uploadResumeAction(formData: FormData) {
  const startTime = Date.now();
  console.log("[ResumeUpload] Starting resume processing flow...");

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      console.warn("[ResumeUpload] Unauthorized upload attempt.");
      return { success: false, error: "Unauthorized. Please log in first." };
    }

    // Verify candidate user exists in database
    let dbUser = await db.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser && session.user.email) {
      dbUser = await db.user.findFirst({
        where: { email: { equals: session.user.email.toLowerCase().trim(), mode: "insensitive" } },
      });
    }

    if (!dbUser) {
      console.error("[ResumeUpload] User session invalid or DB record missing:", session.user.id);
      return { success: false, error: "User session expired. Please log out and log in again." };
    }

    const userId = dbUser.id;

    const file = formData.get("resume") as File | null;
    if (!file || file.size === 0) {
      console.warn("[ResumeUpload] No file provided in request body.");
      return { success: false, error: "No file selected for upload." };
    }

    // Vercel serverless payload size check (4.5MB limit)
    const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`[ResumeUpload] File size (${file.size} bytes) exceeds 4.5MB Vercel limit.`);
      return {
        success: false,
        error: "File size exceeds the 4.5MB server limit. Please upload a smaller PDF or DOCX file.",
      };
    }

    console.log(`[ResumeUpload] Processing file: ${file.name} (${file.size} bytes, type: ${file.type})`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name) || ".pdf";
    const uniqueFileName = `${userId}_${Date.now()}${fileExtension}`;

    // Step 1: Extract Text directly from in-memory buffer (No disk write)
    let rawText = "";
    try {
      rawText = await extractTextFromBuffer(buffer, file.type);
      console.log(`[ResumeUpload] Text extraction succeeded. Extracted ${rawText.length} characters.`);
    } catch (err: any) {
      console.error("[ResumeUpload] Text extraction failed:", err?.message || err, err?.stack);
      return {
        success: false,
        error: `Text extraction failed: ${err?.message || err}. Please verify the file format.`,
      };
    }

    // Step 2: Call LLM / ATS Parser
    let parsedData = { skills: [] as string[], education: [] as string[], experience: [] as string[] };
    let parserFailed = false;
    let parserErrorMessage = "";

    try {
      parsedData = await parseResumeWithGemini(rawText);
      console.log(`[ResumeUpload] Resume parsing succeeded in ${Date.now() - startTime}ms:`, {
        skillsCount: parsedData.skills.length,
        educationCount: parsedData.education.length,
        experienceCount: parsedData.experience.length,
      });
    } catch (err: any) {
      console.error("[ResumeUpload] LLM parser failed:", err?.message || err, err?.stack);
      parserFailed = true;
      parserErrorMessage = err?.message || String(err);
    }

    // Step 3: Save to Candidate Profile in database
    let updatedProfile;
    if (parserFailed) {
      updatedProfile = await db.candidateProfile.upsert({
        where: { userId },
        update: {
          resumeUrl: uniqueFileName,
        },
        create: {
          userId,
          name: dbUser.name || session.user.email?.split("@")[0] || "Candidate",
          skills: [],
          experience: [],
          education: [],
          resumeUrl: uniqueFileName,
        },
      });

      revalidatePath("/dashboard/candidate/jobs");
      revalidatePath("/dashboard/employer/jobs");

      return {
        success: true,
        fallback: true,
        error: `Could not auto-parse skills: ${parserErrorMessage}. You can enter them manually below.`,
        profile: {
          skills: Array.isArray(updatedProfile.skills) ? (updatedProfile.skills as string[]) : [],
          education: Array.isArray(updatedProfile.education) ? (updatedProfile.education as string[]) : [],
          experience: Array.isArray(updatedProfile.experience) ? (updatedProfile.experience as string[]) : [],
          resumeUrl: updatedProfile.resumeUrl,
        },
      };
    }

    // Success path: Save parsed details to database
    updatedProfile = await db.candidateProfile.upsert({
      where: { userId },
      update: {
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        resumeUrl: uniqueFileName,
      },
      create: {
        userId,
        name: dbUser.name || session.user.email?.split("@")[0] || "Candidate",
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        resumeUrl: uniqueFileName,
      },
    });

    console.log(`[ResumeUpload] Profile updated in DB for user ${userId}. Total time: ${Date.now() - startTime}ms`);

    // Update match scores for all job applications submitted by this candidate
    await updateAppliedJobsScores(userId, parsedData.skills);

    revalidatePath("/dashboard/candidate/jobs");
    revalidatePath("/dashboard/employer/jobs");

    return {
      success: true,
      profile: {
        skills: parsedData.skills,
        education: parsedData.education,
        experience: parsedData.experience,
        resumeUrl: uniqueFileName,
      },
    };
  } catch (error: any) {
    console.error("[ResumeUpload] Fatal error during uploadResumeAction:", error?.message || error, error?.stack);
    return {
      success: false,
      error: `Upload Error: ${error?.message || "An unexpected error occurred during resume upload."}`,
    };
  }
}

/**
 * Manually updates the candidate's skills, experience, and education arrays.
 */
export async function updateCandidateProfile(skills: string[], education: string[], experience: string[]) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized. Candidates only." };
    }

    let dbUser = await db.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser && session.user.email) {
      dbUser = await db.user.findFirst({
        where: { email: { equals: session.user.email.toLowerCase().trim(), mode: "insensitive" } },
      });
    }

    if (!dbUser) {
      return { success: false, error: "User session expired. Please log out and sign in again." };
    }

    const userId = dbUser.id;

    const updatedProfile = await db.candidateProfile.upsert({
      where: { userId },
      update: {
        skills,
        education,
        experience,
      },
      create: {
        userId,
        name: dbUser.name || session.user.email?.split("@")[0] || "Candidate",
        skills,
        education,
        experience,
      },
    });

    // Re-evaluate application scores
    await updateAppliedJobsScores(userId, skills);

    revalidatePath("/dashboard/candidate/jobs");
    revalidatePath("/dashboard/employer/jobs");

    return {
      success: true,
      profile: {
        skills: Array.isArray(updatedProfile.skills) ? (updatedProfile.skills as string[]) : [],
        education: Array.isArray(updatedProfile.education) ? (updatedProfile.education as string[]) : [],
        experience: Array.isArray(updatedProfile.experience) ? (updatedProfile.experience as string[]) : [],
        resumeUrl: updatedProfile.resumeUrl,
      },
    };
  } catch (error: any) {
    console.error("[CandidateProfile] Update error:", error?.message || error, error?.stack);
    return { success: false, error: `Update Error: ${error?.message || "Failed to update profile."}` };
  }
}
