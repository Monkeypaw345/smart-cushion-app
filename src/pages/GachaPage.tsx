import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { TransparentImage } from '../components/TransparentImage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const STICKER_MAP: Record<string, string> = {
  'Hot Spring Capy': '/assets/capybara/postures/cll.png',
  'Crown Capy':      '/assets/capybara/postures/crl_v2.png',
  'Flex Capy':       '/assets/capybara/postures/lf.png',
  'Flat Capy':       '/assets/capybara/postures/lb_v2.png',
  'Sleepy Capy':     '/assets/capybara/postures/clll.png',
  'Bandage Capy':    '/assets/capybara/postures/lb.png',
  'Running Capy':    '/assets/capybara/postures/lfsl_v2.png',
  'Dumbbell Capy':   '/assets/capybara/postures/lfsr_v2.png',
  'Iceberge Capy':   '/assets/capybara/postures/crll.png',
};

const RARITY_COLORS: Record<string, string> = {
  'R':   'bg-slate-400',
  'SR':  'bg-capy-amber',
  'SSR': 'bg-purple-600 animate-pulse',
};

export const GachaPage: React.FC = () => {
  const { user, refreshUser, isDemo } = useAuth();
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ item: string; rarity: string; isNew: boolean } | null>(null);

  const handleRoll = async () => {
    if (rolling) return;
    if (isDemo) {
      alert("Demo users can't spend real Gems! (But you can try in the full version)");
      return;
    }
    
    const hasFreeSpins = (user?.free_spins || 0) > 0;
    if (!hasFreeSpins && (user?.gems || 0) < 10) {
      alert("Not enough Gems! Keep sitting correctly to earn more.");
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
        alert("Roll failed. Please try again.");
        setRolling(false);
      }
    } catch (err) {
      alert("Connection error.");
      setRolling(false);
    }
  };

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
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl">
                <span className="font-bold text-slate-600">R (Common)</span>
                <span className="font-black">75%</span>
              </div>
              <div className="flex justify-between items-center bg-amber-100 p-3 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-700">SR (Rare)</span>
                <span className="font-black">20%</span>
              </div>
              <div className="flex justify-between items-center bg-purple-100 p-3 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-700">SSR (Super Rare)</span>
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
                {result.rarity === 'SSR' ? '🔥 SSR DROP 🔥' : result.rarity}
              </div>

              <div className="w-48 h-48 mx-auto mb-6 p-4">
                <TransparentImage src={STICKER_MAP[result.item]} alt={result.item} className="w-full h-full object-contain" />
              </div>

              <h2 className="text-2xl font-black text-capy-brown mb-2">{result.item}</h2>
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
