import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { getTrendingGames, getHiddenGems, getGamesByTags, getUpcomingGames, searchGames } from "../lib/rawg";
import type { RawgGame } from "../lib/types";
import Row from "../components/discover/Row";
import GameCard from "../components/discover/GameCard";
import Reveal from "../components/ui/Reveal";

export default function Discover() {
  const [rows, setRows] = useState<Record<string, RawgGame[]>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RawgGame[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [trending, gems, coop, storyRich, openWorld, horror, upcoming] = await Promise.all([
        getTrendingGames(14),
        getHiddenGems([], 14),
        getGamesByTags(["co-op"], { pageSize: 14 }),
        getGamesByTags(["story-rich"], { pageSize: 14 }),
        getGamesByTags(["open-world"], { pageSize: 14 }),
        getGamesByTags(["horror"], { pageSize: 14 }),
        getUpcomingGames(14),
      ]);
      setRows({
        "Trending": trending.results,
        "Hidden Gems": gems.results,
        "Better With Friends": coop.results,
        "Story Rich": storyRich.results,
        "Open World": openWorld.results,
        "Horror": horror.results,
        "Upcoming Releases": upcoming.results,
      });
      setLoading(false);
    })();
  }, []);

  const runSearch = async () => {
    if (!query.trim()) { setSearchResults(null); return; }
    setSearching(true);
    const r = await searchGames(query, 24);
    setSearchResults(r.results);
    setSearching(false);
  };

  return (
    <div className="container-px py-10 max-w-7xl mx-auto">
      <Reveal>
        <h1 className="text-3xl font-bold mb-1">Discover</h1>
        <p className="text-dim mb-6">Browse the full RAWG catalog, sliced the way you actually think about games.</p>
      </Reveal>

      <div className="relative max-w-md mb-10">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="field !pl-10" placeholder="Search any game…" value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()} />
        {searching && <Loader2 size={15} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-cyan-glow" />}
      </div>

      {searchResults ? (
        <Reveal>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Results for "{query}"</h3>
            <button className="btn-ghost" onClick={() => { setSearchResults(null); setQuery(""); }}>Clear</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {searchResults.map((g) => <GameCard key={g.id} game={g} />)}
            {searchResults.length === 0 && <p className="text-muted col-span-full">No games matched that search.</p>}
          </div>
        </Reveal>
      ) : (
        Object.entries(rows).map(([title, games]) => (
          <Row key={title} title={title} games={games} loading={loading} />
        ))
      )}
    </div>
  );
}
