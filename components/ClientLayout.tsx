"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

declare global {
  interface Window {
    chrome?: any;
  }
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.chrome?.storage) {
      window.chrome.storage.sync.get(
        ["apiKey", "onboardingComplete"],
        (result: any) => {
          if (!result.apiKey || !result.onboardingComplete) {
            router.push("/ai-processing");
          }
        }
      );
    }
  }, [router]);

  const hideNavbarFooter =
    pathname.startsWith("/live-meeting") ||
    pathname.startsWith("/ai-processing");

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <main>{children}</main>
      {!hideNavbarFooter && <Footer />}
    </>
  );
}
