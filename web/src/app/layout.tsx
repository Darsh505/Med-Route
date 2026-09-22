import type { Metadata } from "next";
import "@/styles/globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container">
        <AuthProvider>
          <LocationProvider>
            {children}
            <ChatbotWidget />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
