import { google } from "googleapis";

export async function createCalendarInterviewEvent({
  jobTitle,
  companyName,
  candidateEmail,
  candidateName,
  startDateTime,
  durationMinutes = 45,
}: {
  jobTitle: string;
  companyName: string;
  candidateEmail: string;
  candidateName: string;
  startDateTime: Date | string;
  durationMinutes?: number;
}) {
  const startDate = new Date(startDateTime);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const eventSummary = `Interview: ${candidateName} - ${jobTitle} (${companyName})`;
  const eventDescription = `Scheduled interview for ${jobTitle} role at ${companyName}.\nCandidate Email: ${candidateEmail}`;

  console.log(`[Google Calendar] Event Scheduled: ${eventSummary}`);
  console.log(`[Start]: ${startDate.toISOString()} | [End]: ${endDate.toISOString()}`);
  console.log(`[Attendee]: ${candidateEmail}`);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn(
      "[Google Calendar API] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Event logged to console in simulation mode."
    );
    return {
      success: true,
      simulated: true,
      eventLink: `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
        eventSummary
      )}&dates=${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endDate
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, "")}&details=${encodeURIComponent(
        eventDescription
      )}&add=${encodeURIComponent(candidateEmail)}`,
    };
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/calendar/callback`
    );

    // If a refresh token is configured globally or for the employer
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (refreshToken) {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const response = await calendar.events.insert({
        calendarId: "primary",
        sendUpdates: "all",
        requestBody: {
          summary: eventSummary,
          description: eventDescription,
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
          attendees: [{ email: candidateEmail }],
        },
      });

      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
      };
    } else {
      // Return a direct Google Calendar pre-filled edit URL so employer can one-click schedule it
      const gcalUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
        eventSummary
      )}&dates=${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endDate
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, "")}&details=${encodeURIComponent(
        eventDescription
      )}&add=${encodeURIComponent(candidateEmail)}`;

      return {
        success: true,
        simulated: true,
        eventLink: gcalUrl,
      };
    }
  } catch (error: any) {
    console.error("[Google Calendar Error]:", error);
    return {
      success: false,
      error: error.message || "Failed to create Google Calendar event",
    };
  }
}
