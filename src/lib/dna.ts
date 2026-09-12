import type { GamingDNA, RawgGame } from "./types";

export function computePersonality(input: {
  playstyles: string[];
  mechanics: string[];
  genres: string[];
}): string {
  const p = new Set(input.playstyles.map((s) => s.toLowerCase()));
  const m = new Set(input.mechanics.map((s) => s.toLowerCase()));
  const g = new Set(input.genres.map((s) => s.toLowerCase()));

  const score: Record<string, number> = {
    Explorer: 0, Strategist: 0, Completionist: 0, "Story Lover": 0,
    Competitive: 0, Collector: 0, Speedrunner: 0, Socializer: 0,
  };

  if (p.has("exploration") || m.has("open world")) score.Explorer += 2;
  if (g.has("adventure") || m.has("parkour")) score.Explorer += 1;

  if (m.has("skill trees") || m.has("base management") || g.has("strategy")) score.Strategist += 2;
  if (m.has("crafting") || m.has("deck building")) score.Strategist += 1;

  if (p.has("completionist") || p.has("achievement hunter")) score.Completionist += 3;
  if (m.has("inventory management")) score.Completionist += 1;

  if (p.has("story") || m.has("choices matter")) score["Story Lover"] += 3;
  if (g.has("visual novel") || g.has("rpg")) score["Story Lover"] += 1;

  if (p.has("competitive") || g.has("battle royale") || g.has("fps")) score.Competitive += 3;

  if (m.has("character customization") || m.has("inventory management")) score.Collector += 2;

  if (p.has("speedrunner")) score.Speedrunner += 4;

  if (p.has("co-op") || p.has("multiplayer")) score.Socializer += 3;

  let best = "Explorer";
  let bestScore = -1;
  Object.entries(score).forEach(([k, v]) => { if (v > bestScore) { best = k; bestScore = v; } });
  return best;
}

export const PERSONALITY_BLURB: Record<string, string> = {
  Explorer: "You'd rather wander off the main path than finish the main quest on time.",
  Strategist: "You're planning three moves ahead before the game even loads.",
  Completionist: "100% or it didn't happen. Every collectible, every side quest.",
  "Story Lover": "You skip nothing. Every line of dialogue gets read.",
  Competitive: "Ranked, ladders, leaderboards — you're here to win.",
  Collector: "Your inventory is a museum and you're the curator.",
  Speedrunner: "Cutscenes are a suggestion. You're chasing the clock.",
  Socializer: "The game's fine, but it's better with people.",
};

export interface ScoredGame {
  game: RawgGame;
  score: number;
  reasons: string[];
}

const GENRE_WEIGHT = 34;
const TAG_WEIGHT = 24;
const QUALITY_WEIGHT = 18;
const LENGTH_WEIGHT = 14;
const FRANCHISE_WEIGHT = 10;

export function scoreGame(game: RawgGame, dna: GamingDNA): ScoredGame {
  let score = 0;
  const reasons: string[] = [];

  const gameGenreSlugs = (game.genres || []).map((g) => g.slug);
  const genreOverlap = gameGenreSlugs.filter((s) => dna.genres.includes(s));
  if (genreOverlap.length) {
    score += GENRE_WEIGHT * Math.min(1, genreOverlap.length / 2);
    reasons.push(`you're into ${genreOverlap.length > 1 ? genreOverlap.join(" and ") : genreOverlap[0]}`);
  }

  const tagNames = (game.tags || []).map((t) => t.name.toLowerCase());
  const mechMatches = dna.mechanics.filter((mech) =>
    tagNames.some((t) => t.includes(mech.toLowerCase()) || mech.toLowerCase().includes(t))
  );
  if (mechMatches.length) {
    score += TAG_WEIGHT * Math.min(1, mechMatches.length / 3);
    reasons.push(`it features ${mechMatches.slice(0, 2).join(" and ").toLowerCase()}`);
  }

  if (game.rating) {
    score += QUALITY_WEIGHT * (game.rating / 5);
    if (game.rating >= 4.3) reasons.push("it's very highly rated by other players");
  }

  if (game.playtime) {
    const idealMax = dna.hoursPerWeek <= 5 ? 15 : dna.hoursPerWeek <= 12 ? 40 : 999;
    const fit = game.playtime <= idealMax ? 1 : Math.max(0, 1 - (game.playtime - idealMax) / 40);
    score += LENGTH_WEIGHT * fit;
    if (fit > 0.8 && dna.hoursPerWeek <= 5) reasons.push("it fits a shorter play schedule");
  }

  const franchiseHit = dna.franchises.find((f) => game.name.toLowerCase().includes(f.toLowerCase()));
  if (franchiseHit) {
    score += FRANCHISE_WEIGHT;
    reasons.push(`you already like ${franchiseHit}`);
  }

  return { game, score: Math.round(score), reasons };
}

