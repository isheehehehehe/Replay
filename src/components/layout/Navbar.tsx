import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, Compass, Sparkles, BarChart3, Heart, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useApp } from "../../lib/store";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/recommend", label: "For You", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
];

export default function Navbar() {
  const { user, profile, signOut } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (to: string) => { navigate(to); setOpen(false); };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-abyss/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto container-px h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="font-logo text-[11px] text-cyan-glow tracking-wider">
          REPLAY
        </Link>

        {user && (
          <div className="hide-mobile flex gap-1">
            {LINKS.map((l) => {
              const active = location.pathname === l.to;
              return (
                <button
                  key={l.to}
                  onClick={() => go(l.to)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active ? "text-cyan-glow bg-cyan-glow/10" : "text-dim hover:text-white"
                  }`}
                >
                  <l.icon size={15} /> {l.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="hide-mobile flex items-center gap-3">
          {user ? (
            <>
              <button className="btn-ghost !p-2 !rounded-full" onClick={() => go("/settings")}><SettingsIcon size={16} /></button>
              <div className="flex items-center gap-2 pl-1">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-cyan-glow/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-glow/15 border border-cyan-glow/30 flex items-center justify-center text-xs font-bold text-cyan-glow">
                    {profile?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <button className="btn-ghost" onClick={signOut}><LogOut size={14} /></button>
              </div>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => go("/login")}>Login</button>
              <button className="btn btn-glow !py-2.5 !px-5 !text-sm" onClick={() => go("/signup")}>Create Account</button>
            </>
          )}
        </div>

        <button className="show-mobile btn-ghost !p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="show-mobile flex-col gap-1 px-4 pb-4 border-t border-white/5 pt-3">
          {user ? (
            <>
              {LINKS.map((l) => (
                <button key={l.to} onClick={() => go(l.to)} className="flex items-center gap-2 py-2.5 text-sm text-dim">
                  <l.icon size={16} /> {l.label}
                </button>
              ))}
              <button onClick={() => go("/settings")} className="flex items-center gap-2 py-2.5 text-sm text-dim"><SettingsIcon size={16} /> Settings</button>
              <button onClick={signOut} className="flex items-center gap-2 py-2.5 text-sm text-[#ff6b6b]"><LogOut size={16} /> Sign out</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline w-full mb-2" onClick={() => go("/login")}>Login</button>
              <button className="btn btn-glow w-full" onClick={() => go("/signup")}>Create Account</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
