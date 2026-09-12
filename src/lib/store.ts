import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { GamingDNA, Profile } from "./types";
import { supabase } from "./supabase";

interface AppState {
  authLoading: boolean;
  user: User | null;
  profile: Profile | null;
  dna: GamingDNA | null;
  setUser: (u: User | null) => void;
  setProfile: (p: Profile | null) => void;
  setDNA: (d: GamingDNA | null) => void;
  hydrate: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useApp = create<AppState>((set) => ({
  authLoading: true,
  user: null,
  profile: null,
  dna: null,
  setUser: (u) => set({ user: u }),
  setProfile: (p) => set({ profile: p }),
  setDNA: (d) => set({ dna: d }),

  hydrate: async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    set({ user, authLoading: false });
    if (user) {
      const [{ data: profile }, { data: dnaRow }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("gaming_dna").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (profile) set({ profile: profile as Profile });
      if (dnaRow) {
        set({
          dna: {
            genres: dnaRow.genres || [],
            franchises: dnaRow.franchises || [],
            favoriteGameIds: dnaRow.favorite_game_ids || [],
            hoursPerWeek: dnaRow.hours_per_week || 0,
            budget: dnaRow.budget || "mid",
            graphics: dnaRow.graphics || "medium",
            playstyles: dnaRow.playstyles || [],
            difficulty: dnaRow.difficulty || "balanced",
            mechanics: dnaRow.mechanics || [],
            personality: dnaRow.personality || "Explorer",
            computedAt: dnaRow.computed_at || new Date().toISOString(),
          },
        });
      }
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
      if (!session?.user) set({ profile: null, dna: null });
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, dna: null });
  },
}));