export function rankGames(games: RawgGame[], dna: GamingDNA, limit = 12): ScoredGame[] {
  return games
    .map((g) => scoreGame(g, dna))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function explain(scored: ScoredGame): string {
  if (!scored.reasons.length) return `A solid pick based on your overall taste profile.`;
  const list = scored.reasons.slice(0, 3);
  const joined = list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}` : list[0];
  return `We recommended ${scored.game.name} because ${joined}.`;
}

export interface MoodFilters {
  genres: string[];
  tags: string[];
  maxPlaytime?: number;
  ordering?: string;
  label: string;
}

const MOOD_RULES: { keywords: string[]; filters: Omit<MoodFilters, "label"> & { label: string } }[] = [
  { keywords: ["relax", "chill", "calm", "cozy"], filters: { genres: ["simulation", "puzzle"], tags: ["relaxing", "atmospheric"], ordering: "-rating", label: "Something relaxing" } },
  { keywords: ["elden ring", "souls", "soulslike", "dark souls"], filters: { genres: ["action", "role-playing-games-rpg"], tags: ["souls-like", "dark fantasy", "difficult"], ordering: "-rating", label: "More Souls-likes" } },
  { keywords: ["2 hour", "short", "quick", "little time"], filters: { genres: [], tags: ["short", "casual"], maxPlaytime: 5, ordering: "-rating", label: "Something short" } },
  { keywords: ["story", "narrative", "cinematic"], filters: { genres: ["adventure", "role-playing-games-rpg"], tags: ["story rich", "great soundtrack"], ordering: "-rating", label: "Story-driven picks" } },
  { keywords: ["cry", "emotional", "sad"], filters: { genres: ["adventure"], tags: ["sad", "emotional", "story rich"], ordering: "-rating", label: "Bring the tissues" } },
  { keywords: ["grind", "loot", "farm"], filters: { genres: ["role-playing-games-rpg"], tags: ["looter-shooter", "grinding", "rpg"], ordering: "-added", label: "Something to grind" } },
  { keywords: ["horror", "scary", "spooky"], filters: { genres: ["horror"], tags: ["horror", "survival horror"], ordering: "-rating", label: "Horror picks" } },
  { keywords: ["co-op", "coop", "friends", "multiplayer"], filters: { genres: [], tags: ["co-op", "multiplayer"], ordering: "-added", label: "Better with friends" } },
  { keywords: ["competitive", "ranked", "pvp"], filters: { genres: ["action", "shooter"], tags: ["pvp", "competitive"], ordering: "-added", label: "Competitive picks" } },
  { keywords: ["open world", "explore", "wander"], filters: { genres: ["action", "adventure"], tags: ["open world", "exploration"], ordering: "-rating", label: "Open worlds to get lost in" } },
];

export function parseMood(text: string): MoodFilters {
  const lower = text.toLowerCase();
  for (const rule of MOOD_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return { ...rule.filters, label: rule.filters.label };
    }
  }
  return { genres: [], tags: [], ordering: "-rating", label: "Broad picks based on your taste" };
}
