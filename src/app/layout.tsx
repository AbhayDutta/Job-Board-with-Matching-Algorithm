import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Fitboard — Job matching that actually fits",
  description: "Fitboard parses resumes, scores candidate–job fit with a skill-vector algorithm, and gives both sides a real pipeline. Stop keyword-searching. Start matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground" suppressHydrationWarning>
        {/* Global ambient colorful backdrop glows */}
        <div className="absolute top-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-violet-500/8 dark:bg-violet-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-15%] -z-10 h-[600px] w-[600px] rounded-full bg-emerald-500/6 dark:bg-emerald-500/3 blur-[130px] pointer-events-none" />
        <div className="absolute top-[30%] left-[20%] -z-10 h-[500px] w-[500px] rounded-full bg-orange-500/4 dark:bg-orange-500/2 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] -z-10 h-[450px] w-[450px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/4 blur-[110px] pointer-events-none" />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
