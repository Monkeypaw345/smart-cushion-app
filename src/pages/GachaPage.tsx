import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { SpineySticker } from '../components/SpineyStickers';
import type { StickerKind } from '../components/SpineyStickers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const RARITY_COLORS: Record<string, string> = {
  'R':   'bg-sky-400',
  'SR':  'bg-purple-500',
  'SSR': 'bg-amber-500 animate-pulse',
};

export const GachaPage: React.FC = () => {
  const { user, refreshUser, isDemo } = useAuth();
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ item: string; rarity: string; isNew: boolean } | null>(null);

  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

  // ---- Sync User Data on Entry ----
  useEffect(() => {
    if (!user || isDemo) return;

    const syncUserData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/profile?username=${user.username}`);
        if (res.ok) {
          const data = await res.json();
          refreshUser({ 
            gems: data.gems,
            free_spins: data.free_spins,
            collection: data.collection
          });
        }
      } catch (err) {
        console.error("Gacha entry sync failed:", err);
      }
    };

    syncUserData();
  }, [user?.username, isDemo, refreshUser]);

  const handleRoll = async () => {
    if (rolling) return;
    if (isDemo) {
      setErrorModal({ 
        title: "Demo Mode", 
        message: "Demo users can't spend real Gems! (But you can try in the full version)" 
      });
      return;
    }
    
    const hasFreeSpins = (user?.free_spins || 0) > 0;
    if (!hasFreeSpins && (user?.gems || 0) < 10) {
      setErrorModal({ 
        title: "Out of Gems", 
        message: "Not enough Gems! Keep sitting correctly to earn more." 
      });
      return;
    }

    setRolling(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/gacha/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username }),
      });

      if (response.ok) {
        const data = await response.json();
        // Wait a bit for dramatic effect
        setTimeout(() => {
          setResult({ item: data.item, rarity: data.rarity, isNew: data.isNew });
          refreshUser({ 
            gems: data.gemsRemaining, 
            collection: data.collection,
            free_spins: data.freeSpinsRemaining 
          });
          setRolling(false);
        }, 1500);
      } else {
        setErrorModal({ title: "Roll Failed", message: "Server had a hiccup. Please try again." });
        setRolling(false);
      }
    } catch (err) {
      setErrorModal({ title: "Connection Error", message: "Could not connect to the Capy Server." });
      setRolling(false);
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-black text-capy-brown mb-2 tracking-tight">Capy Gacha</h1>
        <p className="text-capy-muted font-bold uppercase tracking-[0.2em] text-xs">Test your luck to collect rare stickers!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Machine Section */}
        <div className="relative">
          <div className="bg-capy-card border-8 border-capy-brown rounded-[3rem] p-8 shadow-2xl relative overflow-hidden aspect-[3/4] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            {/* The Machine Glass Area */}
            <div className="w-full h-48 bg-capy-bg/50 rounded-2xl border-4 border-capy-brown/20 flex items-center justify-center relative mb-8">
              <AnimatePresence mode="wait">
                {rolling ? (
                  <motion.div 
                    key="rolling"
                    animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-6xl"
                  >
                    🌀
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-6xl opacity-20"
                  >
                    ❓
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleRoll}
              disabled={rolling}
              className="w-32 h-32 bg-capy-amber rounded-full border-8 border-capy-brown shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center group relative"
            >
              <span className="text-xs font-black text-capy-brown uppercase tracking-tighter">
                {(user?.free_spins || 0) > 0 ? 'Free' : 'Spin'}
              </span>
              <span className="text-xl">🔘</span>
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping opacity-0 group-hover:opacity-100 pointer-events-none" />
            </button>
            
            <p className="mt-4 text-sm font-black text-capy-brown uppercase">
              {(user?.free_spins || 0) > 0 ? `${user?.free_spins} FREE SPINS LEFT` : '10 Gems per spin'}
            </p>
          </div>
        </div>

        {/* Info & Rates Section */}
        <div className="space-y-6">
          <div className="bg-capy-card border border-capy-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-capy-brown uppercase tracking-widest text-xs mb-4">Gacha Rates</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-sky-50 p-3 rounded-xl border border-sky-100">
                <span className="font-bold text-sky-700">R (Common)</span>
                <span className="font-black">75%</span>
              </div>
              <div className="flex justify-between items-center bg-purple-50 p-3 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-700">SR (Rare)</span>
                <span className="font-black">20%</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-700">SSR (Super Rare)</span>
                <span className="font-black">5%</span>
              </div>
            </div>
          </div>

          <div className="bg-capy-brown text-white rounded-3xl p-6 shadow-lg shadow-capy-brown/20 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Balance</span>
              <span className="text-2xl font-black">{user?.gems || 0} Gems</span>
            </div>
            <div className="text-3xl">💎</div>
          </div>
        </div>
      </div>

      {/* Notification / Error Modal */}
      <AnimatePresence>
        {errorModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-capy-brown/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-capy-card border-4 border-capy-brown rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-black text-capy-brown mb-2 uppercase">{errorModal.title}</h3>
              <p className="text-capy-muted font-bold text-sm mb-6">{errorModal.message}</p>
              <button 
                onClick={() => setErrorModal(null)}
                className="w-full bg-capy-brown text-white font-black py-3 rounded-xl hover:bg-capy-brown/90 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-capy-brown/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-capy-card rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center relative"
            >
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-white font-black tracking-[0.3em] uppercase text-xs ${RARITY_COLORS[result.rarity]}`}>
                {result.rarity === 'SSR' ? '✨ SSR UNLOCKED ✨' : result.rarity}
              </div>

              <div className="w-48 h-48 mx-auto mb-6 p-4 flex items-center justify-center bg-white/50 rounded-full border-4 border-dashed border-capy-brown/10">
                <SpineySticker 
                  kind={result.item as StickerKind} 
                  size={140} 
                />
              </div>

              <h2 className="text-2xl font-black text-capy-brown mb-2">
                {capitalize(result.item)}
              </h2>
              <p className="text-sm text-capy-muted font-bold mb-8">
                {result.isNew ? "🎉 New addition to your collection!" : "Already owned! But still cute."}
              </p>

              <button 
                onClick={() => setResult(null)}
                className="w-full bg-capy-brown text-white font-black py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
