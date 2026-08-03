"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "sonner";
import SmoothScroll from "@/components/SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SmoothScroll>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </SmoothScroll>
    </SessionProvider>
  );
}
