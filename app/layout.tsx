import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Signal Phase Timing — AI-Powered UTDF Extraction",
    template: "%s | Signal Phase Timing",
  },
  description:
    "Turn legacy traffic signal controller PDFs into Synchro-ready UTDF CSV files in seconds. Powered by Mistral OCR and Gemini 2.5 Pro.",
  keywords: [
    "UTDF", "traffic signal", "Synchro", "OCR", "signal timing",
    "transportation engineering", "traffic engineering", "DOT",
  ],
  openGraph: {
    title: "Signal Phase Timing — AI-Powered UTDF Extraction",
    description: "Turn legacy PDFs into Synchro-ready UTDFs in seconds.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}