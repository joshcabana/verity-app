import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/contexts/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verity — Real Dates. Real People.",
  description:
    "Verity is a video-first dating experience built on trust, safety, and genuine connection. Join curated drops, meet face-to-face over video, and discover real chemistry.",
  keywords: ["dating", "video dating", "real connections", "safe dating"],
  openGraph: {
    title: "Verity — Real Dates. Real People.",
    description:
      "Video-first dating built on trust and genuine connection.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body className="bg-background text-foreground font-sans antialiased min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                border: "1px solid #262626",
                color: "#f2f2f2",
                fontFamily: '"Inter", system-ui, sans-serif',
              },
            }}
          />
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
