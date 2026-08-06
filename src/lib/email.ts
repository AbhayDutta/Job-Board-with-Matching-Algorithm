/**
 * email.ts — Gmail API email sender
 *
 * Replaces Resend SDK. Uses Google Gmail API with OAuth2 refresh token.
 * Required environment variables:
 *   GMAIL_REFRESH_TOKEN  — from scripts/get-gmail-token.mjs
 *   GMAIL_SENDER_EMAIL   — the Gmail account to send from
 *   GOOGLE_CLIENT_ID     — your Google OAuth app client ID
 *   GOOGLE_CLIENT_SECRET — your Google OAuth app client secret
 */

import { google } from "googleapis";

// ─── Gmail OAuth2 client ────────────────────────────────────────────────────
function getGmailClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

// ─── Helper: Build RFC 2822 raw email string ───────────────────────────────
function buildRawEmail({
  from,
  to,
  subject,
  htmlBody,
  textBody,
}: {
  from: string;
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}): string {
  const boundary = `fitboard_boundary_${Date.now()}`;

  const parts: string[] = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
  ];

  if (textBody) {
    parts.push(
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      textBody,
      ``
    );
  }

  parts.push(
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    htmlBody,
    ``,
    `--${boundary}--`
  );

  const raw = parts.join("\r\n");
  // Base64url encode for Gmail API
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ─── Send via Gmail API ────────────────────────────────────────────────────
async function sendViaGmail(params: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}): Promise<{ success: boolean; error?: string; data?: any; simulated?: boolean }> {
  const gmail = getGmailClient();
  const senderEmail = process.env.GMAIL_SENDER_EMAIL;

  if (!gmail || !senderEmail) {
    console.warn(
      "[Gmail API] GMAIL_REFRESH_TOKEN or GMAIL_SENDER_EMAIL not set. Email logged locally instead of sending."
    );
    console.log(`[Email Simulated] To: ${params.to} | Subject: ${params.subject}`);
    return { success: true, simulated: true };
  }

  try {
    const from = `Fitboard <${senderEmail}>`;
    const rawMessage = buildRawEmail({
      from,
      to: params.to,
      subject: params.subject,
      htmlBody: params.htmlBody,
      textBody: params.textBody,
    });

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: rawMessage },
    });

    console.log(`[Gmail API] Email sent to ${params.to}, message ID: ${response.data.id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("[Gmail API Error]:", error?.message || error);
    return { success: false, error: error?.message || "Failed to send email via Gmail API" };
  }
}

// ─── Interview / Application Status Email ─────────────────────────────────
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
  const isInterview = status === "INTERVIEWED" && interviewDate;

  const subject = isInterview
    ? `📅 Interview Scheduled: ${jobTitle} at ${companyName}`
    : `Update: Your application for ${jobTitle} at ${companyName} (${formattedStatus})`;

  let formattedDate = "";
  if (isInterview && interviewDate) {
    formattedDate = new Date(interviewDate).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  }

  const textBody = isInterview
    ? `Hi ${candidateName},\n\nYour interview for "${jobTitle}" at ${companyName} has been scheduled!\n\n📅 Date & Time: ${formattedDate} (IST)\n${meetingLink ? `\n🔗 Meeting Link: ${meetingLink}\n` : ""}\nPlease check your Google Calendar for the invite.\n\nBest regards,\n${companyName} Hiring Team\nFitboard Platform`
    : `Hi ${candidateName},\n\nYour application status for "${jobTitle}" at ${companyName} has been updated to: ${formattedStatus}.\n\nBest regards,\n${companyName} Hiring Team\nFitboard Platform`;

  const htmlBody = isInterview
    ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px 20px; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .card { background: #111111; border: 1px solid #222222; border-radius: 16px; padding: 40px; }
    .brand { font-size: 13px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; color: #a3e635; margin-bottom: 32px; }
    h1 { font-size: 28px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 8px; }
    .subtitle { font-size: 15px; color: #888888; margin-bottom: 32px; }
    .highlight-box { background: #1a1a1a; border: 1px solid #333333; border-left: 3px solid #a3e635; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
    .highlight-box .label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #a3e635; margin-bottom: 8px; }
    .highlight-box .value { font-size: 18px; font-weight: 700; color: #ffffff; }
    .meet-btn { display: inline-block; background: #a3e635; color: #000000 !important; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin-bottom: 28px; letter-spacing: 0.5px; }
    .divider { border: none; border-top: 1px solid #222222; margin: 28px 0; }
    .footer { font-size: 12px; color: #555555; line-height: 1.6; }
    .footer a { color: #a3e635; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="brand">FITBOARD</div>
      <h1>🎉 Interview Scheduled!</h1>
      <p class="subtitle">Hi ${candidateName}, your interview is confirmed.</p>

      <div class="highlight-box">
        <div class="label">Position</div>
        <div class="value">${jobTitle}</div>
      </div>

      <div class="highlight-box">
        <div class="label">Company</div>
        <div class="value">${companyName}</div>
      </div>

      <div class="highlight-box">
        <div class="label">📅 Interview Date &amp; Time</div>
        <div class="value">${formattedDate} (IST)</div>
      </div>

      ${
        meetingLink
          ? `<div class="highlight-box">
        <div class="label">🔗 Meeting Link</div>
        <div class="value" style="font-size:14px;word-break:break-all;">${meetingLink}</div>
      </div>
      <a href="${meetingLink}" class="meet-btn">Join Google Meet →</a>`
          : ""
      }

      <hr class="divider">
      <p class="footer">
        This email was sent by <strong>Fitboard</strong> on behalf of ${companyName}.<br>
        Please check your Google Calendar for the calendar invite.<br><br>
        Questions? Reply to this email or contact the hiring team directly.
      </p>
    </div>
  </div>
</body>
</html>`
    : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px 20px; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .card { background: #111111; border: 1px solid #222222; border-radius: 16px; padding: 40px; }
    .brand { font-size: 13px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; color: #a3e635; margin-bottom: 32px; }
    h1 { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 16px; }
    p { font-size: 15px; color: #888888; line-height: 1.7; margin-bottom: 16px; }
    .status-badge { display: inline-block; background: #a3e635; color: #000000; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 6px 14px; border-radius: 6px; margin-bottom: 24px; }
    .divider { border: none; border-top: 1px solid #222222; margin: 24px 0; }
    .footer { font-size: 12px; color: #555555; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="brand">FITBOARD</div>
      <h1>Application Update</h1>
      <p>Hi ${candidateName},</p>
      <p>Your application for <strong style="color:#ffffff;">${jobTitle}</strong> at <strong style="color:#ffffff;">${companyName}</strong> has been updated.</p>
      <div class="status-badge">${formattedStatus}</div>
      <hr class="divider">
      <p class="footer">Sent by Fitboard on behalf of ${companyName} Hiring Team.</p>
    </div>
  </div>
</body>
</html>`;

  console.log(`[Email Notification] Sending interview notification to: ${to}`);

  return sendViaGmail({ to, subject, htmlBody, textBody });
}

// ─── Magic Link Email ──────────────────────────────────────────────────────
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

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #000000; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; }
    .brand { font-size: 16px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: #000000; margin-bottom: 40px; }
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
    <p>Hi <a href="mailto:${to}" class="email-link">${to}</a>, use the button below to sign in to your account. No password needed — this link expires in <strong>10 minutes</strong>.</p>
    <div>
      <a href="${magicLinkUrl}" class="btn">Sign in to Fitboard →</a>
    </div>
    <p class="subtext">Or copy and paste this link into your browser:</p>
    <a href="${magicLinkUrl}" class="raw-link">${magicLinkUrl}</a>
  </div>
</body>
</html>`;

  const textBody = `Sign in to Fitboard\n\nHi ${to}, use the link below to sign in to your account. No password needed — this link expires in 10 minutes:\n\n${magicLinkUrl}\n\nFitboard Team`;

  console.log(`[MagicLink Email] Sending magic link to: ${to}`);

  const result = await sendViaGmail({ to, subject, htmlBody, textBody });
  return { ...result, magicLinkUrl };
}
