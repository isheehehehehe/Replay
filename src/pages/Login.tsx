import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useApp } from "../lib/store";
import BubbleField from "../components/ui/BubbleField";

export default function Login() {
  const navigate = useNavigate();
  const hydrate = useApp((s) => s.hydrate);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    await hydrate();
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center container-px py-16">
      <BubbleField density={12} />
      <form onSubmit={submit} className="relative z-10 glass p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-dim text-sm mb-6">Your Gaming DNA missed you.</p>

        <div className="space-y-3">
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-[#ff6b6b] text-xs mt-4">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-glow w-full mt-6">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {loading ? "Signing in…" : "Login"}
        </button>
        <p className="text-xs text-muted text-center mt-4">
          New here? <button type="button" className="text-cyan-glow underline" onClick={() => navigate("/signup")}>Create an account</button>
        </p>
      </form>
    </div>
  );
}
