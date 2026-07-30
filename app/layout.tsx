import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Cohort — HAI-Harness",
  description: "A Slack-style workspace for the HAI-Harness agent roster.",
};

// Runs before first paint, so the stored choice is applied without a flash of
// the wrong theme. Light is the default; the OS preference only seeds a first
// visit, and an explicit choice always wins.
//
// React logs "Encountered a script tag while rendering React component" for
// this in dev. It is the standard no-flash pattern (next-themes does the same)
// and the script does execute during SSR, which is the only time it needs to.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('cohort-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="flex h-full min-h-full flex-col bg-canvas">{children}</body>
    </html>
  );
}
