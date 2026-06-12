import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Portal de Super Administrador | Even",
  description: "Portal de Super Administrador de Even",
  icons: {
    icon: [
      {
        url: "/even-assets/even-icon.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/even-assets/even-icon.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${dmMono.className} ${dmMono.variable}`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
