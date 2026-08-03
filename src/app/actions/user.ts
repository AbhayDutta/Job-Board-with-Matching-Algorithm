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
