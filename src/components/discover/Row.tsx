import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RawgGame } from "../../lib/types";
import GameCard from "./GameCard";
import Reveal from "../ui/Reveal";

export default function Row({ title, subtitle, games, loading }: { title: string; subtitle?: string; games: RawgGame[]; loading?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  return (
    <Reveal>
      <section className="mb-10">
        <div className="flex items-end justify-between mb-3 px-1">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
          <div className="hide-mobile flex gap-2">
            <button className="btn-ghost !p-2 !rounded-full" onClick={() => scroll(-1)}><ChevronLeft size={16} /></button>
            <button className="btn-ghost !p-2 !rounded-full" onClick={() => scroll(1)}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div ref={scroller} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "none" }}>
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass flex-shrink-0 animate-pulse" style={{ width: 210, aspectRatio: "3/4" }} />
          ))}
          {!loading && games.map((g) => <GameCard key={g.id} game={g} width={210} />)}
          {!loading && games.length === 0 && <p className="text-muted text-sm py-6">Nothing here yet.</p>}
        </div>
      </section>
    </Reveal>
  );
}
