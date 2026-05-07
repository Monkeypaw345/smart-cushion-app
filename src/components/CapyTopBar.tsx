import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const fmt = (secs: number) => {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const CapyTopBar: React.FC = () => {
  const ws = useWebSocket();
  const msg = ws.lastMessage;
  const occupied = msg?.occupancy_state === 'occupied';
  const goodPct = msg ? Math.round(msg.good_posture_pct) : 0;
  const session = msg?.session_duration_sec ?? 0;
  const goodSecs = Math.floor((session * goodPct) / 100);

  return (
    <div className="bg-capy-brown text-capy-card flex items-center justify-between px-6 md:px-10 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${occupied ? 'bg-capy-success' : 'bg-capy-card/40'}`} />
        <span className="text-sm">
          <span className="text-capy-card/70">Cushion Status:</span>{' '}
          <span className={occupied ? 'text-capy-success font-bold' : 'text-capy-card/70'}>
            {occupied ? 'Connected & Cozy' : ws.status === 'connected' ? 'Connected — Idle' : 'Disconnected'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-widest text-capy-card/70">Good Posture (Live)</p>
          <p className="font-mono font-bold text-lg tracking-widest">{fmt(goodSecs)}</p>
        </div>
        <div className="hidden md:flex items-center gap-1 bg-capy-success/30 border border-capy-success/60 text-capy-success-soft rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-capy-success-soft inline-block animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Go Active</span>
        </div>
        <button className="border border-capy-card/40 text-capy-card hover:bg-capy-card/10 rounded-xl px-4 py-1.5 text-sm font-semibold transition">
          Start Coaching
        </button>
      </div>
    </div>
  );
};
