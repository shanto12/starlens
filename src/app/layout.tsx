import type { Metadata } from "next";
import Link from "next/link";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import "./globals.css";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/intake", label: "Intake" },
  { href: "/results", label: "Results" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://starlens.app"),
  title: {
    default: "Starlens - Short-horizon life guidance",
    template: "%s | Starlens",
  },
  description:
    "Starlens delivers 3-24 month life guidance across Western Astrology, Vedic/Jyotish, Chinese BaZi, and Numerology with optional Tarot, relocation, and home insights.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-body text-foreground antialiased">
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 sm:px-6">
            <header className="sticky top-0 z-50 -mx-4 mb-10 border-b border-border/60 bg-body/90 px-4 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
                <Link href="/" className="text-lg font-semibold text-foreground">
                  Starlens
                </Link>
                <nav
                  aria-label="Main navigation"
                  className="hidden gap-6 text-sm font-medium text-muted-foreground sm:flex"
                >
                  {navigation.map((item) => (
                    <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button asChild>
                    <Link href="/intake">Start free reading</Link>
                  </Button>
                </div>
              </div>
              <nav
                aria-label="Mobile navigation"
                className="flex gap-4 overflow-x-auto pb-4 text-sm font-medium text-muted-foreground sm:hidden"
              >
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} className="whitespace-nowrap border-b-2 border-transparent pb-1 transition hover:text-foreground">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            <div className="flex flex-1 flex-col">{children}</div>
            <footer className="mt-16 rounded-3xl border border-border/70 bg-surface px-6 py-8 text-sm text-muted-foreground shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {"\u00A9"} {new Date().getFullYear()} Starlens. Interpretive guidance only. Not a substitute for medical, legal, or financial advice.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/privacy" className="underline">
                    Privacy
                  </Link>
                  <Link href="/about" className="underline">
                    Methodology
                  </Link>
                  <a href="mailto:support@starlens.app" className="underline">
                    Support
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
