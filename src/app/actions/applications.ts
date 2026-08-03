"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@prisma/client";
import { sendApplicationStatusEmail } from "@/lib/email";
import { createCalendarInterviewEvent } from "@/lib/calendar";

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  interviewDate?: string | Date,
  offerDetails?: {
    joiningDate?: string | Date;
    noticePeriod?: string;
    offerLetterNotes?: string;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "EMPLOYER") {
      return { success: false, error: "Unauthorized. Employers only." };
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidate: {
          select: {
            id: true,
            email: true,
            name: true,
            candidateProfile: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    if (application.job.employerId !== session.user.id) {
      return { success: false, error: "Unauthorized to manage this application." };
    }

    const updateData: {
      status: ApplicationStatus;
      interviewDate?: Date;
      joiningDate?: Date;
      noticePeriod?: string;
      offerLetterNotes?: string;
    } = {
      status: newStatus,
    };

    if (interviewDate) {
      updateData.interviewDate = new Date(interviewDate);
    }

    if (offerDetails?.joiningDate) {
      updateData.joiningDate = new Date(offerDetails.joiningDate);
    }
    if (offerDetails?.noticePeriod !== undefined) {
      updateData.noticePeriod = offerDetails.noticePeriod;
    }
    if (offerDetails?.offerLetterNotes !== undefined) {
      updateData.offerLetterNotes = offerDetails.offerLetterNotes;
    }

    const updatedApp = await db.application.update({
      where: { id: applicationId },
      data: updateData,
    });

    const candidateName =
      application.candidate.candidateProfile?.name ||
      application.candidate.name ||
      application.candidate.email.split("@")[0];

    // Trigger Google Calendar event creation if status is INTERVIEWED and date is provided
    let calendarEventLink = null;
    if (newStatus === "INTERVIEWED" && updateData.interviewDate) {
      const calRes = await createCalendarInterviewEvent({
        jobTitle: application.job.title,
        companyName: application.job.company,
        candidateEmail: application.candidate.email,
        candidateName,
        startDateTime: updateData.interviewDate,
      });
      if (calRes.success && calRes.eventLink) {
        calendarEventLink = calRes.eventLink;
      }
    }

    // Send transactional email notification if status changed
    if (application.status !== newStatus || interviewDate) {
      await sendApplicationStatusEmail({
        to: application.candidate.email,
        candidateName,
        jobTitle: application.job.title,
        companyName: application.job.company,
        status: newStatus,
        interviewDate: updateData.interviewDate,
        meetingLink: calendarEventLink,
      });
    }

    revalidatePath(`/dashboard/employer/jobs/${application.jobId}`);
    revalidatePath("/dashboard/employer/jobs");
    revalidatePath("/dashboard/candidate/jobs");

    return { success: true, application: updatedApp, calendarEventLink };
  } catch (error: any) {
    console.error("Update application status error:", error);
    return { success: false, error: "Failed to update application status." };
  }
}

export async function getJobApplicationsWithDetails(jobId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "EMPLOYER") {
      return { success: false, error: "Unauthorized." };
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                email: true,
                name: true,
                candidateProfile: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!job) {
      return { success: false, error: "Job not found." };
    }

    if (job.employerId !== session.user.id) {
      return { success: false, error: "Unauthorized access to this job's applications." };
    }

    return { success: true, job, applications: job.applications };
  } catch (error: any) {
    console.error("Get job applications error:", error);
    return { success: false, error: "Failed to load job applications." };
  }
}

export async function getCandidateApplications() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "CANDIDATE") {
      return { success: false, error: "Unauthorized." };
    }

    const applications = await db.application.findMany({
      where: { candidateId: session.user.id },
      include: {
        job: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, applications };
  } catch (error: any) {
    console.error("Get candidate applications error:", error);
    return { success: false, error: "Failed to load applications." };
  }
}
