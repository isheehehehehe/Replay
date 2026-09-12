import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Heart, ArrowLeft, ExternalLink, PlusCircle } from "lucide-react";
import { getGameDetail, getGameScreenshots, getSimilarGames } from "../lib/rawg";
import type { RawgGameDetail, RawgGame } from "../lib/types";
import { useApp } from "../lib/store";
import { addToWishlist, logSession } from "../lib/data";
import Reveal from "../components/ui/Reveal";
import GameCard from "../components/discover/GameCard";

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [game, setGame] = useState<RawgGameDetail | null>(null);
  const [screenshots, setScreenshots] = useState<{ id: number; image: string }[]>([]);
  const [similar, setSimilar] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [logging, setLogging] = useState(false);
  const [minutes, setMinutes] = useState(60);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      const g = await getGameDetail(Number(id));
      setGame(g);
      const [shots, sim] = await Promise.all([getGameScreenshots(g.id), getSimilarGames(g, 6)]);
      setScreenshots(shots.results);
      setSimilar(sim);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !game) {
    return <div className="container-px py-24 flex justify-center"><div className="w-6 h-6 border-2 border-cyan-glow border-t-transparent rounded-full animate-spin" /></div>;
  }

  const wishlist = async () => {
    if (!user) return navigate("/login");
    await addToWishlist({ user_id: user.id, game_id: game.id, game_name: game.name, game_image: game.background_image, priority: "normal" });
    setWishlisted(true);
  };

  const submitSession = async () => {
    if (!user) return navigate("/login");
    setLogging(true);
    await logSession({
      user_id: user.id, game_id: game.id, game_name: game.name, game_image: game.background_image,
      played_at: new Date().toISOString().slice(0, 10), minutes, mood: null, stats: {},
    });
    setLogging(false);
    setLogged(true);
  };

  return (
    <div className="container-px py-8 max-w-5xl mx-auto">
      <button className="btn-ghost mb-5" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>

      <Reveal>
        <div className="w-full rounded-2xl overflow-hidden mb-6 bg-deep" style={{ aspectRatio: "21/8" }}>
          {game.background_image && <img src={game.background_image} className="w-full h-full object-cover" alt="" />}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
            <div className="flex flex-wrap gap-2">
              {game.genres?.map((g) => <span key={g.id} className="tag tag-cyan">{g.name}</span>)}
              {game.esrb_rating && <span className="tag tag-dim">{game.esrb_rating.name}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline !text-sm" onClick={wishlist}>
              <Heart size={15} fill={wishlisted ? "#4DEAFF" : "none"} /> {wishlisted ? "Wishlisted" : "Wishlist"}
            </button>
            {game.website && <a className="btn btn-ghost !text-sm" href={game.website} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Official site</a>}
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Star, label: "Rating", value: game.rating ? `${game.rating.toFixed(1)}/5` : "—" },
          { icon: Clock, label: "Avg. playtime", value: game.playtime ? `${game.playtime}h` : "—" },
          { icon: Star, label: "Metacritic", value: game.metacritic ?? "—" },
          { icon: Clock, label: "Released", value: game.released ? new Date(game.released).getFullYear() : "—" },
        ].map((s) => (
          <div key={s.label} className="glass p-4">
            <s.icon size={14} className="text-cyan-glow mb-2" />
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {game.description_raw && (
        <Reveal>
          <p className="text-sm text-dim leading-relaxed mb-8 max-w-3xl">{game.description_raw.slice(0, 600)}{game.description_raw.length > 600 ? "…" : ""}</p>
        </Reveal>
      )}

      {screenshots.length > 0 && (
        <Reveal>
          <h3 className="text-lg font-semibold mb-3">Screenshots</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 mb-10" style={{ scrollbarWidth: "none" }}>
            {screenshots.slice(0, 6).map((s) => (
              <img key={s.id} src={s.image} className="rounded-xl flex-shrink-0 h-40 object-cover" alt="" />
            ))}
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="glass p-6 mb-10">
          <div className="flex items-center gap-2 mb-3"><PlusCircle size={16} className="text-cyan-glow" /><h3 className="font-semibold">Log a play session</h3></div>
          {logged ? (
            <p className="text-sm text-cyan-glow">Session logged — check your Analytics page.</p>
          ) : (
            <>
              <p className="text-xs text-dim mb-4">Minutes played, plus any per-game stats you want to track (KDA, headshots, rage quits...) — available on the full logger in Analytics.</p>
              <div className="flex gap-3 items-center">
                <input type="number" className="field !w-28" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} min={1} />
                <span className="text-sm text-muted">minutes</span>
                <button className="btn btn-glow !text-sm" onClick={submitSession} disabled={logging}>{logging ? "Saving…" : "Log session"}</button>
              </div>
            </>
          )}
        </div>
      </Reveal>

      {similar.length > 0 && (
        <Reveal>
          <h3 className="text-lg font-semibold mb-3">Similar games</h3>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {similar.map((g) => <GameCard key={g.id} game={g} width={190} />)}
          </div>
        </Reveal>
      )}
    </div>
  );
}
