"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
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

    if (!session || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized. Candidates only." };
    }

    const file = formData.get("resume") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "No file uploaded." };
    }

    // Save file locally in a root-level "uploads" folder
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate a unique filename to avoid collisions
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${session.user.id}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    // Step 1: Extract Text
    let rawText = "";
    try {
      rawText = await extractTextFromBuffer(buffer, file.type);
    } catch (err: any) {
      return {
        success: false,
        error: `Text extraction failed: ${err.message}. Please verify the file is not corrupted.`,
      };
    }

    // Step 2: Call LLM Parser
    let parsedData = { skills: [] as string[], education: [] as string[], experience: [] as string[] };
    let parserFailed = false;
    let parserErrorMessage = "";

    try {
      parsedData = await parseResumeWithGemini(rawText);
    } catch (err: any) {
      console.error("LLM parser failed, falling back to manual entry option:", err);
      parserFailed = true;
      parserErrorMessage = err.message;
    }

    // Step 3: Save to Candidate Profile
    // If LLM fails, we still update the resumeUrl so they know a resume is uploaded,
    // but we preserve existing profile data or let them edit.
    let updatedProfile;
    if (parserFailed) {
      updatedProfile = await db.candidateProfile.upsert({
        where: { userId: session.user.id },
        update: {
          resumeUrl: uniqueFileName,
        },
        create: {
          userId: session.user.id,
          name: session.user.email.split("@")[0], // Fallback name
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

    // Success path: LLM parsed details successfully
    updatedProfile = await db.candidateProfile.upsert({
      where: { userId: session.user.id },
      update: {
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        resumeUrl: uniqueFileName,
      },
      create: {
        userId: session.user.id,
        name: session.user.email.split("@")[0],
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        resumeUrl: uniqueFileName,
      },
    });

    // Update match scores for all job applications this candidate has submitted
    await updateAppliedJobsScores(session.user.id, parsedData.skills);

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
    return { success: false, error: "An unexpected error occurred during resume upload." };
  }
}

/**
 * Manually updates the candidate's skills, experience, and education arrays.
 */
export async function updateCandidateProfile(skills: string[], education: string[], experience: string[]) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized. Candidates only." };
    }

    const updatedProfile = await db.candidateProfile.update({
      where: { userId: session.user.id },
      data: {
        skills,
        education,
        experience,
      },
    });

    // Re-evaluate application scores
    await updateAppliedJobsScores(session.user.id, skills);

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
    return { success: false, error: "Failed to update profile." };
  }
}
