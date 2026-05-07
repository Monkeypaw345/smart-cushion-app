import React, { useEffect, useState } from 'react';

interface Piece { x: number; delay: number; color: string; rot: number; left: number; }

const colors = ['#8B5E3C', '#D4922A', '#a07550', '#faebd7', '#e8a838', '#7a9e5f', '#c0614a'];

interface Props { active: boolean; onDone: () => void; label?: string; }

export const Confetti: React.FC<Props> = ({ active, onDone, label }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    const arr: Piece[] = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      left: Math.random() * 100,
    }));
    setPieces(arr);
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.8; }
        }
      `}</style>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: 10,
            height: 14,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animation: `confetti-fall 2s linear ${p.delay}s forwards`,
            borderRadius: 2,
          }}
        />
      ))}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-capy-card backdrop-blur-md px-10 py-6 rounded-3xl shadow-2xl border-4 border-capy-amber animate-pulse">
            <p className="text-[10px] uppercase tracking-widest font-bold text-capy-amber mb-1">New Stamp Earned!</p>
            <h2 className="text-3xl font-black tracking-tighter text-capy-text">{label}</h2>
          </div>
        </div>
      )}
    </div>
  );
};
