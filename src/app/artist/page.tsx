import type { Metadata } from "next";
import { ShareLanding } from "@/components/ShareLanding";
import { first, openInAppURL, type SearchParams } from "@/lib/shareLink";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  const name = first(sp.name) ?? "Artist";
  const art = first(sp.art);
  const description = `${name} — shared on cisum`;
  return {
    title: `${name} | cisum`,
    description,
    openGraph: { title: name, description, images: art ? [art] : undefined, type: "profile" },
    twitter: { card: "summary", title: name, description, images: art ? [art] : undefined },
  };
}

export default async function ArtistPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  return (
    <ShareLanding
      badge="Artist"
      title={first(sp.name) ?? "Artist"}
      artworkURL={first(sp.art)}
      openURL={openInAppURL("artist", sp)}
    />
  );
}
