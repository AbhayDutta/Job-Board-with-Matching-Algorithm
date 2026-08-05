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
 * Sends a passwordless Magic Link sign-in email matching exact reference design.
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
  const subject = `Your magic link to sign in to Fitboard`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #000000; padding: 40px 20px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; text-align: left; }
          .brand { font-size: 16px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: #000000; margin-bottom: 40px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          h1 { font-size: 32px; font-weight: 800; margin: 0 0 16px 0; color: #000000; letter-spacing: -0.5px; }
          p { font-size: 15px; color: #333333; line-height: 1.6; margin-bottom: 28px; }
          .email-link { color: #0066cc; text-decoration: underline; }
          .btn { display: inline-block; background-color: #000000; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin-bottom: 32px; }
          .subtext { font-size: 12px; color: #666666; margin-top: 16px; margin-bottom: 8px; }
          .raw-link { font-size: 12px; color: #0066cc; word-break: break-all; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">FITBOARD</div>
          
          <h1>Sign in to Fitboard</h1>
          
          <p>
            Hi <a href="mailto:${to}" class="email-link">${to}</a>, use the button below to sign in to your account. No password needed — this link expires in <strong>10 minutes</strong>.
          </p>

          <div>
            <a href="${magicLinkUrl}" class="btn">Sign in to Fitboard →</a>
          </div>

          <p class="subtext">Or copy and paste this link into your browser:</p>
          <a href="${magicLinkUrl}" class="raw-link">${magicLinkUrl}</a>
        </div>
      </body>
    </html>
  `;

  const textBody = `Sign in to Fitboard\n\nHi ${to}, use the link below to sign in to your account. No password needed — this link expires in 10 minutes:\n\n${magicLinkUrl}\n\nFitboard Team`;

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
        magicLinkUrl,
      };
    }

    return { success: true, data: response.data, magicLinkUrl };
  } catch (error: any) {
    console.error("[Resend MagicLink Exception]:", error);
    return { success: false, error: error?.message || "Failed to send magic link", magicLinkUrl };
  }
}
