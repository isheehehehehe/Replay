import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Download, Loader2 } from "lucide-react";
import { useApp } from "../lib/store";
import { getSessions, getWishlist, computeAnalytics } from "../lib/data";
import type { PlaySession } from "../lib/types";
import { PERSONALITY_BLURB } from "../lib/dna";

export default function Wrapped() {
  const { user, dna, profile } = useApp();
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [s, w] = await Promise.all([getSessions(user.id), getWishlist(user.id)]);
      setSessions(s);
      setWishlistCount(w.length);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="container-px py-24 flex justify-center"><Loader2 className="animate-spin text-cyan-glow" /></div>;

  const a = computeAnalytics(sessions);

  if (sessions.length === 0) {
    return (
      <div className="container-px py-24 max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-2">Not enough data for a Wrapped yet</h2>
        <p className="text-dim text-sm">Log a few play sessions in Analytics and come back — every slide here is built from real logged sessions, so there's nothing to show until you've played.</p>
      </div>
    );
  }

  const slides = [
    { key: "hours", title: `${a.totalHours}h`, subtitle: "total hours logged this year", big: true },
    { key: "sessions", title: `${a.sessionCount}`, subtitle: "play sessions recorded", big: true },
    { key: "favgame", title: a.topGames[0]?.name || "—", subtitle: `your most-played game — ${a.topGames[0]?.hours || 0}h logged`, big: false },
    { key: "personality", title: dna?.personality || "—", subtitle: dna ? PERSONALITY_BLURB[dna.personality] : "", big: false },
    { key: "longest", title: a.longestSessionHours ? `${a.longestSessionHours}h` : "—", subtitle: `longest single session, on ${a.longestSessionGame}`, big: true },
    { key: "day", title: a.mostActiveDay || "—", subtitle: "your most active day of the week", big: false },
    { key: "wishlist", title: `${wishlistCount}`, subtitle: "games waiting on your wishlist", big: true },
  ];

  return (
    <div className="container-px py-10 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <span className="font-logo text-[9px] text-cyan-glow">{profile?.name?.split(" ")[0] || "YOUR"}'S WRAPPED</span>
      </div>

      <div className="glass p-10 min-h-[380px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={slide} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }}>
            <p className={`font-bold text-cyan-glow text-glow mb-4 ${slides[slide].big ? "text-6xl" : "text-3xl"}`}>{slides[slide].title}</p>
            <p className="text-dim max-w-xs mx-auto">{slides[slide].subtitle}</p>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === slide ? "w-6 bg-cyan-glow" : "w-1.5 bg-white/15"}`} />
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-5">
        <button className="btn btn-ghost" disabled={slide === 0} onClick={() => setSlide((s) => s - 1)} style={{ opacity: slide === 0 ? 0.3 : 1 }}>
          <ChevronLeft size={16} /> Prev
        </button>
        {slide < slides.length - 1 ? (
          <button className="btn btn-glow" onClick={() => setSlide((s) => s + 1)}>Next <ChevronRight size={16} /></button>
        ) : (
          <button className="btn btn-outline" onClick={() => window.print()}><Download size={15} /> Export / Print</button>
        )}
      </div>
    </div>
  );
}
