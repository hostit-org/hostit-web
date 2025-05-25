import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/auth/header-auth";
import { ThemeSwitcher } from "@/components/shared/common/theme-switcher";
import GoogleOneTap from "@/components/auth/google-one-tap";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "HostIt - AI Tool Ecosystem",
  description: "The universal platform for AI tools - anyone can easily use and share AI tools on our open source platform",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthWrapper>
                {children}
          </AuthWrapper>
        </ThemeProvider>
        <GoogleOneTap />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
