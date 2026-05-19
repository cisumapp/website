import {ClerkProvider, SignInButton, SignUpButton, Show, UserButton} from "@clerk/nextjs";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleSansFlex = localFont({
  src: "../../public/fonts/google-sans-flex.ttf",
  variable: "--font-google-sans-flex",
  display: "swap",
  weight: "100 1000",
});

export const metadata: Metadata = {
  title: "cisum",
  description: "the music app your phone needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${googleSansFlex.variable} font-sans antialiased`}
      >
        <ClerkProvider
          signInUrl="/login"
          signUpUrl="/login"
          signInForceRedirectUrl="/play"
          signUpForceRedirectUrl="/play"
        >
          <PostHogIdentify />
          <header>
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}