import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { TodaysMatchesSidebar } from "@/components/TodaysMatchesSidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FootballStats — Live League Rankings & Player Stats",
  description:
    "Real-time football statistics: top scorers, assists, penalty leaders, and league standings for the top 10 leagues worldwide.",
  keywords: ["football", "soccer", "stats", "premier league", "la liga", "serie a"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 flex">
              <main className="flex-1 pr-0 lg:pr-64 transition-all">
                {children}
              </main>
              <TodaysMatchesSidebar />
            </div>
            <footer className="border-t border-gray-100 dark:border-white/5 py-6 lg:pr-64">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Updated every 5 minutes · Built with Next.js
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
