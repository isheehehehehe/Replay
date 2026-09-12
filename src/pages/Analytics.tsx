import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Plus, Trash2, Loader2, Search, Check } from "lucide-react";
import { useApp } from "../lib/store";
import { getSessions, logSession, deleteSession, computeAnalytics } from "../lib/data";
import { searchGames } from "../lib/rawg";
import type { PlaySession, RawgGame, StatField } from "../lib/types";
import Reveal from "../components/ui/Reveal";
import Counter from "../components/ui/Counter";

const MOODS = ["relaxing", "grind", "story", "competitive", "horror", "exploring", "co-op"];
const PIE_COLORS = ["#4DEAFF", "#7c5cff", "#ff6b6b", "#ffc857", "#22b8cc", "#8fd3ff", "#5ce1a8"];

const STAT_FIELDS: { key: StatField; label: string; type: "number" | "text" }[] = [
  { key: "kills", label: "Kills", type: "number" },
  { key: "deaths", label: "Deaths", type: "number" },
  { key: "headshots", label: "Headshots", type: "number" },
  { key: "assists", label: "Assists", type: "number" },
  { key: "wins", label: "Wins", type: "number" },
  { key: "losses", label: "Losses", type: "number" },
  { key: "rageQuits", label: "Rage quits", type: "number" },
  { key: "weaponUsed", label: "Main weapon", type: "text" },
  { key: "vehicleUsed", label: "Main vehicle", type: "text" },
  { key: "bossesDefeated", label: "Bosses defeated", type: "number" },
  { key: "deathsToBoss", label: "Deaths to bosses", type: "number" },
  { key: "questsCompleted", label: "Quests completed", type: "number" },
  { key: "achievementsUnlocked", label: "Achievements unlocked", type: "number" },
];

