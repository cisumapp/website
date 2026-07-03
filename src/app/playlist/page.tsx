import type { Metadata } from "next";
import { ShareLanding } from "@/components/ShareLanding";
import { first, openInAppURL, type SearchParams } from "@/lib/shareLink";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Track = { title?: string; artist?: string };
type Payload = {
  type?: string;
  name?: string;
  author?: string;
  tracks?: Track[];
};

async function fetchPayload(id?: string): Promise<Payload | null> {
  if (!id) return null;
  try {
    const admin = getSupabaseAdminClient();
    const { data } = await admin
      .from("shared_playlists")
      .select("payload")
      .eq("id", id)
      .maybeSingle();
    return (data?.payload as Payload) ?? null;
  } catch {
    return null;
  }
}

function displayName(sp: SearchParams, payload: Payload | null): string {
  return first(sp.name) ?? payload?.name ?? "Playlist";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  const payload = await fetchPayload(first(sp.id));
  const name = displayName(sp, payload);
  const author = first(sp.author) ?? payload?.author;
  const count = payload?.tracks?.length;
  const description = [count ? `${count} songs` : null, author ? `by ${author}` : null, "shared on cisum"]
    .filter(Boolean)
    .join(" · ");
  return {
    title: `${name} | cisum`,
    description,
    openGraph: { title: name, description, type: "music.playlist" },
    twitter: { card: "summary", title: name, description },
  };
}

export default async function PlaylistPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const payload = await fetchPayload(first(sp.id));
  const name = displayName(sp, payload);
  const author = first(sp.author) ?? payload?.author;
  const tracks = payload?.tracks ?? [];
  const subtitleParts = [
    tracks.length ? `${tracks.length} songs` : null,
    author ? `by ${author}` : null,
  ].filter(Boolean);

  return (
    <ShareLanding
      badge="Playlist"
      title={name}
      subtitle={subtitleParts.join(" · ") || undefined}
      openURL={openInAppURL("playlist", sp)}
    >
      {tracks.length > 0 ? (
        <ul className="w-full flex flex-col divide-y divide-white/5 rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
          {tracks.slice(0, 20).map((track, index) => (
            <li key={index} className="flex items-center gap-3 px-4 py-2.5 text-left">
              <span className="text-xs text-white/30 w-5 tabular-nums">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{track.title ?? "Unknown"}</p>
                {track.artist ? <p className="truncate text-xs text-white/50">{track.artist}</p> : null}
              </div>
            </li>
          ))}
          {tracks.length > 20 ? (
            <li className="px-4 py-2.5 text-xs text-white/40">+ {tracks.length - 20} more</li>
          ) : null}
        </ul>
      ) : null}
    </ShareLanding>
  );
}
