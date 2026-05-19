import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ChunkLoadRecovery } from "@/components/providers/chunk-load-recovery";
import { getFirebaseConfigFromEnv } from "@/firebase/config";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firebaseConfig = getFirebaseConfigFromEnv();

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Tu diario de recuerdos personales. Fotos, notas de voz y momentos que importan.",
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${inter.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <ChunkLoadRecovery />
        <AppProviders firebaseConfig={firebaseConfig}>{children}</AppProviders>
      </body>
    </html>
  );
}
