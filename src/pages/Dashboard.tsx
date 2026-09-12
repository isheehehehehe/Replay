import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight, Sparkles, Target, Quote } from "lucide-react";
import { useApp } from "../lib/store";
import { getGamesByGenres, getTrendingGames, getUpcomingGames } from "../lib/rawg";
import { getSessions, getWishlist, getGoals, addGoal, toggleGoal, computeAnalytics } from "../lib/data";
import type { RawgGame } from "../lib/types";
import Row from "../components/discover/Row";
import Reveal from "../components/ui/Reveal";
import Counter from "../components/ui/Counter";
import { PERSONALITY_BLURB } from "../lib/dna";

const QUOTES = [
  "The grind is the game.",
  "Every death is data.",
  "Backlogs are just future favorites, delayed.",
  "You don't finish a game. You leave it changed.",
  "The best save file is the one you actually load.",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, dna } = useApp();
  const [loved, setLoved] = useState<RawgGame[]>([]);
  const [trending, setTrending] = useState<RawgGame[]>([]);
  const [upcoming, setUpcoming] = useState<RawgGame[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [analytics, setAnalytics] = useState<ReturnType<typeof computeAnalytics> | null>(null);
  const [goals, setGoals] = useState<{ id: string; label: string; done: boolean }[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    if (!dna) return;
    (async () => {
      setLoadingRows(true);
      const [lovedRes, trendRes, upRes] = await Promise.all([
        dna.genres.length ? getGamesByGenres(dna.genres, { pageSize: 12 }) : Promise.resolve({ results: [] } as any),
        getTrendingGames(12),
        getUpcomingGames(10),
      ]);
      setLoved(lovedRes.results);
      setTrending(trendRes.results);
      setUpcoming(upRes.results);
      setLoadingRows(false);
    })();
  }, [dna]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [wl, sessions, g] = await Promise.all([getWishlist(user.id), getSessions(user.id), getGoals(user.id)]);
      setWishlistCount(wl.length);
      setAnalytics(computeAnalytics(sessions));
      setGoals(g as any);
    })();
  }, [user]);

  if (!dna) {
    return (
      <div className="container-px py-24 max-w-lg mx-auto text-center">
        <h2 className="text-xl font-bold mb-2">Let's build your Gaming DNA first</h2>
        <p className="text-dim text-sm mb-6">Takes about five minutes and everything here depends on it.</p>
        <button className="btn btn-glow" onClick={() => navigate("/onboarding")}>Start onboarding <ArrowRight size={16} /></button>
      </div>
    );
  }

  const submitGoal = async () => {
    if (!newGoal.trim() || !user) return;
    const g = await addGoal(user.id, newGoal.trim());
    setGoals((arr) => [...arr, g as any]);
    setNewGoal("");
  };

  return (
    <div className="container-px py-10 max-w-7xl mx-auto">
      <Reveal>
        <h1 className="text-3xl font-bold mb-1">Welcome back, {profile?.name?.split(" ")[0] || "player"}.</h1>
        <p className="text-dim mb-8">Here's what your Gaming DNA says today.</p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
        <Reveal>
          <div className="glass p-6 h-full">
            <div className="font-logo text-[9px] text-cyan-glow mb-3">GAMING PERSONALITY</div>
            <div className="text-2xl font-bold mb-2">{dna.personality}</div>
            <p className="text-sm text-dim leading-relaxed">{PERSONALITY_BLURB[dna.personality]}</p>
            <button className="btn-ghost mt-4 !px-0 text-cyan-glow" onClick={() => navigate("/onboarding")}>Retake profile →</button>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="glass p-6 h-full">
            <div className="font-logo text-[9px] text-cyan-glow mb-3">YOUR STATS SO FAR</div>
            {analytics && analytics.sessionCount > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div><Counter value={analytics.totalHours} decimals={1} suffix="h" /><div className="text-xs text-muted mt-1">logged</div></div>
                <div><Counter value={analytics.sessionCount} /><div className="text-xs text-muted mt-1">sessions</div></div>
              </div>
            ) : (
              <p className="text-sm text-dim leading-relaxed">No sessions logged yet — log your first play session to start building real analytics.</p>
            )}
            <button className="btn-ghost mt-4 !px-0 text-cyan-glow" onClick={() => navigate("/analytics")}>Log a session →</button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass p-6 h-full flex flex-col justify-between">
            <div>
              <div className="font-logo text-[9px] text-cyan-glow mb-3 flex items-center gap-2"><Quote size={11} /> QUOTE OF THE DAY</div>
              <p className="text-sm italic text-dim leading-relaxed">"{quote}"</p>
            </div>
            <button className="btn-ghost mt-4 !px-0 text-cyan-glow" onClick={() => navigate("/wishlist")}>{wishlistCount} games on your wishlist →</button>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="glass p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Target size={15} className="text-cyan-glow" />
            <h3 className="font-semibold">Gaming goals</h3>
          </div>
          <div className="space-y-2 mb-4">
            {goals.map((g) => (
              <label key={g.id} className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={g.done} onChange={async (e) => {
                  await toggleGoal(g.id, e.target.checked);
                  setGoals((arr) => arr.map((x) => x.id === g.id ? { ...x, done: e.target.checked } : x));
                }} className="accent-cyan-glow w-4 h-4" />
                <span className={g.done ? "line-through text-muted" : ""}>{g.label}</span>
              </label>
            ))}
            {goals.length === 0 && <p className="text-sm text-muted">No goals yet — add one below.</p>}
          </div>
          <div className="flex gap-2">
            <input className="field" placeholder="e.g. Finish Baldur's Gate 3" value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitGoal()} />
            <button className="btn btn-outline !px-4" onClick={submitGoal}><Plus size={15} /></button>
          </div>
        </div>
      </Reveal>

      <Row title="Genres you love" subtitle="Matched to your Gaming DNA" games={loved} loading={loadingRows} />
      <Row title="Trending now" subtitle="Most active in the last 90 days, via RAWG" games={trending} loading={loadingRows} />
      <Row title="Upcoming releases" subtitle="Coming in the next 6 months" games={upcoming} loading={loadingRows} />

      <Reveal>
        <div className="glass p-6 flex items-center gap-3">
          <Sparkles size={18} className="text-cyan-glow flex-shrink-0" />
          <p className="text-sm text-dim">Want sharper picks? <button className="text-cyan-glow underline" onClick={() => navigate("/recommend")}>Tell us your mood</button> and get an explained recommendation set.</p>
        </div>
      </Reveal>
    </div>
  );
}
