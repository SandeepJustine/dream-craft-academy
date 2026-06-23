import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DreamCraft Christian Institute - Free Online Christian Education",
  description: "Free online Christian courses to grow in faith and purpose. Learn anytime, anywhere with DreamCraft Christian Institute's accessible Bible college education.",
  keywords: ["Free Christian courses", "Christian leadership training", "Biblical education online", "Free Bible courses", "Christian education", "Ministry training"],
  authors: [{ name: "DreamCraft Christian Institute" }],
  openGraph: {
    title: "DreamCraft Christian Institute",
    description: "Free online Christian courses to grow in faith and purpose. 100% free, learn anytime, anywhere.",
    url: "https://www.dreamcraftinstitute.org",
    siteName: "DreamCraft Christian Institute",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
