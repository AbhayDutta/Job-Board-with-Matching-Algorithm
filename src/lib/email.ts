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

  console.log(`[Email Notification] Attempting send to: ${to}`);

  if (!resend) {
    console.warn(
      "[Resend SDK] RESEND_API_KEY is not set in environment variables. Email logged locally instead of sending."
    );
    return { success: true, simulated: true };
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Fitboard <onboarding@resend.dev>";

    const response = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      text: bodyText,
    });

    if (response.error) {
      console.error("[Resend API Error]:", response.error);
      return {
        success: false,
        error: response.error.message || "Resend API returned an error.",
        details: response.error,
      };
    }

    console.log(`[Email Notification] Successfully sent email to ${to}, ID:`, response.data?.id);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("[Resend Exception Error]:", error?.message || error, error?.stack);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

/**
 * Sends a passwordless Magic Link sign-in email using Resend.
 */
export async function sendMagicLinkEmail({
  to,
  magicLinkUrl,
  userName,
}: {
  to: string;
  magicLinkUrl: string;
  userName?: string;
}) {
  const recipientName = userName || to.split("@")[0];
  const subject = `Your Fitboard Magic Link Sign-In`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 40px 20px; }
          .card { max-width: 480px; margin: 0 auto; background: #12141c; border: 1px solid #222634; border-radius: 20px; padding: 32px; text-align: center; }
          .badge { display: inline-block; font-size: 10px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; background: #1a1e2e; color: #a0aec0; padding: 4px 12px; border-radius: 12px; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: normal; margin: 0 0 8px 0; color: #ffffff; }
          p { font-size: 14px; color: #a0aec0; line-height: 1.6; margin-bottom: 28px; }
          .btn { display: inline-block; background-color: #c5f82a; color: #000000; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 12px; transition: all 0.2s; }
          .footer { margin-top: 32px; font-size: 11px; color: #4a5568; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">FITBOARD MAGIC LINK</div>
          <h1>Welcome, ${recipientName}</h1>
          <p>Click the button below to sign in to your Fitboard account instantly. No password required!</p>
          <a href="${magicLinkUrl}" class="btn">✨ Sign In to Fitboard →</a>
          <p style="margin-top: 24px; font-size: 11px; color: #718096;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="color: #c5f82a; word-break: break-all;">${magicLinkUrl}</span>
          </p>
          <div class="footer">
            This magic link expires in 15 minutes.<br>
            If you didn't request this email, you can safely ignore it.
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `Hi ${recipientName},\n\nClick the link below to sign in to your Fitboard account:\n\n${magicLinkUrl}\n\nThis link is valid for 15 minutes.\n\nBest regards,\nFitboard Team`;

  console.log(`[MagicLink Email] Sending magic link to: ${to}`);

  if (!resend) {
    console.warn("[Resend SDK] RESEND_API_KEY not set. Logging magic link URL for demo testing:");
    console.log(`🔗 Demo Magic Link: ${magicLinkUrl}`);
    return { success: true, simulated: true, magicLinkUrl };
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || "Fitboard <onboarding@resend.dev>";
    const response = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html: htmlBody,
      text: textBody,
    });

    if (response.error) {
      console.error("[Resend MagicLink Error]:", response.error);
      return {
        success: false,
        error: response.error.message || "Resend API returned an error.",
        magicLinkUrl, // return link so user can still test in dev/demo!
      };
    }

    return { success: true, data: response.data, magicLinkUrl };
  } catch (error: any) {
    console.error("[Resend MagicLink Exception]:", error);
    return { success: false, error: error?.message || "Failed to send magic link", magicLinkUrl };
  }
}
