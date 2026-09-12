import { motion } from "framer-motion";
import { Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RawgGame } from "../../lib/types";

export default function GameCard({ game, reason, width }: { game: RawgGame; reason?: string; width?: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass glass-hover flex-shrink-0 cursor-pointer overflow-hidden"
      style={width ? { width } : undefined}
      onClick={() => navigate(`/game/${game.id}`)}
    >
      <div className="w-full bg-deep" style={{ aspectRatio: "3/4" }}>
        {game.background_image ? (
          <img src={game.background_image} alt={game.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">no cover art</div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold leading-snug line-clamp-2 mb-1.5">{game.name}</div>
        <div className="flex items-center gap-3 text-xs text-dim">
          {!!game.rating && (
            <span className="flex items-center gap-1">
              <Star size={11} className="text-cyan-glow" fill="#4DEAFF" /> {game.rating.toFixed(1)}
            </span>
          )}
          {!!game.playtime && (
            <span className="flex items-center gap-1"><Clock size={11} /> {game.playtime}h</span>
          )}
        </div>
        {reason && <div className="mt-2 text-[11px] text-cyan-glow/80 leading-snug line-clamp-2">{reason}</div>}
      </div>
    </motion.div>
  );
}
