import type { Metadata } from "next";
import { ShareLanding } from "@/components/ShareLanding";
import { first, openInAppURL, type SearchParams } from "@/lib/shareLink";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  const title = first(sp.title) ?? "Song";
  const artist = first(sp.artist) ?? "";
  const art = first(sp.art);
  const heading = artist ? `${title} · ${artist}` : title;
  const description = artist ? `${artist} — shared on cisum` : "Shared on cisum";
  return {
    title: `${heading} | cisum`,
    description,
    openGraph: { title: heading, description, images: art ? [art] : undefined, type: "music.song" },
    twitter: { card: "summary", title: heading, description, images: art ? [art] : undefined },
  };
}

export default async function SongPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  return (
    <ShareLanding
      badge="Song"
      title={first(sp.title) ?? "Song"}
      subtitle={first(sp.artist)}
      artworkURL={first(sp.art)}
      openURL={openInAppURL("song", sp)}
    />
  );
}
