"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { extractTextFromBuffer } from "@/lib/extractor";
import { parseResumeWithGemini } from "@/lib/gemini";
import { calculateMatchScore } from "@/lib/matching";

/**
 * Recalculates and updates the match score for all job applications submitted by a candidate.
 *
 * @param candidateId User ID of the candidate.
 * @param candidateSkills Current list of skills from the candidate's profile.
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
    console.error("Error updating application match scores:", error);
  }
}

/**
 * Handles resume upload, text extraction, and parsing via the Gemini API.
 */
export async function uploadResumeAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized. Candidates only." };
    }

    // Verify candidate user exists in database
    let dbUser = await db.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser && session.user.email) {
      dbUser = await db.user.findFirst({
        where: { email: { equals: session.user.email.toLowerCase().trim(), mode: "insensitive" } },
      });
    }

    if (!dbUser) {
      return { success: false, error: "User session expired. Please log out and log in again." };
    }

    const userId = dbUser.id;

    const file = formData.get("resume") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "No file selected for upload." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = path.extname(file.name) || ".pdf";
    const uniqueFileName = `${userId}_${Date.now()}${fileExtension}`;

    // Write file to temporary OS directory (Vercel serverless compatible)
    try {
      const uploadsDir = path.join(os.tmpdir(), "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, uniqueFileName);
      await fs.writeFile(filePath, buffer);
    } catch (diskErr) {
      console.warn("Serverless disk write skipped:", diskErr);
    }

    // Step 1: Extract Text
    let rawText = "";
    try {
      rawText = await extractTextFromBuffer(buffer, file.type);
    } catch (err: any) {
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
    } catch (err: any) {
      console.error("LLM parser failed, falling back to manual entry option:", err);
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

    // Success path: Parsed details successfully
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

    // Update match scores for all job applications this candidate has submitted
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
    console.error("Upload resume action error:", error);
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
    console.error("Update candidate profile error:", error);
    return { success: false, error: `Update Error: ${error?.message || "Failed to update profile."}` };
  }
}
