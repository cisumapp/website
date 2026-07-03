import Link from "next/link";
import type { ReactNode } from "react";

export function ShareLanding({
  badge,
  title,
  subtitle,
  artworkURL,
  openURL,
  children,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  artworkURL?: string;
  openURL: string;
  children?: ReactNode;
}) {
  return (
    <main className="min-h-dvh w-full flex items-center justify-center bg-black text-white px-6 py-16">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
        <div className="size-48 rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-2xl flex items-center justify-center">
          {artworkURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artworkURL} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-5xl opacity-40">♫</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs uppercase tracking-widest text-white/40">{badge}</span>
          <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
          {subtitle ? <p className="text-white/60">{subtitle}</p> : null}
        </div>

        <a
          href={openURL}
          className="w-full rounded-full bg-white text-black font-semibold py-3.5 transition-opacity hover:opacity-90"
        >
          Open in cisum
        </a>

        {children}

        <Link href="/downloads" className="text-sm text-white/40 hover:text-white/70 transition-colors">
          Don&apos;t have cisum? Get it →
        </Link>
      </div>
    </main>
  );
}
