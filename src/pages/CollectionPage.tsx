import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TransparentImage } from '../components/TransparentImage';

const STICKERS = [
  { id: 'Hot Spring Capy', rarity: 'R',   path: '/assets/capybara/postures/cll.png' },
  { id: 'Crown Capy',      rarity: 'R',   path: '/assets/capybara/postures/crl_v2.png' },
  { id: 'Flex Capy',       rarity: 'R',   path: '/assets/capybara/postures/lf.png' },
  { id: 'Flat Capy',       rarity: 'SR',  path: '/assets/capybara/postures/lb_v2.png' },
  { id: 'Sleepy Capy',     rarity: 'SR',  path: '/assets/capybara/postures/clll.png' },
  { id: 'Bandage Capy',    rarity: 'SR',  path: '/assets/capybara/postures/lb.png' },
  { id: 'Running Capy',    rarity: 'SSR', path: '/assets/capybara/postures/lfsl_v2.png' },
  { id: 'Dumbbell Capy',   rarity: 'SSR', path: '/assets/capybara/postures/lfsr_v2.png' },
  { id: 'Iceberge Capy',   rarity: 'SSR', path: '/assets/capybara/postures/crll.png' },
];

const RARITY_STYLES: Record<string, string> = {
  'R':   'text-slate-400 border-slate-200 bg-slate-50',
  'SR':  'text-amber-600 border-amber-200 bg-amber-50',
  'SSR': 'text-purple-600 border-purple-200 bg-purple-50',
};

export const CollectionPage: React.FC = () => {
  const { user } = useAuth();
  const unlockedCount = user?.collection?.length || 0;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-capy-brown mb-2 tracking-tight">Capy Collection</h1>
          <p className="text-capy-muted font-bold uppercase tracking-[0.2em] text-xs">Browse your sticker library</p>
        </div>
        <div className="bg-capy-card border-2 border-capy-brown px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-capy-muted mb-1">Completion</span>
            <span className="text-2xl font-black text-capy-brown">{unlockedCount} / {STICKERS.length}</span>
          </div>
          <div className="w-12 h-12 bg-capy-success/10 rounded-full flex items-center justify-center text-xl">🏆</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {STICKERS.map((sticker) => {
          const isUnlocked = user?.collection?.includes(sticker.id);
          
          return (
            <div 
              key={sticker.id}
              className={`bg-capy-card border border-capy-border rounded-3xl p-6 flex flex-col items-center transition-all duration-500 ${!isUnlocked ? 'opacity-70' : 'shadow-xl shadow-capy-brown/5 scale-105'}`}
            >
              <div className={`text-[10px] font-black px-3 py-1 rounded-full border mb-4 ${RARITY_STYLES[sticker.rarity]}`}>
                {sticker.rarity}
              </div>

              <div className={`w-32 h-32 relative mb-4 flex items-center justify-center ${!isUnlocked ? 'brightness-0 opacity-20' : ''}`}>
                <TransparentImage src={sticker.path} alt={sticker.id} className="w-full h-full object-contain" />
              </div>

              <h3 className={`text-sm font-black text-center ${!isUnlocked ? 'text-capy-muted/40' : 'text-capy-brown'}`}>
                {isUnlocked ? sticker.id : '???'}
              </h3>
              
              {!isUnlocked && (
                <div className="mt-2 text-[10px] font-bold text-capy-muted/40 uppercase tracking-widest italic">
                  Keep Spinning!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
