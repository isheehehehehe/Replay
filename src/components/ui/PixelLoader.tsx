export default function PixelLoader({ label = "Loading your depths…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-abyss">
      <svg width="64" height="40" viewBox="0 0 16 10" className="pixel-fish" shapeRendering="crispEdges">
        <rect x="2" y="3" width="8" height="4" fill="#4DEAFF" />
        <rect x="1" y="4" width="1" height="2" fill="#4DEAFF" />
        <rect x="10" y="2" width="2" height="1" fill="#4DEAFF" />
        <rect x="10" y="7" width="2" height="1" fill="#4DEAFF" />
        <rect x="12" y="4" width="3" height="2" fill="#22b8cc" />
        <rect x="4" y="4" width="1" height="1" fill="#04131C" />
      </svg>
      <span className="font-logo text-[9px] text-cyan-glow tracking-widest animate-pulseGlow">{label}</span>
    </div>
  );
}
