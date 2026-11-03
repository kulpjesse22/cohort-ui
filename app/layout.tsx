import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Lato, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// Lato is what Slack ships in its product UI. Humanist rather than geometric:
// open apertures and warmer letterforms, which is the difference between
// "workplace tool" and "generated dashboard". Slack's headline face, Larsseit,
// is proprietary and not licensable, so Lato does the whole job here.
const sans = Lato({
  variable: "--font-sans-ui",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

// Lato has no monospace companion. JetBrains Mono has a tall x-height, so file
// paths sit optically level with Lato body text instead of shrinking beside it.
const mono = JetBrains_Mono({
  variable: "--font-mono-ui",
  subsets: ["latin"],
  display: "swap",
});

// The lead face: one element per screen (a title, a figure, the promotion).
// A grotesk with ink traps and a heavy end, close to the wordmark's weight,
// so the thing that leads a screen sounds like the product rather than the
// interface around it. Lato reads and operates; mono marks the repo record.
const display = Bricolage_Grotesque({
  variable: "--font-display-ui",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cohort — HAI-Harness",
  description: "A Slack-style workspace for the HAI-Harness agent roster.",
  applicationName: "Cohort",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Cohort" },
};

// viewportFit=cover lets the layout reach under the notch and home indicator,
// which the .safe-* classes then pad back. userScalable stays on — zoom is an
// accessibility affordance, and the 16px input rule already prevents the
// unwanted auto-zoom on focus.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1c" },
  ],
};

// Runs before first paint, so the theme is applied without a flash of the
// wrong one. Light is the default; the OS preference only seeds a first
// visit, and an explicit choice always wins.
//
// `?theme=dark|light` overrides that for the visit (this tab, reloads
// included) and is never stored as the preference, so an embed or a demo link
// cannot change what the person chose. The param is then dropped from the URL,
// so a copied link does not carry it. The toggle ends the override.
//
// React logs "Encountered a script tag while rendering React component" for
// this in dev. It is the standard no-flash pattern (next-themes does the same)
// and the script does execute during SSR, which is the only time it needs to.
const THEME_INIT = `(function(){var d=document.documentElement,t=null,K='cohort-theme',V='cohort-theme-visit';
try{var u=new URL(location.href),p=u.searchParams.get('theme');
if(p==='dark'||p==='light'){t=p;try{sessionStorage.setItem(V,p)}catch(e){}
u.searchParams.delete('theme');try{history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}}}catch(e){}
if(!t){try{t=sessionStorage.getItem(V)}catch(e){}}
if(t!=='dark'&&t!=='light'){try{t=localStorage.getItem(K)}catch(e){}}
if(t!=='dark'&&t!=='light'){try{t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){t='light'}}
d.classList.toggle('dark',t==='dark');})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading the request makes every page render per request, which the CSP
  // nonce requires (proxy.ts): a prerendered page has no nonce to carry.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Browsers hide a nonce from the DOM after parsing, so hydration sees "". */}
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="flex h-full min-h-full flex-col bg-canvas">{children}</body>
    </html>
  );
}
