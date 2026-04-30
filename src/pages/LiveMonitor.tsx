import React, { useState, useEffect } from 'react';
import { useWebSocket, type PostureLabel, type OccupancyState } from '../hooks/useWebSocket';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Posture metadata — 9 labels per system_architecture.md §1
// ---------------------------------------------------------------------------
const POSTURE_META: Record<PostureLabel, { label: string; icon: string; color: string; isGood: boolean }> = {
  NUP:     { label: 'Natural Upright',         icon: 'check_circle',    color: 'text-emerald-500', isGood: true  },
  LF:      { label: 'Lean Forward',            icon: 'arrow_downward',  color: 'text-amber-500',   isGood: false },
  LB:      { label: 'Lean Backward',           icon: 'arrow_upward',    color: 'text-amber-500',   isGood: false },
  LFSR:    { label: 'Lean Fwd – Right Arm',    icon: 'arrow_forward',   color: 'text-orange-500',  isGood: false },
  LFSL:    { label: 'Lean Fwd – Left Arm',     icon: 'arrow_back',      color: 'text-orange-500',  isGood: false },
  CRL:     { label: 'Cross-Leg (Right)',        icon: 'swap_vert',       color: 'text-rose-500',    isGood: false },
  CLL:     { label: 'Cross-Leg (Left)',         icon: 'swap_vert',       color: 'text-rose-500',    isGood: false },
  CRLL:    { label: 'Cross-Leg Deep (Right)',   icon: 'priority_high',   color: 'text-red-600',     isGood: false },
  CLLL:    { label: 'Cross-Leg Deep (Left)',    icon: 'priority_high',   color: 'text-red-600',     isGood: false },
  EMPTY:   { label: 'No Person',               icon: 'person_off',      color: 'text-slate-400',   isGood: false },
  OBJECT:  { label: 'Object Detected',         icon: 'category',        color: 'text-amber-600',   isGood: false },
};

// FSR heatmap cells in row-major order: FL FM FR / ML MM MR / BL BM BR
const HEATMAP_CELLS = [
  { label: 'FL', title: 'Front Left' },
  { label: 'FM', title: 'Front Mid'  },
  { label: 'FR', title: 'Front Right'},
  { label: 'ML', title: 'Mid Left'   },
  { label: 'MM', title: 'Center'     },
  { label: 'MR', title: 'Mid Right'  },
  { label: 'BL', title: 'Back Left'  },
  { label: 'BM', title: 'Back Mid'   },
  { label: 'BR', title: 'Back Right' },
];

