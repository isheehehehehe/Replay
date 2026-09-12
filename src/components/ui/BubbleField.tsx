import { useMemo } from "react";

export default function BubbleField({ density = 22 }: { density?: number }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: density }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 16,
        duration: 10 + Math.random() * 18,
        delay: Math.random() * 14,
      })),
    [density]
  );

  const rays = useMemo(
    () => Array.from({ length: 4 }).map((_, i) => ({ id: i, left: 10 + i * 26, delay: i * 1.6 })),
    []
  );

  return (
    <div className="bubble-field">
      {rays.map((r) => (
        <div key={r.id} className="light-ray" style={{ left: `${r.left}%`, animationDelay: `${r.delay}s` }} />
      ))}
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