export default function Analytics() {
  const { user, dna } = useApp();
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const [gameQuery, setGameQuery] = useState("");
  const [gameResults, setGameResults] = useState<RawgGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<RawgGame | null>(null);
  const [minutes, setMinutes] = useState(60);
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState<string | null>(null);
  const [stats, setStats] = useState<Partial<Record<StatField, string>>>({});
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getSessions(user.id);
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const analytics = computeAnalytics(sessions);

  const runSearch = async () => {
    if (!gameQuery.trim()) return;
    setSearching(true);
    const r = await searchGames(gameQuery, 6);
    setGameResults(r.results);
    setSearching(false);
  };

  const submit = async () => {
    if (!user || !selectedGame) return;
    setSaving(true);
    const cleanStats: Record<string, number | string> = {};
    Object.entries(stats).forEach(([k, v]) => {
      if (v === undefined || v === "") return;
      const field = STAT_FIELDS.find((f) => f.key === k);
      cleanStats[k] = field?.type === "number" ? Number(v) : v;
    });
    await logSession({
      user_id: user.id, game_id: selectedGame.id, game_name: selectedGame.name, game_image: selectedGame.background_image,
      played_at: playedAt, minutes, mood, stats: cleanStats,
    });
    setSaving(false);
    setFormOpen(false);
    setSelectedGame(null); setGameQuery(""); setGameResults([]); setStats({}); setMood(null); setMinutes(60);
    load();
  };

  const remove = async (id: string) => {
    await deleteSession(id);
    setSessions((s) => s.filter((x) => x.id !== id));
  };

  const dnaRadar = dna ? [
    { trait: "Exploration", v: dna.playstyles.includes("Exploration") ? 90 : 30 },
    { trait: "Story", v: dna.playstyles.includes("Story") ? 90 : 30 },
    { trait: "Competitive", v: dna.playstyles.includes("Competitive") ? 90 : 30 },
    { trait: "Completion", v: dna.playstyles.includes("Completionist") ? 90 : 30 },
    { trait: "Co-op", v: dna.playstyles.includes("Co-op") ? 90 : 30 },
    { trait: "Casual", v: dna.playstyles.includes("Casual") ? 90 : 30 },
  ] : [];

  return (
    <div className="container-px py-10 max-w-6xl mx-auto">
      <Reveal>
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h1 className="text-3xl font-bold">Player Analytics</h1>
          <button className="btn btn-glow !text-sm" onClick={() => setFormOpen((o) => !o)}><Plus size={15} /> Log a session</button>
        </div>
        <p className="text-dim mb-8">Every number below comes from sessions you've logged. No sessions, no stats — that's the deal.</p>
      </Reveal>

      {formOpen && (
        <Reveal>
          <div className="glass p-6 mb-8">
            <h3 className="font-semibold mb-4">New session</h3>

            {!selectedGame ? (
              <div className="mb-4">
                <div className="flex gap-2 mb-3">
                  <input className="field" placeholder="Search the game you played…" value={gameQuery}
                    onChange={(e) => setGameQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSearch())} />
                  <button className="btn btn-outline !px-4" onClick={runSearch}>{searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gameResults.map((g) => (
                    <button key={g.id} className="glass p-2 text-left" onClick={() => setSelectedGame(g)}>
                      <div className="w-full aspect-video bg-deep rounded-lg overflow-hidden mb-1.5">
                        {g.background_image && <img src={g.background_image} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div className="text-[11px] font-medium line-clamp-1">{g.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4 glass p-3 rounded-xl">
                <img src={selectedGame.background_image || ""} className="w-14 h-9 object-cover rounded-md" alt="" />
                <span className="font-medium text-sm flex-1">{selectedGame.name}</span>
                <button className="text-xs text-muted underline" onClick={() => setSelectedGame(null)}>change</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-dim block mb-1">Minutes played</label>
                <input type="number" className="field" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} min={1} />
              </div>
              <div>
                <label className="text-xs text-dim block mb-1">Date</label>
                <input type="date" className="field" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} />
              </div>
            </div>

            <label className="text-xs text-dim block mb-1.5">Mood</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {MOODS.map((m) => (
                <button key={m} onClick={() => setMood(mood === m ? null : m)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${mood === m ? "bg-cyan-glow/15 border-cyan-glow text-cyan-glow" : "border-white/10 text-dim"}`}>
                  {m}
                </button>
              ))}
            </div>

            <label className="text-xs text-dim block mb-2">Stats for this session (fill in whatever applies to this game)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {STAT_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="text-[11px] text-muted block mb-1">{f.label}</label>
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    className="field !py-2 !text-xs"
                    value={stats[f.key] ?? ""}
                    onChange={(e) => setStats((s) => ({ ...s, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <button className="btn btn-glow" onClick={submit} disabled={!selectedGame || saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save session
            </button>
          </div>
        </Reveal>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-cyan-glow" /></div>
      ) : sessions.length === 0 ? (
        <div className="glass p-10 text-center text-dim">No sessions logged yet. Click "Log a session" above to start building your real stats.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total hours", value: <Counter value={analytics.totalHours} decimals={1} suffix="h" /> },
              { label: "Sessions logged", value: <Counter value={analytics.sessionCount} /> },
              { label: "Longest session", value: analytics.longestSessionHours ? `${analytics.longestSessionHours}h` : "—" },
              { label: "Most active day", value: analytics.mostActiveDay || "—" },
            ].map((s) => (
              <div key={s.label} className="glass p-4">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {(analytics.kd !== null || analytics.headshotPct !== null || analytics.statTotals.rageQuits) && (
            <Reveal>
              <div className="glass p-6 mb-8">
                <h3 className="font-semibold mb-4">Combat stats (from your logged sessions)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.kd !== null && <div><div className="text-2xl font-bold text-cyan-glow">{analytics.kd}</div><div className="text-xs text-muted">K/D ratio</div></div>}
                  {analytics.headshotPct !== null && <div><div className="text-2xl font-bold text-cyan-glow">{analytics.headshotPct}%</div><div className="text-xs text-muted">headshot rate</div></div>}
                  {Object.entries(analytics.statTotals).map(([k, v]) => (
                    !["kills", "deaths", "headshots"].includes(k) && typeof v === "number" ? (
                      <div key={k}><div className="text-2xl font-bold text-cyan-glow">{v.toLocaleString()}</div><div className="text-xs text-muted capitalize">{k.replace(/([A-Z])/g, " $1")}</div></div>
                    ) : null
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <Reveal>
              <div className="glass p-6">
                <h3 className="font-semibold mb-4 text-sm">Weekly play hours</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.weeklyTrend}>
                    <XAxis dataKey="week" tick={{ fill: "#6E93A0", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6E93A0", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0D2C3A", border: "1px solid rgba(77,234,255,.2)", borderRadius: 10, fontSize: 12 }} />
                    <Line type="monotone" dataKey="hours" stroke="#4DEAFF" strokeWidth={2} dot={{ r: 3, fill: "#4DEAFF" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="glass p-6">
                <h3 className="font-semibold mb-4 text-sm">Time by game</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.topGames.slice(0, 6)} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fill: "#6E93A0", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#9FC4CE", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0D2C3A", border: "1px solid rgba(77,234,255,.2)", borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="hours" fill="#4DEAFF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Reveal>

            {analytics.moodBreakdown.length > 0 && (
              <Reveal>
                <div className="glass p-6">
                  <h3 className="font-semibold mb-4 text-sm">Gaming mood</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.moodBreakdown} dataKey="count" nameKey="mood" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {analytics.moodBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0D2C3A", border: "1px solid rgba(77,234,255,.2)", borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Reveal>
            )}

            {dna && (
              <Reveal delay={0.05}>
                <div className="glass p-6">
                  <h3 className="font-semibold mb-4 text-sm">Playstyle profile (from your Gaming DNA)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={dnaRadar}>
                      <PolarGrid stroke="#16505f" />
                      <PolarAngleAxis dataKey="trait" tick={{ fill: "#9FC4CE", fontSize: 11 }} />
                      <Radar dataKey="v" stroke="#4DEAFF" fill="#4DEAFF" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal>
            <div className="glass p-6">
              <h3 className="font-semibold mb-4 text-sm">Session log</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-deep/50">
                    {s.game_image && <img src={s.game_image} className="w-12 h-8 object-cover rounded-md flex-shrink-0" alt="" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.game_name}</div>
                      <div className="text-xs text-muted">{s.played_at} · {Math.round(s.minutes / 60 * 10) / 10}h {s.mood && `· ${s.mood}`}</div>
                    </div>
                    <button className="btn-ghost !p-1.5" onClick={() => remove(s.id)}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