// Heatmap colour: blue → amber → red
const heatmapColor = (pct: number) => {
  const p = pct / 100;
  const stops = [
    { at: 0.0, rgb: [59,  130, 246] },
    { at: 0.3, rgb: [59,  130, 246] },
    { at: 0.6, rgb: [245, 158,  11] },
    { at: 1.0, rgb: [239,  68,  68] },
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (p >= stops[i].at && p <= stops[i + 1].at) { lo = stops[i]; hi = stops[i + 1]; break; }
  }
  const span = hi.at - lo.at || 1;
  const t    = (p - lo.at) / span;
  const rgb  = lo.rgb.map((c, i) => Math.round(c + (hi.rgb[i] - c) * t));
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.15 + p * 0.65})`;
};

const formatDuration = (secs: number) => {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const OCCUPANCY_BADGE: Record<OccupancyState, { label: string; color: string }> = {
  occupied:  { label: 'Occupied',  color: 'bg-emerald-100 text-emerald-700' },
  empty:     { label: 'Empty',     color: 'bg-slate-100 text-slate-500'     },
  uncertain: { label: 'Uncertain', color: 'bg-amber-100 text-amber-700'     },
};

const ALERT_STATUS_COLOR: Record<string, string> = {
  IDLE:     'bg-slate-100 text-slate-500',
  WARNING:  'bg-red-100 text-red-700',
  COOLDOWN: 'bg-amber-100 text-amber-700',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const LiveMonitor: React.FC = () => {
  const { status, lastMessage, latency, error, connect, disconnect, discover } = useWebSocket();

  const [alertLog, setAlertLog] = useState<{ posture: string; time: string; id: number }[]>([]);

  // Accumulate alerts when WARNING fires
  useEffect(() => {
    if (lastMessage?.alert_status === 'WARNING' && lastMessage?.alert_active) {
      setAlertLog(prev => [
        { posture: lastMessage.posture, time: new Date().toLocaleTimeString(), id: Date.now() },
        ...prev,
      ].slice(0, 30));
    }
  }, [lastMessage?.alert_count]); // trigger on count change, not every message

  const heatmap  = lastMessage?.sensors_heatmap_pct ?? Array(9).fill(0);
  const posture  = lastMessage?.posture ?? 'EMPTY';
  const meta     = POSTURE_META[posture] ?? POSTURE_META.EMPTY;
  const occupancy = lastMessage?.occupancy_state ?? 'empty';
  const occupancyBadge = OCCUPANCY_BADGE[occupancy];
  const alertStatus = lastMessage?.alert_status ?? 'IDLE';

  const handleDiscover = async () => {
    const discoveredUrl = await discover();
    if (discoveredUrl) {
      connect(discoveredUrl);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest">

      {/* ── Connectivity Banner ─────────────────────────────────────────── */}
      <div className="bg-primary px-4 md:px-6 py-2 md:py-3 flex flex-wrap items-center justify-between gap-2 md:gap-3 text-white shadow-sm sticky top-0 z-[60]">
        <div className="flex items-center gap-2 md:gap-3">
          <span className={cn(
            'inline-flex h-2 w-2 md:h-2.5 md:w-2.5 rounded-full',
            status === 'connected'  ? 'bg-emerald-400 animate-pulse' :
            status === 'connecting' ? 'bg-amber-400 animate-pulse'   :
            status === 'error'      ? 'bg-red-400'                    : 'bg-white/30'
          )} />
          <span className="text-[11px] md:text-sm font-medium text-white/90">
            {status === 'connected'  ? 'Live Connection' :
             status === 'connecting' ? 'Connecting...' :
             status === 'error'      ? (error ?? 'Error') : 'Monitor — Offline'}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm font-mono">
          <span className="opacity-70 hidden sm:inline">Lat: {latency}ms</span>
          <button
            id="btn-toggle-connection"
            onClick={status === 'connected' ? disconnect : handleDiscover}
            className={cn(
              "flex items-center gap-1 px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all border",
              status === 'connected' 
                ? "bg-red-500/20 hover:bg-red-500/40 border-red-500/50 text-red-200" 
                : "bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/50 text-emerald-200"
            )}
          >
            <span className="material-symbols-outlined text-xs md:text-sm">
              {status === 'connected' ? 'power_off' : 'rocket_launch'}
            </span>
            <span>{status === 'connected' ? 'Stop' : 'Connect'}</span>
          </button>
        </div>
      </div>

      {/* ── Main 3-column layout ────────────────────────────────────────── */}
      <div className="p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 items-start">

        {/* ── Left: Posture + Heatmap ─────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-7 rounded-3xl shadow-[0_20px_40px_rgba(11,28,48,0.05)]">

            {/* Posture label */}
            <div className="flex justify-between items-start mb-4 md:mb-5">
              <div>
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-on-surface/40 mb-1">Current Posture</p>
                <h1 className={cn('text-2xl md:text-4xl font-black leading-none flex items-center gap-2', meta.color)}>
                  <span className="truncate max-w-[150px] md:max-w-none">{meta.label}</span>
                  <span className="material-symbols-outlined text-2xl md:text-3xl flex-shrink-0">{meta.icon}</span>
                </h1>
                <p className="text-[10px] md:text-xs font-mono text-on-surface/40 mt-1">{posture}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Session</p>
                <p className="font-mono text-lg md:text-xl font-bold text-on-surface">
                  {formatDuration(lastMessage?.session_duration_sec ?? 0)}
                </p>
                <span className={cn('text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full', occupancyBadge.color)}>
                  {occupancyBadge.label}
                </span>
              </div>
            </div>

            {/* FSR Heatmap — 3×3 grid (Anatomical View: Back at top, Front at bottom) */}
            <div className="bg-surface-container-low rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 mb-4 md:mb-5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black text-on-surface/40 text-center mb-4 md:mb-6">
                Pressure Map · Top-Down View
              </p>
              
              <div className="grid grid-cols-3 gap-2 md:gap-3 aspect-square max-w-[180px] md:max-w-[220px] mx-auto mb-4 md:mb-6">
                {/* Reorder to show Back row first (top), then Mid, then Front (bottom) */}
                {[6, 7, 8, 3, 4, 5, 0, 1, 2].map((idx) => {
                  const cell = HEATMAP_CELLS[idx];
                  const pct = heatmap[idx] ?? 0;
                  
                  // Dynamic rounding to make it look like a seat cushion
                  const isTopRow = idx >= 6 && idx <= 8;
                  const isBottomRow = idx >= 0 && idx <= 2;
                  const isLeftCol = idx % 3 === 0;
                  const isRightCol = idx % 3 === 2;
                  
                  let roundedClass = 'rounded-lg md:rounded-xl';
                  if (isTopRow && isLeftCol) roundedClass = 'rounded-tl-[1.5rem] md:rounded-tl-[2rem]';
                  else if (isTopRow && isRightCol) roundedClass = 'rounded-tr-[1.5rem] md:rounded-tr-[2rem]';
                  else if (isBottomRow && isLeftCol) roundedClass = 'rounded-bl-[1.5rem] md:rounded-bl-[2rem]';
                  else if (isBottomRow && isRightCol) roundedClass = 'rounded-br-[1.5rem] md:rounded-br-[2rem]';

                  return (
                    <div
                      key={cell.label}
                      title={`${cell.title}: ${pct.toFixed(1)}%`}
                      style={{ backgroundColor: heatmapColor(pct) }}
                      className={cn(
                        "flex flex-col items-center justify-center border border-primary/10 shadow-sm transition-all duration-300 py-2 md:py-3 cursor-default hover:scale-105",
                        roundedClass
                      )}
                    >
                      <span className="text-[8px] md:text-[9px] font-bold text-on-surface/50 mix-blend-color-burn">{cell.label}</span>
                      <span className="font-mono text-xs md:text-sm font-black text-on-surface mix-blend-color-burn">{pct.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 text-center border border-white/60">
                <p className="text-[10px] md:text-[11px] font-bold text-on-surface/70 mb-0.5 md:mb-1">Live Correction</p>
                <p className="text-[11px] md:text-sm font-medium text-on-surface leading-snug">
                  {posture === 'NUP' && "Perfect alignment. Pressure is even."}
                  {posture === 'LF' && "Leaning forward. Shift weight back."}
                  {posture === 'LB' && "Leaning back. Sit upright."}
                  {posture.includes('LFSR') && "Leaning fwd-right. Center up."}
                  {posture.includes('LFSL') && "Leaning fwd-left. Center up."}
                  {posture.includes('CRL') && "Right leg crossed. Uncross legs."}
                  {posture.includes('CLL') && "Left leg crossed. Uncross legs."}
                  {posture === 'EMPTY' && "Cushion is empty."}
                  {posture === 'OBJECT' && "Object detected."}
                </p>
              </div>
            </div>

            {/* Status row */}
            <div className="flex justify-between gap-2">
              <div className="flex-1 bg-surface-container-low py-2 md:py-3 rounded-lg md:rounded-xl flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-sm md:text-base mb-1">thermostat</span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-on-surface/60">Temp</span>
                <span className="font-mono text-xs md:text-sm font-bold">
                  {lastMessage ? lastMessage.temperature.toFixed(1) : '--'}°C
                </span>
              </div>
              <div className="flex-1 bg-surface-container-low py-2 md:py-3 rounded-lg md:rounded-xl flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-sm md:text-base mb-1">vibration</span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-on-surface/60">Motor</span>
                <span className={cn('font-mono text-xs md:text-sm font-bold', lastMessage?.alert_active ? 'text-red-500' : '')}>
                  {lastMessage?.alert_active ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex-1 bg-surface-container-low py-2 md:py-3 rounded-lg md:rounded-xl flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-sm md:text-base mb-1">notifications</span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-on-surface/60">Alerts</span>
                <span className="font-mono text-xs md:text-sm font-bold">{lastMessage?.alert_count ?? 0}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Middle: Analytics + Raw data ──────────────────────────────── */}
        <section className="col-span-12 lg:col-span-5 space-y-6">
          {/* Alert status card */}
          <div className="bg-white p-6 rounded-3xl shadow-[0_20px_40px_rgba(11,28,48,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black">Alert Status</h3>
              <span className={cn('text-xs font-bold px-2 py-1 rounded-full', ALERT_STATUS_COLOR[alertStatus] ?? 'bg-slate-100 text-slate-500')}>
                {alertStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4 text-center">
              {[
                { val: formatDuration(lastMessage?.session_duration_sec ?? 0), label: 'Total', color: 'text-on-surface' },
                { val: formatDuration(lastMessage?.poor_posture_duration_sec ?? 0), label: 'Poor', color: 'text-red-600' },
                { val: lastMessage?.alert_count ?? 0, label: 'Alerts', color: 'text-amber-600' },
                { val: `${lastMessage?.good_posture_pct ?? 0}%`, label: 'Good %', color: 'text-on-surface' },
              ].map((item, i) => (
                <div key={i} className="bg-surface-container-low rounded-xl p-3 md:p-4">
                  <p className={cn("text-lg md:text-2xl font-black", item.color)}>{item.val}</p>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-on-surface/40 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Posture Distribution */}
            {lastMessage?.posture_distribution && Object.keys(lastMessage.posture_distribution).length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Posture Distribution</p>
                <div className="space-y-2">
                  {Object.entries(lastMessage.posture_distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([label, secs]) => {
                      const pct = Math.round((secs / (lastMessage.session_duration_sec || 1)) * 100);
                      const meta = POSTURE_META[label as PostureLabel];
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">{meta?.icon}</span>
                              {meta?.label || label}
                            </span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full transition-all duration-500", meta?.color.replace('text-', 'bg-') || 'bg-primary')} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Session info */}
            {lastMessage?.session_id && (
              <div className="mt-8 pt-6 border-t border-on-surface/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary/40 text-lg">info</span>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface/40">Session Details</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-surface-container-low/50 p-3 rounded-2xl flex items-center gap-3 border border-on-surface/[0.03]">
                    <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">fingerprint</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface/30 uppercase leading-none mb-1">Session ID</p>
                      <p className="font-mono text-[10px] font-bold text-on-surface/60">{lastMessage.session_id.split('-').pop()}</p>
                    </div>
                  </div>

                  <div className="bg-surface-container-low/50 p-3 rounded-2xl flex items-center gap-3 border border-on-surface/[0.03]">
                    <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface/30 uppercase leading-none mb-1">Start Time</p>
                      <p className="text-[11px] font-bold text-on-surface/80">
                        {lastMessage.session_start_time_iso
                          ? new Date(lastMessage.session_start_time_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface-container-low/50 p-3 rounded-2xl flex items-center gap-3 border border-on-surface/[0.03] col-span-1 sm:col-span-2">
                    <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">devices</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-on-surface/30 uppercase leading-none mb-1">Active Device</p>
                      <p className="text-[11px] font-bold text-on-surface/80">Smart Cushion AI Node</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </section>

        {/* ── Right: Alert log ──────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-3 space-y-4 md:space-y-6">
          <div className={cn(
            'bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(11,28,48,0.05)] border-l-4',
            alertLog.length > 0 ? 'border-red-400' : 'border-on-surface/10'
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] md:text-sm uppercase tracking-widest font-black">Alert Log</h3>
              <span className="text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-low">
                {alertLog.length} events
              </span>
            </div>
            <div className="space-y-3 max-h-64 md:max-h-96 overflow-y-auto pr-1">
              {alertLog.length === 0 ? (
                <p className="text-[11px] text-on-surface/40 italic text-center py-4">No events recorded.</p>
              ) : (
                alertLog.map(alert => (
                  <div key={alert.id} className="flex gap-2 md:gap-3 items-start">
                    <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[9px] md:text-[11px] text-red-600">notification_important</span>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-on-surface truncate max-w-[120px] md:max-w-none">
                        {POSTURE_META[alert.posture as PostureLabel]?.label ?? alert.posture}
                      </p>
                      <p className="text-[9px] md:text-[11px] text-on-surface/40 font-mono">{alert.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-primary/5 border-l-4 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary/60 text-base">psychology</span>
              <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Tip</h3>
            </div>
            <p className="text-[11px] text-on-surface/60 leading-relaxed">
              {lastMessage?.posture === 'NUP' ? '✅ Good job!' : '⚠️ Adjust posture.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
