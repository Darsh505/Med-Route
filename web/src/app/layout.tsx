import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Med Route — Find the Right Hospital Near You",
    template: "%s | Med Route",
  },
  description:
    "AI-powered hospital discovery platform for India. Find hospitals by condition, compare costs, check ICU availability, and trigger SOS emergency dispatch.",
  keywords: ["hospital search", "PMJAY", "Ayushman Bharat", "ICU beds", "emergency hospital India", "doctor near me"],
  openGraph: {
    title: "Med Route — Find the Right Hospital Near You",
    description: "AI-powered hospital discovery for India with real-time ICU telemetry and SOS dispatch.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
