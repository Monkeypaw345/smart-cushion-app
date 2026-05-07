import React, { useState, useMemo } from 'react';
import { useWebSocket, type PostureLabel } from '../hooks/useWebSocket';

type PostureMode = 'center' | 'left' | 'right' | 'forward' | 'empty';

// ---------------------------------------------------------------------------
// Posture metadata
// ---------------------------------------------------------------------------
const POSTURE_LABELS: Record<PostureLabel, string> = {
  NUP:    'Natural Upright',
  LF:     'Leaning Forward',
  LB:     'Leaning Backward',
  LFSR:   'Lean Fwd – Right',
  LFSL:   'Lean Fwd – Left',
  CRL:    'Cross-Leg (Right)',
  CLL:    'Cross-Leg (Left)',
  CRLL:   'Cross-Leg Deep (Right)',
  CLLL:   'Cross-Leg Deep (Left)',
  EMPTY:  'No Person',
  OBJECT: 'Object Detected',
};

interface Sensors { FL: number; FM: number; FR: number; ML: number; MM: number; MR: number; BL: number; BM: number; BR: number; }
const ZERO_SENSORS: Sensors = { FL:0, FM:0, FR:0, ML:0, MM:0, MR:0, BL:0, BM:0, BR:0 };
const MOCK_SENSORS: Record<PostureMode, Sensors> = {
  center:  { FL: 30, FM: 50, FR: 30, ML: 40, MM: 70, MR: 40, BL: 35, BM: 55, BR: 35 },
  left:    { FL: 70, FM: 30, FR: 8,  ML: 78, MM: 30, MR: 10, BL: 65, BM: 25, BR: 5  },
  right:   { FL: 5,  FM: 20, FR: 85, ML: 10, MM: 30, MR: 88, BL: 8,  BM: 15, BR: 70 },
  forward: { FL: 75, FM: 80, FR: 70, ML: 35, MM: 40, MR: 32, BL: 8,  BM: 10, BR: 8  },
  empty:   ZERO_SENSORS,
};

