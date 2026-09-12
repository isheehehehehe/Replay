import { useState } from "react";
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { useApp } from "../lib/store";
import { getGamesByGenres, getGamesByTags } from "../lib/rawg";
import { parseMood, rankGames, explain, type ScoredGame } from "../lib/dna";
import { setFeedback, addToWishlist } from "../lib/data";
import Reveal from "../components/ui/Reveal";

const PROMPTS = [
  "I want a relaxing game.", "I want something like Elden Ring.", "I have only 2 hours.",
  "I want a story game.", "I want to cry.", "I want to grind.", "I want horror.",
];

export default function Recommend() {
  const { user, dna } = useApp();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ScoredGame[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [moodLabel, setMoodLabel] = useState("");
  const [feedback, setFeedbackState] = useState<Record<number, boolean>>({});
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set());

  const run = async (text: string) => {
    if (!dna) return;
    setInput(text);
    setLoading(true);
    const filters = parseMood(text);
    setMoodLabel(filters.label);
    try {
      const pool = filters.genres.length
        ? await getGamesByGenres(filters.genres.length ? filters.genres : dna.genres, { pageSize: 40, ordering: filters.ordering })
        : filters.tags.length
        ? await getGamesByTags(filters.tags, { pageSize: 40, ordering: filters.ordering })
        : await getGamesByGenres(dna.genres.length ? dna.genres : ["action"], { pageSize: 40, ordering: filters.ordering });

      let pool2 = pool.results;
      if (filters.maxPlaytime) pool2 = pool2.filter((g) => !g.playtime || g.playtime <= filters.maxPlaytime!);

      const ranked = rankGames(pool2, dna, 9);
      setResults(ranked);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const react = async (gameId: number, liked: boolean) => {
    if (!user) return;
    await setFeedback(user.id, gameId, liked);
    setFeedbackState((f) => ({ ...f, [gameId]: liked }));
  };

  const wishlist = async (scored: ScoredGame) => {
    if (!user) return;
    await addToWishlist({ user_id: user.id, game_id: scored.game.id, game_name: scored.game.name, game_image: scored.game.background_image, priority: "normal" });
    setWishlisted((s) => new Set(s).add(scored.game.id));
  };

  if (!dna) {
    return <div className="container-px py-24 text-center text-dim">Finish onboarding first to unlock recommendations.</div>;
  }

  return (
    <div className="container-px py-10 max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-10">
          <Sparkles size={26} className="text-cyan-glow mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">What are you in the mood for today?</h1>
          <p className="text-dim">Type it however you'd say it. A weighted scoring engine matches it to real games and shows its work.</p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="max-w-xl mx-auto mb-6">
          <div className="flex gap-2">
            <input className="field" placeholder="I want to cry, or grind, or something like Elden Ring…" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run(input)} />
            <button className="btn btn-glow !px-5" onClick={() => run(input)} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Go"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {PROMPTS.map((p) => (
              <button key={p} className="tag tag-dim hover:border-cyan-glow hover:text-cyan-glow transition-colors" onClick={() => run(p)}>{p}</button>
            ))}
          </div>
        </div>
      </Reveal>

      {results && (
        <Reveal delay={0.1}>
          <h3 className="text-lg font-semibold mb-1 text-center">{moodLabel}</h3>
          <p className="text-xs text-muted text-center mb-8">{results.length} matches, ranked by your Gaming DNA</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {results.map((r) => (
              <div key={r.game.id} className="glass overflow-hidden">
                <div className="w-full aspect-video bg-deep">
                  {r.game.background_image && <img src={r.game.background_image} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-sm leading-snug">{r.game.name}</h4>
                    <span className="text-xs font-bold text-cyan-glow flex-shrink-0 ml-2">{r.score}%</span>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {r.game.genres?.slice(0, 2).map((g) => <span key={g.id} className="tag tag-dim">{g.name}</span>)}
                    {!!r.game.playtime && <span className="tag tag-dim">~{r.game.playtime}h</span>}
                  </div>
                  <p className="text-xs text-dim leading-relaxed mb-3">{explain(r)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button className={`btn-ghost !p-1.5 !rounded-lg ${feedback[r.game.id] === true ? "text-cyan-glow" : ""}`} onClick={() => react(r.game.id, true)}><ThumbsUp size={14} /></button>
                      <button className={`btn-ghost !p-1.5 !rounded-lg ${feedback[r.game.id] === false ? "text-[#ff6b6b]" : ""}`} onClick={() => react(r.game.id, false)}><ThumbsDown size={14} /></button>
                    </div>
                    <button className={`btn-ghost !p-1.5 !rounded-lg ${wishlisted.has(r.game.id) ? "text-cyan-glow" : ""}`} onClick={() => wishlist(r)}>
                      <Heart size={14} fill={wishlisted.has(r.game.id) ? "#4DEAFF" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
