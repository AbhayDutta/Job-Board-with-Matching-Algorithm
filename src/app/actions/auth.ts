"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function registerUser(formData: z.infer<typeof registerSchema>) {
  try {
    const validatedData = registerSchema.parse(formData);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
        ...(validatedData.role === "CANDIDATE"
          ? {
              candidateProfile: {
                create: {
                  name: validatedData.name,
                  skills: [],
                  experience: [],
                },
              },
            }
          : {}),
      },
    });

    return {
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "An unexpected error occurred during signup." };
  }
}
