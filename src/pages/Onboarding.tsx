import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Search, Check, Loader2 } from "lucide-react";
import { useApp } from "../lib/store";
import { supabase } from "../lib/supabase";
import { searchGames } from "../lib/rawg";
import { computePersonality } from "../lib/dna";
import type { RawgGame } from "../lib/types";

const GENRES = [
  { name: "Action", slug: "action" }, { name: "Adventure", slug: "adventure" },
  { name: "RPG", slug: "role-playing-games-rpg" }, { name: "Shooter", slug: "shooter" },
  { name: "Strategy", slug: "strategy" }, { name: "Simulation", slug: "simulation" },
  { name: "Racing", slug: "racing" }, { name: "Indie", slug: "indie" },
  { name: "Puzzle", slug: "puzzle" }, { name: "Horror", slug: "horror" }, { name: "Sports", slug: "sports" },
  { name: "Platformer", slug: "platformer" },
];

const PLAYSTYLES = ["Competitive", "Casual", "Story", "Exploration", "Completionist", "Achievement Hunter", "Speedrunner", "Co-op", "Multiplayer", "Single Player"];
const MECHANICS = ["Crafting", "Open World", "Choices Matter", "Building", "Stealth", "Base Management", "Character Customization", "Inventory Management", "Skill Trees", "Magic", "Survival", "Parkour", "Combat", "Rhythm", "Deck Building"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm border transition-colors ${
        active ? "bg-cyan-glow/15 border-cyan-glow text-cyan-glow" : "border-white/10 text-dim hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setDNA } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [genres, setGenres] = useState<string[]>([]);
  const [franchiseInput, setFranchiseInput] = useState("");
  const [franchises, setFranchises] = useState<string[]>([]);
  const [gameQuery, setGameQuery] = useState("");
  const [gameResults, setGameResults] = useState<RawgGame[]>([]);
  const [favoriteGames, setFavoriteGames] = useState<RawgGame[]>([]);
  const [searching, setSearching] = useState(false);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [budget, setBudget] = useState<"free" | "low" | "mid" | "high">("mid");
  const [graphics, setGraphics] = useState<"low" | "medium" | "high" | "ultra">("high");
  const [playstyles, setPlaystyles] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"relaxed" | "balanced" | "hard" | "brutal">("balanced");
  const [mechanics, setMechanics] = useState<string[]>([]);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const runSearch = async () => {
    if (!gameQuery.trim()) return;
    setSearching(true);
    try {
      const r = await searchGames(gameQuery, 8);
      setGameResults(r.results);
    } catch {
      setGameResults([]);
    }
    setSearching(false);
  };

  const steps = ["Genres", "Franchises & Favorites", "Habits", "Playstyle", "Mechanics", "Your DNA"];

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const personality = computePersonality({ playstyles, mechanics, genres: genres.map((slug) => GENRES.find((g) => g.slug === slug)?.name || slug) });

    const row = {
      user_id: user.id,
      genres,
      franchises,
      favorite_game_ids: favoriteGames.map((g) => g.id),
      hours_per_week: hoursPerWeek,
      budget,
      graphics,
      playstyles,
      difficulty,
      mechanics,
      personality,
      computed_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("gaming_dna").upsert(row, { onConflict: "user_id" });
    setSaving(false);
    if (!error) {
      setDNA({
        genres, franchises, favoriteGameIds: row.favorite_game_ids, hoursPerWeek, budget, graphics,
        playstyles, difficulty, mechanics, personality, computedAt: row.computed_at,
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] container-px py-12 max-w-2xl mx-auto">
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-cyan-glow" : "bg-white/10"}`} />
        ))}
      </div>
      <p className="text-xs text-muted mb-2 tracking-wide uppercase">Step {step + 1} of {steps.length}</p>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">What do you play?</h2>
              <p className="text-dim text-sm mb-6">Pick as many genres as fit. This is the backbone of your DNA.</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <Chip key={g.slug} active={genres.includes(g.slug)} onClick={() => toggle(genres, setGenres, g.slug)}>{g.name}</Chip>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Franchises & favorites</h2>
              <p className="text-dim text-sm mb-6">Type a franchise and hit enter. Then search your favorite games from our live database.</p>

              <div className="flex gap-2 mb-3">
                <input
                  className="field"
                  placeholder="e.g. Final Fantasy, Zelda, Call of Duty…"
                  value={franchiseInput}
                  onChange={(e) => setFranchiseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && franchiseInput.trim()) {
                      e.preventDefault();
                      setFranchises((f) => [...new Set([...f, franchiseInput.trim()])]);
                      setFranchiseInput("");
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {franchises.map((f) => (
                  <span key={f} className="tag tag-cyan cursor-pointer" onClick={() => setFranchises((arr) => arr.filter((x) => x !== f))}>
                    {f} ✕
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <input className="field" placeholder="Search for a favorite game…" value={gameQuery}
                  onChange={(e) => setGameQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())} />
                <button type="button" className="btn btn-outline !px-4" onClick={runSearch}>
                  {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                </button>
              </div>
              {gameResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {gameResults.map((g) => {
                    const picked = favoriteGames.some((f) => f.id === g.id);
                    return (
                      <button key={g.id} type="button"
                        onClick={() => setFavoriteGames((arr) => picked ? arr.filter((x) => x.id !== g.id) : [...arr, g])}
                        className={`glass p-2 text-left relative ${picked ? "ring-2 ring-cyan-glow" : ""}`}>
                        {picked && <Check size={14} className="absolute top-2 right-2 text-cyan-glow" />}
                        <div className="w-full aspect-video bg-deep rounded-lg overflow-hidden mb-1.5">
                          {g.background_image && <img src={g.background_image} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div className="text-[11px] font-medium line-clamp-1">{g.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}
              {favoriteGames.length > 0 && <p className="text-xs text-cyan-glow">{favoriteGames.length} favorite{favoriteGames.length > 1 ? "s" : ""} selected</p>}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Your habits</h2>
              <p className="text-dim text-sm mb-6">Roughly — nothing here is locked in forever.</p>

              <label className="block text-sm mb-2 text-dim">Gaming hours per week: <span className="text-cyan-glow font-semibold">{hoursPerWeek}h</span></label>
              <input type="range" min={1} max={60} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} className="w-full mb-6 accent-cyan-glow" />

              <label className="block text-sm mb-2 text-dim">Budget</label>
              <div className="flex gap-2 mb-6 flex-wrap">
                {(["free", "low", "mid", "high"] as const).map((b) => (
                  <Chip key={b} active={budget === b} onClick={() => setBudget(b)}>
                    {{ free: "Free to play", low: "Under $20", mid: "$20–60", high: "$60+" }[b]}
                  </Chip>
                ))}
              </div>

              <label className="block text-sm mb-2 text-dim">Preferred graphics</label>
              <div className="flex gap-2 flex-wrap">
                {(["low", "medium", "high", "ultra"] as const).map((g) => (
                  <Chip key={g} active={graphics === g} onClick={() => setGraphics(g)}>{g[0].toUpperCase() + g.slice(1)}</Chip>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">How do you play?</h2>
              <p className="text-dim text-sm mb-6">Pick everything that applies — and your preferred difficulty.</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {PLAYSTYLES.map((p) => (
                  <Chip key={p} active={playstyles.includes(p)} onClick={() => toggle(playstyles, setPlaystyles, p)}>{p}</Chip>
                ))}
              </div>
              <label className="block text-sm mb-2 text-dim">Preferred difficulty</label>
              <div className="flex gap-2 flex-wrap">
                {(["relaxed", "balanced", "hard", "brutal"] as const).map((d) => (
                  <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>{d[0].toUpperCase() + d.slice(1)}</Chip>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">What hooks you?</h2>
              <p className="text-dim text-sm mb-6">Favorite mechanics — this drives a huge chunk of your recommendation matching.</p>
              <div className="flex flex-wrap gap-2">
                {MECHANICS.map((m) => (
                  <Chip key={m} active={mechanics.includes(m)} onClick={() => toggle(mechanics, setMechanics, m)}>{m}</Chip>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-6">
              <h2 className="text-2xl font-bold mb-2">Your Gaming DNA is ready</h2>
              <p className="text-dim text-sm mb-8">Built from exactly what you just told us — nothing guessed.</p>
              <div className="glass p-8 inline-block">
                <div className="font-logo text-xs text-cyan-glow mb-3">PERSONALITY</div>
                <div className="text-3xl font-bold text-glow text-cyan-glow">
                  {computePersonality({ playstyles, mechanics, genres: genres.map((slug) => GENRES.find((g) => g.slug === slug)?.name || slug) })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-10">
        <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)} style={{ opacity: step === 0 ? 0.3 : 1 }}>
          <ChevronLeft size={16} /> Back
        </button>
        {step < steps.length - 1 ? (
          <button className="btn btn-glow" onClick={() => setStep((s) => s + 1)}>Next <ChevronRight size={16} /></button>
        ) : (
          <button className="btn btn-glow" onClick={finish} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "Saving…" : "Enter Replay"}
          </button>
        )}
      </div>
    </div>
  );
}
