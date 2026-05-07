import React from 'react';
import { useGamification } from '../lib/gamification';

export const TopBadge: React.FC = () => {
  const { state } = useGamification();
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-capy-amber-soft text-capy-text px-3 py-1.5 rounded-full border border-capy-border shadow-sm">
        <span className="material-symbols-outlined text-base text-capy-amber">diamond</span>
        <span className="text-sm font-black tracking-tight font-mono">{state.gems}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-capy-card text-capy-danger px-3 py-1.5 rounded-full border border-capy-border shadow-sm">
        <span className="material-symbols-outlined text-base">local_fire_department</span>
        <span className="text-sm font-black tracking-tight font-mono">{state.streak}</span>
      </div>
    </div>
  );
};
