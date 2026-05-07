import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGamification } from '../lib/gamification';

interface Friend { name: string; score: number; gems: number; streak: number; }

const FRIENDS: Friend[] = [
  { name: 'Nam',    score: 79, gems: 380, streak: 5 },
  { name: 'Phuong', score: 71, gems: 290, streak: 3 },
  { name: 'Thi',    score: 65, gems: 200, streak: 2 },
];

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export const Squad: React.FC = () => {
  const { state, acceptDuel, winDuel } = useGamification();
  const [countdown, setCountdown] = useState<number>(30 * 60);

  useEffect(() => {
    if (!state.activeDuel) return;
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [state.activeDuel]);

  const me = { name: 'You', score: state.todayScore, gems: state.gems, streak: state.streak };
  const board = [me, ...FRIENDS];

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 py-6 md:py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface">Capy Squad</h1>
        <p className="text-sm text-on-surface/40 mt-1">Compete with friends and climb the leaderboard.</p>
      </header>

      {!state.activeDuel ? (
        <div className="bg-secondary/10 border border-secondary/30 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center text-lg font-black">N</div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">Incoming Challenge</p>
              <h3 className="font-black text-on-surface">Nam challenged you to a 30-min duel!</h3>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={acceptDuel}
              className="px-6 py-3 bg-secondary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90"
            >
              Accept
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-primary/10 border border-primary/30 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Active Duel vs Nam</p>
            <h3 className="text-2xl font-black tracking-tighter font-mono text-on-surface">{fmt(countdown)}</h3>
          </div>
          <button
            onClick={winDuel}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90"
          >
            Mark won
          </button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-outline-variant/15 overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-on-surface/40 bg-surface-container-low">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">Gems</div>
          <div className="col-span-1 text-right">Streak</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {board.map((p, i) => {
          const isMe = p.name === 'You';
          return (
            <div key={p.name} className={`grid grid-cols-12 px-6 py-4 items-center border-t border-outline-variant/10 ${isMe ? 'bg-secondary/5' : ''}`}>
              <div className="col-span-1 text-lg font-black font-mono text-on-surface">#{i + 1}</div>
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${isMe ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'}`}>
                  {p.name[0]}
                </div>
                <span className="font-bold text-on-surface">{p.name}{isMe && ' (you)'}</span>
              </div>
              <div className="col-span-2 text-right font-mono font-bold text-on-surface">{p.score}%</div>
              <div className="col-span-2 text-right flex items-center justify-end gap-1 text-secondary">
                <span className="material-symbols-outlined text-sm">diamond</span>
                <span className="font-mono font-bold">{p.gems}</span>
              </div>
              <div className="col-span-1 text-right flex items-center justify-end gap-1 text-error">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                <span className="font-mono font-bold">{p.streak}</span>
              </div>
              <div className="col-span-2 text-right">
                {!isMe && (
                  <Link
                    to={`/shop?friend=${encodeURIComponent(p.name)}`}
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send sticker
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
