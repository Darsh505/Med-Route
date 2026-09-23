import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0C1253",
};

export const metadata: Metadata = {
  title: {
    default: "Medi Route — Find Verified Network Hospitals & Cashless Admissions",
    template: "%s | Medi Route",
  },
  description:
    "Clinical architecture healthcare platform for India. Find accredited network hospitals, compare cashless approval turnaround, check live ICU beds, and trigger zero-deposit admissions.",
  keywords: ["hospital comparison", "cashless hospitalization", "NABH hospitals", "ICU bed availability", "Bangalore hospitals", "ABHA health records"],
  openGraph: {
    title: "Medi Route — Clinical Architecture Health Portal",
    description: "Verified network hospitals, instant cashless pre-authorization, and real-time ICU telemetry.",
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
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-canvas font-body-md text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container">
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
