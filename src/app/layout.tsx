import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/contexts/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verity â Anonymous Video Dating. Canberra First.",
  description:
    "45 seconds of anonymous video. Real voice, real eyes, no filters. Your identity stays hidden until you both say yes. Join the next Drop â free.",
  keywords: ["dating", "video dating", "anonymous dating", "real connections", "safe dating", "Canberra"],
  icons: {
    icon: [
      { url: "/v-mark-64.png", sizes: "64x64", type: "image/png" },
      { url: "/v-mark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/v-mark-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/v-mark-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Verity â Anonymous Video Dating",
    description:
      "See their vibe, not their face. Spark â match â reveal. Launching in Canberra.",
    type: "website",
    url: "https://app.getverity.com.au",
    images: [{ url: "https://app.getverity.com.au/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verity â Anonymous Video Dating",
    description: "See their vibe, not their face. Spark â match â reveal. Launching in Canberra.",
    images: ["https://app.getverity.com.au/og-image.jpg"],
  },
  metadataBase: new URL("https://app.getverity.com.au"),
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
