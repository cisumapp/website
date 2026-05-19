import React from 'react';
import { Play, Shuffle, Star, MoreHorizontal, Search } from 'lucide-react';

interface ArtistHeroProps {
  name: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  imageUrl?: string;
  onPlayAll?: () => void;
  onShuffle?: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export const ArtistHero: React.FC<ArtistHeroProps> = ({
  name,
  imageUrl,
  onPlayAll,
  onShuffle,
  isFavorited = false,
  onToggleFavorite,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}) => {
  const heroImage = imageUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop';
  const displayName = name.trim() || 'Untitled';

  return (
    <section className="relative isolate overflow-hidden rounded-[36px] border border-white/[0.10] bg-[#07111c] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.08] transition duration-[2400ms] ease-out"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.34),rgba(255,255,255,0.12)_12%,rgba(7,15,27,0.08)_34%,rgba(7,11,19,0.76)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-[#07111c]/95" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_18%,rgba(4,8,16,0)_52%,rgba(4,8,16,0.25)_74%,rgba(4,8,16,0.88)_100%)]" />

      <div className="relative z-10 flex min-h-[560px] flex-col px-5 py-5 md:min-h-[650px] md:px-8 md:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.10] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.8)]" />
            now playing
          </div>

          {onSearchChange && onSearchSubmit ? (
            <form onSubmit={onSearchSubmit} className="group relative w-full sm:max-w-[18rem]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search artist"
                className="w-full rounded-full border border-white/[0.12] bg-black/[0.20] px-5 py-3 pl-11 text-sm text-white placeholder:text-white/35 outline-none backdrop-blur-xl transition focus:border-white/[0.25] focus:bg-black/[0.28]"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45 transition group-focus-within:text-white/70" />
            </form>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.45em] text-white/55">
            artist spotlight
          </p>
          <h1
            className="max-w-[11ch] text-[clamp(4rem,10vw,7.8rem)] font-semibold leading-[0.88] tracking-[0.06em] text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {displayName}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            An expansive, artwork-first header that keeps the current artist and search flow
            alive while matching the sparse, editorial feel of the reference design.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {onPlayAll ? (
              <button
                type="button"
                onClick={onPlayAll}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.16] px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.22]"
              >
                <Play className="h-4 w-4 fill-white stroke-none" />
                Play all
              </button>
            ) : null}

            {onShuffle ? (
              <button
                type="button"
                onClick={onShuffle}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/[0.18] px-5 py-3 text-sm font-semibold text-white/88 backdrop-blur-xl transition hover:bg-black/[0.28] hover:text-white"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle
              </button>
            ) : null}

            {onToggleFavorite ? (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-xl transition ${
                  isFavorited
                    ? 'border-sky-400/30 bg-sky-400/[0.15] text-sky-200 shadow-[0_0_0_1px_rgba(56,189,248,0.2)]'
                    : 'border-white/[0.12] bg-black/[0.18] text-white/75 hover:bg-white/[0.12] hover:text-white'
                }`}
                aria-pressed={isFavorited}
              >
                <Star className={`h-4 w-4 ${isFavorited ? 'fill-sky-200 stroke-none' : ''}`} />
              </button>
            ) : null}

            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-black/[0.18] text-white/75 backdrop-blur-xl transition hover:bg-white/[0.12] hover:text-white"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-white/[0.10] pt-5 text-[11px] text-white/55">
          <div className="max-w-md">
            <p className="uppercase tracking-[0.28em] text-white/38">Immersive header</p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Artwork, typography, and controls are arranged to stay visually close to the
              reference while still driving the current `/play` data.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
              Search
            </span>
            <span className="rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
              Visual first
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
