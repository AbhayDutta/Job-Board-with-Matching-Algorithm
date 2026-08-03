import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendApplicationStatusEmail({
  to,
  candidateName,
  jobTitle,
  companyName,
  status,
  interviewDate,
  meetingLink,
}: {
  to: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  status: string;
  interviewDate?: Date | string | null;
  meetingLink?: string | null;
}) {
  const formattedStatus = status.charAt(0) + status.slice(1).toLowerCase();
  const subject = `Update: Your application for ${jobTitle} at ${companyName} (${formattedStatus})`;

  let bodyText = `Hi ${candidateName},\n\nYour application status for "${jobTitle}" at ${companyName} has been updated to: ${formattedStatus}.\n`;

  if (status === "INTERVIEWED" && interviewDate) {
    const formattedDate = new Date(interviewDate).toLocaleString([], {
      dateStyle: "full",
      timeStyle: "short",
    });
    bodyText += `\n📅 Interview Scheduled: ${formattedDate}\n`;
    if (meetingLink) {
      bodyText += `\n🔗 Google Calendar / Meeting Link: ${meetingLink}\n`;
    }
    bodyText += `\nA Google Calendar invite has been sent to your Gmail inbox (${to}). Please check your inbox or Google Calendar to confirm attendance.\n`;
  }

  bodyText += `\nBest regards,\n${companyName} Hiring Team\nFitboard Platform`;

  console.log(`[Email Notification] Sending to: ${to}`);
  console.log(`[Email Subject]: ${subject}`);
  console.log(`[Email Body]:\n${bodyText}`);

  if (!resend) {
    console.warn(
      "[Resend SDK] RESEND_API_KEY is not set. Email logged above instead of sending."
    );
    return { success: true, simulated: true };
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Fitboard <onboarding@resend.dev>";
    const data = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      text: bodyText,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Error]:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
