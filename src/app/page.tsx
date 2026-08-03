import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingPageClient from "./LandingPageClient";

export const dynamic = "force-dynamic";

export default async function Index() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("getServerSession error:", err);
  }

  return <LandingPageClient session={session} />;
}
