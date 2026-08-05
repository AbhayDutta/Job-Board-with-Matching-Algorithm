"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserProfile({
  name,
  avatarUrl,
}: {
  name?: string;
  avatarUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    const updateData: { name?: string; avatarUrl?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    if (name && session.user.role === "CANDIDATE") {
      await db.candidateProfile.updateMany({
        where: { userId: session.user.id },
        data: { name },
      });
    }

    revalidatePath("/dashboard/candidate/jobs");
    revalidatePath("/dashboard/employer/jobs");

    return { success: true, user };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile avatar." };
  }
}

/**
 * Allows a single user (same email address) to seamlessly switch between Candidate and Recruiter roles.
 */
export async function switchUserRoleAction(targetRole: "CANDIDATE" | "EMPLOYER") {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in first." };
    }

    const userId = session.user.id;

    // Ensure CandidateProfile exists if switching to Candidate
    if (targetRole === "CANDIDATE") {
      const existingProfile = await db.candidateProfile.findUnique({
        where: { userId },
      });

      if (!existingProfile) {
        await db.candidateProfile.create({
          data: {
            userId,
            name: (session.user as any).name || session.user.email?.split("@")[0] || "Candidate",
            skills: [],
            experience: [],
            education: [],
          },
        });
      }
    }

    // Update user role in database
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: targetRole },
    });

    console.log(`[Role Switcher] User ${userId} switched role to ${targetRole}`);

    revalidatePath("/dashboard/candidate/jobs");
    revalidatePath("/dashboard/employer/jobs");

    const redirectUrl =
      targetRole === "EMPLOYER"
        ? "/dashboard/employer/jobs"
        : "/dashboard/candidate/jobs";

    return {
      success: true,
      role: updatedUser.role,
      redirectUrl,
    };
  } catch (error: any) {
    console.error("[Role Switcher Error]:", error);
    return { success: false, error: error?.message || "Failed to switch role." };
  }
}
