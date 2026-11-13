import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono, Newsreader } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  themeColor: "#1f3f34",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Repo Scout — noteworthy new GitHub repositories",
  description:
    "Discover recently created and fast-growing public GitHub repositories. Ranked by star velocity, activity, documentation, and license, with a reason on every card.",
  applicationName: "Repo Scout",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
