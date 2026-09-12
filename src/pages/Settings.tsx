import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useApp } from "../lib/store";
import { supabase } from "../lib/supabase";
import Reveal from "../components/ui/Reveal";

export default function Settings() {
  const { profile, dna, signOut } = useApp();
  const navigate = useNavigate();

  const deleteAccount = async () => {
    if (!confirm("This permanently deletes your profile, Gaming DNA, sessions, and wishlist. Continue?")) return;
    await supabase.from("profiles").delete().eq("id", profile?.id);
    await signOut();
    navigate("/");
  };

  return (
    <div className="container-px py-10 max-w-2xl mx-auto">
      <Reveal>
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
      </Reveal>

      <Reveal>
        <div className="glass p-6 mb-5">
          <h3 className="font-semibold mb-4">Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted block text-xs mb-1">Name</span>{profile?.name}</div>
            <div><span className="text-muted block text-xs mb-1">Username</span>@{profile?.username}</div>
            <div><span className="text-muted block text-xs mb-1">Country</span>{profile?.country || "—"}</div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glass p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Gaming DNA</h3>
            <button className="text-xs text-cyan-glow underline" onClick={() => navigate("/onboarding")}>Retake</button>
          </div>
          {dna ? (
            <div className="flex flex-wrap gap-2">
              {dna.genres.map((g) => <span key={g} className="tag tag-cyan">{g}</span>)}
              {dna.playstyles.map((p) => <span key={p} className="tag tag-dim">{p}</span>)}
            </div>
          ) : <p className="text-sm text-dim">Not set up yet.</p>}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="glass p-6 border border-[#ff6b6b]/25">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={15} className="text-[#ff6b6b]" /><h3 className="font-semibold text-[#ff6b6b]">Danger zone</h3></div>
          <p className="text-xs text-dim mb-4">Deletes your profile row and all associated data (DNA, sessions, wishlist). This cannot be undone.</p>
          <button className="btn btn-outline !border-[#ff6b6b]/40 !text-[#ff6b6b]" onClick={deleteAccount}>Delete account</button>
        </div>
      </Reveal>
    </div>
  );
}
