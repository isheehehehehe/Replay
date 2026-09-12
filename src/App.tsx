import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./lib/store";
import Navbar from "./components/layout/Navbar";
import PixelLoader from "./components/ui/PixelLoader";

import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Recommend from "./pages/Recommend";
import GameDetail from "./pages/GameDetail";
import Analytics from "./pages/Analytics";
import Wrapped from "./pages/Wrapped";
import Wishlist from "./pages/Wishlist";
import Settings from "./pages/Settings";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <PixelLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { hydrate, authLoading } = useApp();

  useEffect(() => { hydrate(); }, [hydrate]);

  if (authLoading) return <PixelLoader label="Diving in…" />;

  return (
    <>
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/discover" element={<Protected><Discover /></Protected>} />
          <Route path="/recommend" element={<Protected><Recommend /></Protected>} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/wrapped" element={<Protected><Wrapped /></Protected>} />
          <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
