import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingPageClient from "./LandingPageClient";

export default async function Index() {
  const session = await getServerSession(authOptions);

  return <LandingPageClient session={session} />;
}