const fmt = (secs: number) => {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const cellClass = (val: number, occupied: boolean) => {
  if (!occupied) return 'bg-capy-bg text-capy-muted/60';
  if (val < 20) return 'bg-capy-card text-capy-muted';
  if (val < 60) return 'bg-capy-amber-soft text-capy-brown-3';
  return 'bg-capy-danger/25 text-capy-danger font-bold';
};

// Derive a coarse posture mode from the heatmap so the capybara reacts
const modeFromSensors = (s: Sensors, occupied: boolean): PostureMode => {
  if (!occupied) return 'empty';
  const left  = s.FL + s.ML + s.BL;
  const right = s.FR + s.MR + s.BR;
  const front = s.FL + s.FM + s.FR;
  const back  = s.BL + s.BM + s.BR;
  const lat   = (right - left) / (right + left + 1);
  const sag   = (front - back) / (front + back + 1);
  if (sag >  0.30) return 'forward';
  if (lat >  0.25) return 'right';
  if (lat < -0.25) return 'left';
  return 'center';
};

export const LiveMonitor: React.FC = () => {
  const ws = useWebSocket();
  const msg = ws.lastMessage;

  // ---- Manual/sim override (for demo without hardware) ----
  const [simMode, setSimMode] = useState<PostureMode | null>(null);

  // ---- Real data from fog ----
  const occupiedReal = msg?.occupancy_state === 'occupied';
  const realSensors: Sensors | null = msg?.sensors_heatmap_pct?.length === 9
    ? {
        FL: msg.sensors_heatmap_pct[0], FM: msg.sensors_heatmap_pct[1], FR: msg.sensors_heatmap_pct[2],
        ML: msg.sensors_heatmap_pct[3], MM: msg.sensors_heatmap_pct[4], MR: msg.sensors_heatmap_pct[5],
        BL: msg.sensors_heatmap_pct[6], BM: msg.sensors_heatmap_pct[7], BR: msg.sensors_heatmap_pct[8],
      }
    : null;

  // ---- Effective view: sim overrides real when set ----
  const mode: PostureMode = simMode ?? (realSensors ? modeFromSensors(realSensors, occupiedReal) : 'empty');
  const sensors: Sensors = simMode
    ? MOCK_SENSORS[simMode]
    : realSensors ?? ZERO_SENSORS;
  const occupied = simMode ? simMode !== 'empty' : occupiedReal;

  const sessionDuration = msg?.session_duration_sec ?? 0;
  const poorDuration    = msg?.poor_posture_duration_sec ?? 0;
  const goodPct         = msg ? Math.round(msg.good_posture_pct) : 0;
  const alertCount      = msg?.alert_count ?? 0;
  const posture: PostureLabel = msg?.posture ?? 'EMPTY';

  // ---- Visual mapping for the capybara cushion (uses PNGs from /public) ----
  const view = useMemo(() => {
    switch (mode) {
      case 'right':
        return {
          tint: 'from-capy-danger/20 to-capy-danger/30',
          alertTitle: <>You are leaning too far right. <span className="text-capy-danger">→</span></>,
          aiMessage: "Ouch! You're really leaning to the right. Try shifting weight to the left. Your back will thank you!",
          image: '/capy-sad-right.png',
          slide:  'translate-x-12 rotate-6',
          mood: 'bad' as const,
        };
      case 'left':
        return {
          tint: 'from-capy-danger/20 to-capy-danger/30',
          alertTitle: <><span className="text-capy-danger">←</span> You are leaning too far left.</>,
          aiMessage: "Hey, you're leaning way left. Shift your weight back to the center!",
          image: '/capy-sad-left.png',
          slide: '-translate-x-12 -rotate-6',
          mood: 'bad' as const,
        };
      case 'forward':
        return {
          tint: 'from-capy-warn/20 to-capy-warn/30',
          alertTitle: <>You are slouching forward. <span className="text-capy-warn">↓</span></>,
          aiMessage: "Roll your shoulders back and lift your chest. Stack your spine over your hips.",
          image: '/capy-sad-right.png',
          slide: 'translate-y-4 scale-95',
          mood: 'bad' as const,
        };
      case 'empty':
        return {
          tint: 'from-capy-card to-capy-border/60',
          alertTitle: <>No person on the cushion.</>,
          aiMessage: "Cushion is empty. Settle in when you're ready!",
          image: '/capy-sleeping.png',
          slide: 'translate-x-0 scale-95 opacity-80',
          mood: 'neutral' as const,
        };
      default:
        return {
          tint: 'from-capy-success/20 to-capy-success/30',
          alertTitle: <>Perfect posture! <span className="text-capy-success">✦</span></>,
          aiMessage: "Great job! You're sitting like a champion capy. Keep staying centered.",
          image: '/capy-good.png',
          slide: 'translate-x-0',
          mood: 'good' as const,
        };
    }
  }, [mode]);

  return (
    <div className="mx-auto max-w-6xl text-capy-text px-4 md:px-8 py-6 md:py-8 space-y-6">

      {/* Simulation buttons — keep until real hardware feed is verified */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-capy-card border border-capy-border p-3 shadow-inner items-center">
        <span className="font-bold text-capy-muted text-xs uppercase tracking-widest mr-2 ml-1">Test Hardware:</span>
        <button onClick={() => setSimMode('left')}    className="rounded-lg bg-capy-danger hover:opacity-90 px-3 py-1.5 text-white font-bold text-xs uppercase tracking-widest transition">Lean Left</button>
        <button onClick={() => setSimMode('center')}  className="rounded-lg bg-capy-success hover:opacity-90 px-3 py-1.5 text-white font-bold text-xs uppercase tracking-widest transition">Center</button>
        <button onClick={() => setSimMode('right')}   className="rounded-lg bg-capy-danger hover:opacity-90 px-3 py-1.5 text-white font-bold text-xs uppercase tracking-widest transition">Lean Right</button>
        <button onClick={() => setSimMode('forward')} className="rounded-lg bg-capy-warn  hover:opacity-90 px-3 py-1.5 text-white font-bold text-xs uppercase tracking-widest transition">Forward</button>
        <button onClick={() => setSimMode('empty')}   className="rounded-lg bg-capy-muted hover:opacity-90 px-3 py-1.5 text-white font-bold text-xs uppercase tracking-widest transition">Empty</button>
        <button onClick={() => setSimMode(null)}      className="rounded-lg bg-capy-brown hover:bg-capy-brown-3 px-3 py-1.5 text-white font-bold text-xs uppercase tracking-widest transition ml-auto">
          Use Live Sensors
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT: Sensors & Alert Status */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-5">

          <div className="rounded-3xl bg-capy-card p-6 shadow-sm border border-capy-border">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-capy-muted">Active Session</p>
                <h2 className="text-2xl font-black tracking-tight">{occupied ? 'Person Detected' : 'No Person'}</h2>
                <p className="text-sm text-capy-muted">{simMode ? `Simulated · ${mode}` : POSTURE_LABELS[posture]}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-capy-muted">Session</p>
                <p className="text-xl font-mono font-bold text-capy-brown">{fmt(sessionDuration)}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-capy-bg p-4 border border-capy-border/60">
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-capy-muted">
                Pressure Map · Top-Down
              </p>
              <div className="mx-auto grid max-w-[260px] grid-cols-3 gap-2">
                {(['FL','FM','FR','ML','MM','MR','BL','BM','BR'] as (keyof Sensors)[]).map(k => {
                  const val = sensors[k];
                  return (
                    <div key={k} className={`flex aspect-square flex-col items-center justify-center rounded-xl transition-colors duration-300 border border-capy-border/40 ${cellClass(val, occupied)}`}>
                      <span className="text-[10px] font-bold opacity-70 tracking-widest">{k}</span>
                      <span className="text-lg font-mono font-bold">{occupied ? Math.round(val) : 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-capy-card p-6 shadow-sm border border-capy-border">
            <h3 className="mb-4 text-lg font-black tracking-tight">Alert Status</h3>
            <div className="grid grid-cols-2 gap-y-6 text-center">
              <div>
                <p className="text-2xl font-mono font-bold text-capy-text">{fmt(sessionDuration)}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-capy-muted">Total</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-capy-danger">{fmt(poorDuration)}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-capy-muted">Poor</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-capy-amber font-mono">{alertCount}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-capy-muted">Alerts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-capy-success font-mono">{goodPct}%</p>
                <p className="text-xs font-bold uppercase tracking-wider text-capy-muted">Good %</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Capybara coach */}
        <div className="col-span-12 flex flex-col lg:col-span-7">
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-capy-card p-8 shadow-sm border border-capy-border overflow-hidden relative min-h-[640px]">

            <div className="absolute top-6 w-full px-8 flex justify-between">
              <h3 className="text-lg font-black tracking-tight">Current Posture</h3>
              <button className="text-sm font-medium text-capy-muted hover:text-capy-text underline">Calibrate</button>
            </div>

            {/* Organic wavy cushion background — color reacts to posture */}
            <div
              className={`relative mt-12 flex h-72 w-72 items-center justify-center bg-gradient-to-br shadow-inner transition-colors duration-700 ${view.tint}`}
              style={{ borderRadius: '43% 57% 65% 35% / 45% 45% 55% 55%' }}
            >
              <img
                src={view.image}
                alt="Capybara"
                className={`z-10 w-56 object-contain drop-shadow-xl transition-all duration-500 ease-in-out ${view.slide}`}
              />
            </div>

            <h2 className="mt-8 text-center text-3xl font-black tracking-tight transition-all duration-300 px-4">
              {view.alertTitle}
            </h2>

            <div className="mt-6 flex max-w-md items-start gap-3 px-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-capy-amber-soft border border-capy-border text-xl shadow-sm">
                🦫
              </div>
              <div className={`relative rounded-2xl rounded-tl-none px-5 py-4 text-sm font-medium shadow-sm border ${
                view.mood === 'good'
                  ? 'bg-capy-success/10 text-capy-success border-capy-success/40'
                  : view.mood === 'bad'
                  ? 'bg-capy-danger/10 text-capy-danger border-capy-danger/30'
                  : 'bg-capy-amber-soft text-capy-brown-3 border-capy-border'
              }`}>
                {view.aiMessage}
              </div>
            </div>

            {view.mood === 'bad' && (
              <button
                onClick={() => setSimMode('center')}
                className="mt-6 rounded-xl bg-capy-danger hover:opacity-90 px-6 py-3 font-bold text-white shadow-sm transition"
              >
                OK, adjusted!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
