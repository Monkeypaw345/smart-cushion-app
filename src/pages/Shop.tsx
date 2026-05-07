import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SpineySticker } from '../components/SpineyStickers';
import type { StickerKind } from '../components/SpineyStickers';
import { useGamification } from '../lib/gamification';

interface StickerDef {
  id: StickerKind;
  name: string;
  cost: number;
  unlockLevel: number;
  category: 'good' | 'poor' | 'funny';
}

const STICKERS: StickerDef[] = [
  { id: 'sparkles', name: 'Hot Spring Capy', cost: 40, unlockLevel: 1, category: 'good' },
  { id: 'crown',    name: 'Crown Capy',      cost: 80, unlockLevel: 5, category: 'good' },
  { id: 'flex',     name: 'Flex Capy',       cost: 50, unlockLevel: 2, category: 'good' },
  { id: 'slouch',   name: 'Flat Capy',       cost: 20, unlockLevel: 1, category: 'poor' },
  { id: 'tired',    name: 'Sleepy Capy',     cost: 25, unlockLevel: 2, category: 'poor' },
  { id: 'bandage',  name: 'Bandage Capy',    cost: 35, unlockLevel: 3, category: 'poor' },
  { id: 'running',  name: 'Running Capy',    cost: 60, unlockLevel: 4, category: 'funny' },
  { id: 'dumbbell', name: 'Dumbbell Capy',   cost: 55, unlockLevel: 4, category: 'funny' },
  { id: 'sleeping', name: 'Iceberg Capy',    cost: 70, unlockLevel: 6, category: 'funny' },
];

const FRIENDS = [
  { name: 'Nam', score: 79 },
  { name: 'Phuong', score: 71 },
  { name: 'Thi', score: 65 },
];

const CATEGORY_LABELS: Record<StickerDef['category'], string> = {
  good: 'Good Posture',
  poor: 'Poor Posture',
  funny: 'Funny',
};

export const Shop: React.FC = () => {
  const { state, buySticker, sendSticker } = useGamification();
  const [selected, setSelected] = useState<StickerKind | null>(null);
  const [friend, setFriend] = useState<string>('Nam');
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get('friend');
    if (f && FRIENDS.find(x => x.name === f)) setFriend(f);
  }, [location.search]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleBuyOrSelect = (s: StickerDef) => {
    if (state.level < s.unlockLevel) return;
    if (state.ownedStickers.includes(s.id)) {
      setSelected(s.id);
      return;
    }
    if (buySticker(s.id, s.cost)) {
      setSelected(s.id);
      showToast(`Unlocked ${s.name}!`);
    } else {
      showToast(`Not enough gems for ${s.name}`);
    }
  };

  const handleSend = () => {
    if (!selected) return;
    sendSticker();
    showToast(`Sticker sent! ${friend} has been challenged to a 30-min duel`);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 md:py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">Sticker Shop</h1>
        <p className="text-sm text-on-surface/40 mt-1">Spend gems on Spiney stickers and challenge a friend.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8 space-y-8">
          {(['good', 'poor', 'funny'] as const).map(cat => (
            <div key={cat}>
              <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface/50 mb-3">{CATEGORY_LABELS[cat]}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {STICKERS.filter(s => s.category === cat).map(s => {
                  const owned = state.ownedStickers.includes(s.id);
                  const locked = state.level < s.unlockLevel;
                  const isSelected = selected === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleBuyOrSelect(s)}
                      disabled={locked}
                      className={`bg-white rounded-3xl p-4 border-2 transition-all relative text-left ${
                        isSelected
                          ? 'border-secondary shadow-lg shadow-secondary/20'
                          : 'border-outline-variant/10 hover:border-outline-variant/30'
                      } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-center bg-surface-container-low rounded-2xl py-3 mb-3">
                        <SpineySticker kind={s.id} size={96} />
                      </div>
                      <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        {owned ? (
                          <span className="text-[10px] uppercase tracking-widest font-bold text-tertiary-fixed-dim">Owned</span>
                        ) : (
                          <span className="flex items-center gap-1 text-secondary">
                            <span className="material-symbols-outlined text-sm">diamond</span>
                            <span className="text-xs font-black font-mono">{s.cost}</span>
                          </span>
                        )}
                        {locked && (
                          <span className="text-[10px] font-bold text-on-surface/50 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">lock</span>
                            Lv {s.unlockLevel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2rem] p-6 border border-outline-variant/15 sticky top-20">
            <h3 className="text-lg font-black tracking-tight text-on-surface mb-1">Send to friend</h3>
            <p className="text-xs text-on-surface/50 mb-4">Send a sticker and start a duel.</p>

            <div className="bg-surface-container-low rounded-2xl p-4 mb-4 flex items-center justify-center min-h-[140px]">
              {selected ? (
                <SpineySticker kind={selected} size={120} />
              ) : (
                <p className="text-xs text-on-surface/40 italic">Select a sticker</p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {FRIENDS.map(f => (
                <button
                  key={f.name}
                  onClick={() => setFriend(f.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${
                    friend === f.name ? 'border-secondary bg-secondary/5' : 'border-outline-variant/10 hover:border-outline-variant/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                      {f.name[0]}
                    </div>
                    <span className="font-bold text-sm text-on-surface">{f.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-on-surface/60">{f.score}%</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSend}
              disabled={!selected}
              className="w-full py-3 bg-secondary text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span className="text-xs uppercase tracking-widest">Send + challenge</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-white px-6 py-3 rounded-full shadow-2xl z-50 text-sm font-bold animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
};
