import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Radar, Trophy, Compass, ArrowRight } from "lucide-react";
import BubbleField from "../components/ui/BubbleField";
import Reveal from "../components/ui/Reveal";

const FEATURES = [
  { icon: Sparkles, title: "Mood-based picks", desc: "Tell it what you're in the mood for — a weighted scoring engine (not an AI black box) matches it to real games and tells you exactly why." },
  { icon: Radar, title: "Your Gaming DNA", desc: "A personality profile built from what you actually tell us during onboarding — genres, mechanics, playstyle — not guesswork." },
  { icon: Compass, title: "Real discovery", desc: "Every cover, rating, and genre tag comes straight from RAWG's live game database. No placeholder art, no invented scores." },
  { icon: Trophy, title: "Your own stat log", desc: "Log sessions as you play — hours, KDA, headshots, whatever fits the game — and watch your real Wrapped build itself over time." },
];

const TESTIMONIALS = [
  { quote: "Logged three sessions and the recommendations already stopped feeling generic.", name: "reef_diver", role: "Souls-like enjoyer" },
  { quote: "Finally a 'wrapped' that isn't just steam minutes reformatted.", name: "kelsey.exe", role: "Story-first player" },
  { quote: "The mood search actually gets it — typed '2 hours' and got games that fit.", name: "mmk_plays", role: "Weekend gamer" },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="relative">
      <BubbleField />
      <div className="relative z-10">
        <section className="min-h-[86vh] flex flex-col items-center justify-center text-center container-px pt-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
            <div className="font-logo text-[28px] md:text-[42px] text-cyan-glow text-glow mb-6 leading-relaxed">
              REPLAY
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight mb-5"
          >
            Your gaming journey, <span className="text-cyan-glow">personalized.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-dim max-w-lg mb-10 text-[15px] leading-relaxed"
          >
            Skip the Steam integration. Build a real gaming profile in five minutes, and get
            recommendations, stats, and a Wrapped that's actually about how you play.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex gap-3 flex-wrap justify-center"
          >
            <button className="btn btn-glow" onClick={() => navigate("/signup")}>Create Account <ArrowRight size={16} /></button>
            <button className="btn btn-outline" onClick={() => navigate("/login")}>Login</button>
          </motion.div>
        </section>

        <section className="container-px py-20 max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-xs tracking-[0.2em] text-muted uppercase">why replay</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2">Built on real data, not vibes.</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="glass glass-hover p-6 h-full">
                  <f.icon size={22} className="text-cyan-glow mb-3" />
                  <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
                  <p className="text-sm text-dim leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="container-px py-16 max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="text-xs tracking-[0.2em] text-muted uppercase">early users</span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="glass p-6 h-full">
                  <p className="text-sm text-dim leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="text-sm font-semibold text-cyan-glow">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/5 container-px py-10 mt-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-logo text-[9px] text-muted">REPLAY</span>
            <p className="text-xs text-muted">Game data via RAWG.io · Not affiliated with Valve or Steam.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
