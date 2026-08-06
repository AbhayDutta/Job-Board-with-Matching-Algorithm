/**
 * One-time script to generate a Gmail API refresh token.
 * Run: node scripts/get-gmail-token.mjs
 *
 * After running, copy the printed GMAIL_REFRESH_TOKEN into:
 *   - .env.local
 *   - Vercel → Project Settings → Environment Variables
 */
import { google } from "googleapis";
import http from "http";
import url from "url";
import open from "open";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:4242/oauth2callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in your environment."
  );
  console.error("Run: $env:GOOGLE_CLIENT_ID='your_id'; $env:GOOGLE_CLIENT_SECRET='your_secret'; node scripts/get-gmail-token.mjs");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("\n📧 Gmail API Token Generator\n");
console.log("1. A browser window will open asking you to sign in with the Gmail account you want to send emails FROM.");
console.log("2. Grant the Gmail Send permission.");
console.log("3. The refresh token will be printed here.\n");
console.log("Opening browser...\n");

// Start local server to catch redirect
const server = http.createServer(async (req, res) => {
  try {
    const parsed = url.parse(req.url, true);
    if (parsed.pathname !== "/oauth2callback") {
      res.end("Not found");
      return;
    }

    const code = parsed.query.code;
    if (!code) {
      res.end("No code found in URL.");
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);

    res.end(`
      <html><body style="font-family:sans-serif;padding:40px;">
        <h2>✅ Success! Copy the refresh token below.</h2>
        <p>Close this window and paste the token into your <code>.env.local</code>.</p>
      </body></html>
    `);

    console.log("\n✅ Gmail Refresh Token Generated!\n");
    console.log("Add these to your .env.local and Vercel environment variables:");
    console.log("─────────────────────────────────────────────────────────");
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GMAIL_SENDER_EMAIL=<the-gmail-you-logged-in-with@gmail.com>`);
    console.log("─────────────────────────────────────────────────────────\n");

    server.close();
  } catch (err) {
    console.error("Error getting token:", err);
    res.end("Error: " + err.message);
    server.close();
  }
});

server.listen(4242, () => {
  // Try to open browser, fallback to manual URL
  try {
    open(authUrl);
  } catch {
    console.log("Could not open browser automatically. Open this URL manually:");
    console.log(authUrl);
  }
});
