import type { RawgGame, RawgGameDetail } from "./types";

const KEY = import.meta.env.VITE_RAWG_API_KEY as string;
const BASE = "https://api.rawg.io/api";

if (!KEY) {
  // eslint-disable-next-line no-console
  console.warn("VITE_RAWG_API_KEY is missing — game data will fail to load. See README.");
}

async function rawgGet<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("key", KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`RAWG request failed (${res.status}): ${path}`);
  return res.json();
}

export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function searchGames(query: string, pageSize = 12) {
  return rawgGet<RawgListResponse<RawgGame>>("/games", { search: query, page_size: pageSize });
}

export function getGameDetail(id: number) {
  return rawgGet<RawgGameDetail>(`/games/${id}`);
}

export function getGameScreenshots(id: number) {
  return rawgGet<RawgListResponse<{ id: number; image: string }>>(`/games/${id}/screenshots`);
}

export function getGamesByGenres(genreSlugs: string[], opts: { ordering?: string; pageSize?: number; excludeIds?: number[] } = {}) {
  return rawgGet<RawgListResponse<RawgGame>>("/games", {
    genres: genreSlugs.join(","),
    ordering: opts.ordering || "-rating",
    page_size: opts.pageSize || 20,
    exclude_additions: "true" as unknown as number,
  }).then((r) => {
    if (opts.excludeIds?.length) {
      r.results = r.results.filter((g) => !opts.excludeIds!.includes(g.id));
    }
    return r;
  });
}

export function getGamesByTags(tagSlugs: string[], opts: { ordering?: string; pageSize?: number } = {}) {
  return rawgGet<RawgListResponse<RawgGame>>("/games", {
    tags: tagSlugs.join(","),
    ordering: opts.ordering || "-rating",
    page_size: opts.pageSize || 20,
  });
}

export function getTrendingGames(pageSize = 16) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 90);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return rawgGet<RawgListResponse<RawgGame>>("/games", {
    dates: `${fmt(from)},${fmt(to)}`,
    ordering: "-added",
    page_size: pageSize,
  });
}

export function getUpcomingGames(pageSize = 12) {
  const from = new Date();
  const to = new Date();
  to.setMonth(to.getMonth() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return rawgGet<RawgListResponse<RawgGame>>("/games", {
    dates: `${fmt(from)},${fmt(to)}`,
    ordering: "-added",
    page_size: pageSize,
  });
}

export function getHiddenGems(genreSlugs: string[] = [], pageSize = 16) {
  return rawgGet<RawgListResponse<RawgGame>>("/games", {
    genres: genreSlugs.join(",") || undefined,
    ordering: "-rating",
    page_size: pageSize * 2,
  }).then((r) => ({
    ...r,
    results: r.results.filter((g) => g.ratings_count < 2500 && g.rating >= 3.8).slice(0, pageSize),
  }));
}

export function getGenres() {
  return rawgGet<RawgListResponse<{ id: number; name: string; slug: string }>>("/genres", { page_size: 20 });
}

export function getTags(pageSize = 40) {
  return rawgGet<RawgListResponse<{ id: number; name: string; slug: string }>>("/tags", { page_size: pageSize });
}

export async function getSimilarGames(game: RawgGame, pageSize = 6) {
  const genreSlug = game.genres?.[0]?.slug;
  if (!genreSlug) return [];
  const r = await getGamesByGenres([genreSlug], { pageSize: pageSize + 6 });
  return r.results.filter((g) => g.id !== game.id).slice(0, pageSize);
}
