import { supabase } from "./supabase";
import type { PlaySession, WishlistItem } from "./types";

export async function logSession(session: Omit<PlaySession, "id" | "created_at">) {
  const { data, error } = await supabase.from("play_sessions").insert(session).select().single();
  if (error) throw error;
  return data as PlaySession;
}

export async function getSessions(userId: string) {
  const { data, error } = await supabase
    .from("play_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false });
  if (error) throw error;
  return (data || []) as PlaySession[];
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from("play_sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function addToWishlist(item: Omit<WishlistItem, "id" | "added_at">) {
  const { data, error } = await supabase.from("wishlist").upsert(item, { onConflict: "user_id,game_id" }).select().single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function getWishlist(userId: string) {
  const { data, error } = await supabase.from("wishlist").select("*").eq("user_id", userId).order("added_at", { ascending: false });
  if (error) throw error;
  return (data || []) as WishlistItem[];
}

export async function removeFromWishlist(id: string) {
  const { error } = await supabase.from("wishlist").delete().eq("id", id);
  if (error) throw error;
}

export async function setFeedback(userId: string, gameId: number, liked: boolean) {
  const { error } = await supabase.from("game_feedback").upsert(
    { user_id: userId, game_id: gameId, liked },
    { onConflict: "user_id,game_id" }
  );
  if (error) throw error;
}

export async function getGoals(userId: string) {
  const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId).order("created_at");
  if (error) throw error;
  return data || [];
}

export async function addGoal(userId: string, label: string) {
  const { data, error } = await supabase.from("goals").insert({ user_id: userId, label }).select().single();
  if (error) throw error;
  return data;
}

export async function toggleGoal(id: string, done: boolean) {
  const { error } = await supabase.from("goals").update({ done }).eq("id", id);
  if (error) throw error;
}

export function computeAnalytics(sessions: PlaySession[]) {
  const totalMinutes = sessions.reduce((a, s) => a + (s.minutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const byGame = new Map<string, number>();
  sessions.forEach((s) => byGame.set(s.game_name, (byGame.get(s.game_name) || 0) + s.minutes));
  const topGames = [...byGame.entries()]
    .map(([name, minutes]) => ({ name, hours: Math.round((minutes / 60) * 10) / 10 }))
    .sort((a, b) => b.hours - a.hours);

  const byMood = new Map<string, number>();
  sessions.forEach((s) => { if (s.mood) byMood.set(s.mood, (byMood.get(s.mood) || 0) + 1); });
  const moodBreakdown = [...byMood.entries()].map(([mood, count]) => ({ mood, count }));

  const statTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    Object.entries(s.stats || {}).forEach(([k, v]) => {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isNaN(n)) statTotals[k] = (statTotals[k] || 0) + n;
    });
  });

  const kd = statTotals.deaths ? Math.round((statTotals.kills / statTotals.deaths) * 100) / 100 : null;
  const headshotPct = statTotals.kills ? Math.round(((statTotals.headshots || 0) / statTotals.kills) * 1000) / 10 : null;

  const longest = sessions.reduce((max, s) => (s.minutes > (max?.minutes || 0) ? s : max), null as PlaySession | null);

  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  sessions.forEach((s) => { dowCounts[new Date(s.played_at).getDay()] += s.minutes; });
  const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mostActiveDayIdx = dowCounts.indexOf(Math.max(...dowCounts));
  const mostActiveDay = sessions.length ? DOW[mostActiveDayIdx] : null;

  const weekMap = new Map<string, number>();
  sessions.forEach((s) => {
    const d = new Date(s.played_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weekMap.set(key, (weekMap.get(key) || 0) + s.minutes);
  });
  const weeklyTrend = [...weekMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([week, minutes]) => ({ week: week.slice(5), hours: Math.round((minutes / 60) * 10) / 10 }));

  return {
    totalHours,
    sessionCount: sessions.length,
    topGames,
    moodBreakdown,
    statTotals,
    kd,
    headshotPct,
    longestSessionHours: longest ? Math.round((longest.minutes / 60) * 10) / 10 : null,
    longestSessionGame: longest?.game_name || null,
    mostActiveDay,
    weeklyTrend,
  };
}
