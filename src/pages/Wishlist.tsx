import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useApp } from "../lib/store";
import { getWishlist, removeFromWishlist } from "../lib/data";
import type { WishlistItem } from "../lib/types";
import Reveal from "../components/ui/Reveal";

export default function Wishlist() {
  const { user } = useApp();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getWishlist(user.id).then(setItems).finally(() => setLoading(false));
  }, [user]);

  const remove = async (id: string) => {
    await removeFromWishlist(id);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  return (
    <div className="container-px py-10 max-w-5xl mx-auto">
      <Reveal>
        <h1 className="text-3xl font-bold mb-1">Wishlist</h1>
        <p className="text-dim mb-8">Games you've saved from Discover and your recommendations.</p>
      </Reveal>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-cyan-glow" /></div>
      ) : items.length === 0 ? (
        <div className="glass p-10 text-center text-dim">Nothing here yet — hit the heart icon on any game to add it.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="glass overflow-hidden">
              <div className="w-full bg-deep" style={{ aspectRatio: "3/4" }}>
                {item.game_image && <img src={item.game_image} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-sm font-medium line-clamp-1">{item.game_name}</span>
                <button className="btn-ghost !p-1.5 flex-shrink-0" onClick={() => remove(item.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
