import type { Metadata, Viewport } from "next";
import { Figtree, IBM_Plex_Mono, Young_Serif } from "next/font/google";
import { Dock, PlayerSheet } from "@/components/Dock";
import { OnboardingGate } from "@/components/OnboardingGate";
import { PlayerProvider } from "@/components/Player";
import "./globals.css";

const display = Young_Serif({ variable: "--font-display", weight: "400", subsets: ["latin"] });
const body = Figtree({ variable: "--font-body", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", weight: ["400", "500"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NatureMe",
  description: "The home of nature audio, mapped to where you are.",
};

export const viewport: Viewport = { viewportFit: "cover", width: "device-width", initialScale: 1, themeColor: "#17281F", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <PlayerProvider>
          <OnboardingGate />
          <div className="app">{children}</div>
          <Dock />
          <PlayerSheet />
        </PlayerProvider>
      </body>
    </html>
  );
}
