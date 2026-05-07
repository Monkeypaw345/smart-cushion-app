import React from 'react';
import { useGamification, STAMP_INFO } from '../lib/gamification';
import type { StampId } from '../lib/gamification';
import { SpineySticker } from '../components/SpineyStickers';
import type { StickerKind } from '../components/SpineyStickers';

const ORDER: StampId[] = [
  'first_session', 'streak_7', 'first_duel', 'gems_100',
  'streak_30', 'perfect_week', 'send_10', 'rank_1',
  'gems_1000', 'perfect_day', 'level_20', 'rare_sticker',
];

export const Passport: React.FC = () => {
  const { state } = useGamification();
  const earned = new Set(state.earnedStamps);

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 md:py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-capy-text">Posture Passport</h1>
          <p className="text-sm text-capy-muted mt-1">Collect stamps to unlock new stickers in the shop.</p>
        </div>
        <div className="bg-capy-card border border-capy-border px-4 py-2 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest font-bold text-capy-muted">Earned</p>
          <p className="text-2xl font-black font-mono text-capy-amber">{earned.size} <span className="text-capy-muted text-base">/ {ORDER.length}</span></p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {ORDER.map(id => {
          const info = STAMP_INFO[id];
          const isEarned = earned.has(id);
          return (
            <div
              key={id}
              className={`rounded-3xl p-6 border-2 flex flex-col items-center text-center transition-all ${
                isEarned
                  ? 'bg-capy-amber-soft border-capy-amber shadow-lg shadow-capy-amber/10'
                  : 'bg-capy-card border-dashed border-capy-border opacity-60'
              }`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-3 ${
                isEarned ? 'bg-capy-card border border-capy-border' : 'bg-capy-bg grayscale'
              }`}>
                <SpineySticker kind={info.sticker as StickerKind} size={68} />
              </div>
              <div className={`flex items-center gap-1.5 mb-1 ${isEarned ? 'text-capy-brown' : 'text-capy-muted'}`}>
                <span className="material-symbols-outlined text-base">{info.icon}</span>
                <p className="text-sm font-black tracking-tight">{info.title}</p>
              </div>
              <p className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${isEarned ? 'text-capy-amber' : 'text-capy-muted'}`}>
                {isEarned ? 'Unlocked' : 'Locked'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
