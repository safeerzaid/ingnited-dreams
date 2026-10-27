import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import InaugurationPopup from "@/components/InaugurationPopup";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// Serif used only for the memorial tribute on the home page
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ignited Dreams Integrated — Skill Academy & Career Launchpad",
  description:
    "Master Transportation & Logistics Management with SAP ERP and Aviation Operations at pure running cost (₹25,000 all-inclusive) with live interactive classes and a 7-day revision engine.",
  keywords: [
    "logistics academy",
    "SAP S/4HANA training",
    "transportation management",
    "aviation ground operations",
    "7-day revision recordings",
    "running cost education",
    "Ignited Dreams Kerala",
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${cormorant.variable} ${plusJakarta.className}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakarta.className} min-h-screen bg-white text-[#0e271d] antialiased flex flex-col font-sans selection:bg-[#b5f93d] selection:text-[#0e271d]`}>
        <AuthProvider>{children}</AuthProvider>
        <InaugurationPopup />
      </body>
    </html>
  );
}
