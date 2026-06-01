import {ClerkProvider} from "@clerk/nextjs";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cisum.studio"),
  title: "cisum | The Music App Your Phone Needs",
  icons: {
    icon: "/app.jpg",
    apple: "/app.jpg",
  },
  description: "Experience bit-perfect audio, offline-first playback, and bring your own data. cisum is an open-source, ad-free music streaming app for the modern user.",
  keywords: ["cisum", "music app", "streaming", "lossless audio", "open source music player", "offline music"],
  openGraph: {
    title: "cisum | The Music App Your Phone Needs",
    description: "Experience bit-perfect audio, offline-first playback, and bring your own data. cisum is an open-source, ad-free music streaming app.",
    url: "https://www.cisum.studio",
    siteName: "cisum",
    images: [
      {
        url: "/app.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cisum | The Music App Your Phone Needs",
    description: "Experience bit-perfect audio, offline-first playback, and bring your own data.",
    images: ["/app.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="audio" href="/background.m4a" type="audio/mp4" />
      </head>
      <body
        className="font-sans antialiased"
      >
        {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_') ? (
          <>{children}</>
        ) : (
          <ClerkProvider
            signInUrl="/login"
            signUpUrl="/login"
            signInForceRedirectUrl="/play"
            signUpForceRedirectUrl="/play"
          >
            <PostHogIdentify />
            {children}
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}