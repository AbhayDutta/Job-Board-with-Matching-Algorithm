import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const jobPostingSchema = z.object({
  title: z
    .string()
    .min(2, "Job title must be at least 2 characters"),
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters"),
  salary: z
    .string()
    .min(1, "Salary specification is required"),
  description: z
    .string()
    .min(10, "Job description must be at least 10 characters long"),
  skillsRequired: z
    .string()
    .min(1, "At least one required skill is required"),
  skillsNiceToHave: z
    .string()
    .optional(),
});

export type JobPostingFormData = z.infer<typeof jobPostingSchema>;

export const candidateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),
  skills: z
    .string()
    .min(1, "At least one skill is required"),
  experience: z
    .string()
    .optional(),
  education: z
    .string()
    .optional(),
});

export type CandidateProfileFormData = z.infer<typeof candidateProfileSchema>;
