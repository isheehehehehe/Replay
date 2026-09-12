import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import BubbleField from "../components/ui/BubbleField";

const COUNTRIES = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Brazil", "Japan", "South Korea", "Other"];

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", username: "", country: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.password || !form.username) {
      setError("Fill in name, email, password, and username.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password needs to be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (signUpError) throw signUpError;
      const userId = data.user?.id;
      if (!userId) throw new Error("Account created — check your email to confirm, then log in.");

      let avatarUrl: string | null = null;
      if (avatarFile) {
        const path = `${userId}/${Date.now()}-${avatarFile.name}`;
        const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, avatarFile);
        if (!uploadErr) {
          avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
        }
      }

      const { error: profileErr } = await supabase.from("profiles").insert({
        id: userId,
        name: form.name,
        username: form.username,
        country: form.country || null,
        avatar_url: avatarUrl,
      });
      if (profileErr) throw profileErr;

      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center container-px py-16">
      <BubbleField density={12} />
      <form onSubmit={submit} className="relative z-10 glass p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Create your profile</h1>
        <p className="text-dim text-sm mb-6">No Steam needed — just tell us who you are.</p>

        <div className="flex items-center gap-4 mb-5">
          <label className="w-16 h-16 rounded-full bg-deep border border-cyan-glow/20 flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0">
            {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="" /> : <UserPlus size={20} className="text-muted" />}
            <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </label>
          <p className="text-xs text-muted">Optional profile picture</p>
        </div>

        <div className="space-y-3">
          <input className="field" placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          <input className="field" placeholder="Username" value={form.username} onChange={(e) => update("username", e.target.value.replace(/\s/g, ""))} />
          <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          <input className="field" type="password" placeholder="Password (min. 6 characters)" value={form.password} onChange={(e) => update("password", e.target.value)} />
          <select className="field" value={form.country} onChange={(e) => update("country", e.target.value)}>
            <option value="">Country (optional)</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {error && <p className="text-[#ff6b6b] text-xs mt-4">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-glow w-full mt-6">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {loading ? "Creating account…" : "Create Account"}
        </button>
        <p className="text-xs text-muted text-center mt-4">
          Already have an account? <button type="button" className="text-cyan-glow underline" onClick={() => navigate("/login")}>Log in</button>
        </p>
      </form>
    </div>
  );
}
