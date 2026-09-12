export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic: number | null;
  playtime: number;
  genres: { id: number; name: string; slug: string }[];
  platforms?: { platform: { id: number; name: string; slug: string } }[];
  tags?: { id: number; name: string; slug: string }[];
  esrb_rating?: { id: number; name: string } | null;
  stores?: { store: { id: number; name: string; slug: string } }[];
  short_screenshots?: { id: number; image: string }[];
}

export interface RawgGameDetail extends RawgGame {
  description_raw?: string;
  developers?: { id: number; name: string }[];
  publishers?: { id: number; name: string }[];
  website?: string;
}

export interface GamingDNA {
  genres: string[];
  franchises: string[];
  favoriteGameIds: number[];
  hoursPerWeek: number;
  budget: "free" | "low" | "mid" | "high";
  graphics: "low" | "medium" | "high" | "ultra";
  playstyles: string[];
  difficulty: "relaxed" | "balanced" | "hard" | "brutal";
  mechanics: string[];
  personality: string;
  computedAt: string;
}

export type StatField =
  | "kills" | "deaths" | "headshots" | "assists" | "wins" | "losses"
  | "rageQuits" | "weaponUsed" | "vehicleUsed" | "bossesDefeated" | "deathsToBoss"
  | "questsCompleted" | "achievementsUnlocked" | "notes";

export interface PlaySession {
  id: string;
  user_id: string;
  game_id: number;
  game_name: string;
  game_image: string | null;
  played_at: string;
  minutes: number;
  mood: string | null;
  stats: Partial<Record<StatField, number | string>>;
  created_at?: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  game_id: number;
  game_name: string;
  game_image: string | null;
  priority: "low" | "normal" | "high";
  added_at: string;
}

export interface Profile {
  id: string;
  name: string;
  username: string;
  country: string | null;
  avatar_url: string | null;
  created_at?: string;
}
