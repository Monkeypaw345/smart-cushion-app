import React, { useMemo } from 'react';
import {
  fetchSessions,
  fetchSummary,
  getApiConfig,
  isMockMode,
  isoDaysAgo,
  secToMin,
  toFriendlyBuckets,
  todayIso,
  type DailySummary,
  type SessionsResponse,
} from '../lib/api';
import { useApiData } from '../hooks/useApiData';

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

type DayBucket = {
  label: string;
  date: string;
  goodMin: number;
  poorMin: number;
};

function bucketByDay(sessions: SessionsResponse): DayBucket[] {
  const map = new Map<string, { good: number; poor: number }>();
  for (const s of sessions.sessions) {
    const d = s.start_time_iso.slice(0, 10);
    const durMin = secToMin(s.duration_sec);
    const poorMin = secToMin(s.poor_posture_duration_sec);
    const cur = map.get(d) ?? { good: 0, poor: 0 };
    cur.good += Math.max(0, durMin - poorMin);
    cur.poor += poorMin;
    map.set(d, cur);
  }
  // Last 7 days, oldest → newest, labelled by weekday.
  const out: DayBucket[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = isoDaysAgo(i);
    const day = new Date(date).getDay(); // 0 = Sun
    const idx = (day + 6) % 7; // 0 = Mon
    const v = map.get(date) ?? { good: 0, poor: 0 };
    out.push({ label: DAY_LABELS[idx], date, goodMin: v.good, poorMin: v.poor });
  }
  return out;
}

function weeklyStats(buckets: DayBucket[]) {
  let goodTotal = 0;
  let totalAll = 0;
  let best: DayBucket | null = null;
  let worst: DayBucket | null = null;
  for (const b of buckets) {
    const total = b.goodMin + b.poorMin;
    if (total === 0) continue;
    const goodPct = (b.goodMin / total) * 100;
    goodTotal += b.goodMin;
    totalAll += total;
    if (!best || goodPct > (best.goodMin / (best.goodMin + best.poorMin)) * 100) best = b;
    if (!worst || goodPct < (worst.goodMin / (worst.goodMin + worst.poorMin)) * 100) worst = b;
  }
  const weeklyScore = totalAll > 0 ? Math.round((goodTotal / totalAll) * 100) : 0;
  return { weeklyScore, best, worst };
}

function pctOfBucket(b: DayBucket | null): number {
  if (!b) return 0;
  const t = b.goodMin + b.poorMin;
  return t > 0 ? Math.round((b.goodMin / t) * 100) : 0;
}

function weekdayName(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { weekday: 'long' });
}

function analyzeTimeOfDay(sessions: SessionsResponse) {
  const buckets = {
    morning: { good: 0, total: 0 },   // 06-12
    afternoon: { good: 0, total: 0 }, // 12-18
    evening: { good: 0, total: 0 },   // 18-00
    night: { good: 0, total: 0 },     // 00-06
  };

  for (const s of sessions.sessions) {
    const hour = new Date(s.start_time_iso).getHours();
    const g = s.duration_sec - s.poor_posture_duration_sec;
    const t = s.duration_sec;

    if (hour >= 6 && hour < 12) { buckets.morning.good += g; buckets.morning.total += t; }
    else if (hour >= 12 && hour < 18) { buckets.afternoon.good += g; buckets.afternoon.total += t; }
    else if (hour >= 18 && hour < 24) { buckets.evening.good += g; buckets.evening.total += t; }
    else { buckets.night.good += g; buckets.night.total += t; }
  }

  const getPct = (b: { good: number; total: number }) => (b.total > 0 ? Math.round((b.good / b.total) * 100) : 0);
  return [
    { label: 'Morning', sub: '06:00 - 12:00', score: getPct(buckets.morning), icon: 'light_mode', color: 'text-amber-500' },
    { label: 'Afternoon', sub: '12:00 - 18:00', score: getPct(buckets.afternoon), icon: 'wb_sunny', color: 'text-primary' },
    { label: 'Evening', sub: '18:00 - 00:00', score: getPct(buckets.evening), icon: 'dark_mode', color: 'text-secondary' },
    { label: 'Night', sub: '00:00 - 06:00', score: getPct(buckets.night), icon: 'bedtime', color: 'text-blue-400' },
  ];
}

export const Insights: React.FC = () => {
  const cfg = useMemo(getApiConfig, []);
  const today = useMemo(todayIso, []);
  const from = useMemo(() => isoDaysAgo(6), []);

  const summary = useApiData<DailySummary>(
    () => fetchSummary(cfg.deviceId, today),
    [cfg.deviceId, today],
  );
  const sessions = useApiData<SessionsResponse>(
    () => fetchSessions(cfg.deviceId, from, today),
    [cfg.deviceId, from, today],
  );

  const loading = summary.loading || sessions.loading;
  const error = summary.error || sessions.error;
  const refresh = () => {
    summary.refresh();
    sessions.refresh();
  };

  const buckets = sessions.data ? bucketByDay(sessions.data) : [];
  const { weeklyScore, best, worst } = weeklyStats(buckets);
  const timeOfDay = sessions.data ? analyzeTimeOfDay(sessions.data) : [];

  const totalAlerts = sessions.data
    ? sessions.data.sessions.reduce((sum, s) => sum + s.alert_count, 0)
    : 0;

  const dist = toFriendlyBuckets(summary.data?.posture_distribution_pct);
  const goodPctToday = dist.upright_pct;
  const maxBarMin = Math.max(60, ...buckets.map((b) => b.goodMin + b.poorMin));

  // Mock trend logic (compared to a fixed goal of 80%)
  const trend = weeklyScore >= 80 ? '+3%' : weeklyScore >= 60 ? '+1%' : '-2%';

  const stats = [
    {
      label: 'Weekly score',
      value: loading ? '—' : `${weeklyScore}%`,
      sub: weeklyScore >= 75 ? 'GOOD' : weeklyScore >= 50 ? 'FAIR' : 'POOR',
      color: 'text-primary',
      trend: trend,
    },
    {
      label: 'Best day',
      value: best ? weekdayName(best.date) : '—',
      sub: best ? `${pctOfBucket(best)}%` : '—',
      color: 'text-on-surface',
    },
    {
      label: 'Worst day',
      value: worst ? weekdayName(worst.date) : '—',
      sub: worst ? `${pctOfBucket(worst)}%` : '—',
      color: 'text-on-surface',
      subColor: 'text-error',
    },
    {
      label: 'Total alerts',
      value: loading ? '—' : String(totalAlerts),
      sub: totalAlerts > 20 ? 'HIGH' : totalAlerts > 8 ? 'AMBER' : 'LOW',
      color: 'text-secondary',
      subBg: 'bg-[#fef3c7]',
      subTextColor: 'text-[#b45309]',
    },
  ];

  const downloadReport = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-after: always; }
          body { background: white !important; }
          .bg-surface-container-low { background: white !important; border: 1px solid #eee; }
        }
      `}</style>

      {/* Sync banner */}
      <div className="no-print bg-secondary/90 backdrop-blur-xl px-4 md:px-8 py-2 md:py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="material-symbols-outlined text-xs md:text-sm">
            {error ? 'cloud_off' : isMockMode() ? 'cloud_queue' : 'cloud_done'}
          </span>
          <span className="text-[10px] md:text-xs font-medium tracking-wide truncate max-w-[200px] md:max-w-none">
            {error ? `Error: ${error}` : isMockMode() ? 'Sample Data Mode' : `Live Data: ${cfg.deviceId}`}
          </span>
        </div>
        <button
          onClick={refresh}
          className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest opacity-80 hover:opacity-100 transition-opacity"
        >
          {loading ? 'Ref…' : 'Refresh'}
        </button>
      </div>

      <header className="px-4 md:px-8 py-4 md:py-6 flex justify-between items-center w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-on-surface leading-none">PostureAI</h1>
          <p className="text-[10px] md:text-sm font-medium tracking-tight text-on-surface/60">Performance Analysis</p>
        </div>
        <div className="flex items-center gap-4 md:gap-6 no-print">
          <button 
            onClick={downloadReport}
            className="hidden sm:flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Report
          </button>
          <div className="flex items-center gap-3 md:gap-4 border-l border-outline-variant/30 pl-4 md:pl-6">
            <span className="material-symbols-outlined text-on-surface/60 cursor-pointer text-xl">notifications</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-low border border-outline-variant/20">
              <img
                className="w-full h-full object-cover"
                alt="User avatar"
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 md:px-8 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`bg-white p-4 md:p-6 rounded-2xl border border-outline-variant/5 transition-all hover:bg-surface-bright shadow-sm ${loading ? 'animate-pulse' : ''}`}
            >
              <div className="flex justify-between items-start mb-1 md:mb-2">
                <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-on-surface/50">{stat.label}</p>
                {stat.trend && (
                  <span className={`text-[8px] md:text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-tertiary' : 'text-error'}`}>
                    {stat.trend} <span className="material-symbols-outlined text-[10px] align-middle">{stat.trend.startsWith('+') ? 'trending_up' : 'trending_down'}</span>
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-2xl md:text-4xl font-black ${stat.color} tracking-tighter font-mono`}>{stat.value}</span>
                <span className={`text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5 md:mb-1 ${stat.subBg || 'bg-primary/10'} ${stat.subTextColor || stat.subColor || 'text-primary'}`}>
                  {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] md:rounded-3xl">
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-on-surface">Posture breakdown</h3>
              <p className="text-xs md:text-sm text-on-surface/50">Spinal alignment analysis</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 md:gap-8">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#00685f 0% ${goodPctToday}%, #bcc9c6 ${goodPctToday}% 100%)`,
                  }}
                ></div>
                <div className="absolute inset-3 md:inset-4 rounded-full bg-surface-container-low flex flex-col items-center justify-center">
                  <span className="text-3xl md:text-4xl font-black text-primary font-mono leading-none">
                    {summary.loading ? '—' : `${goodPctToday}%`}
                  </span>
                  <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-on-surface/40 mt-1">Upright</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-col gap-3 md:gap-4 w-full sm:w-auto">
                {[
                  { label: 'Upright', color: 'bg-primary', pct: dist.upright_pct },
                  { label: 'Lean L', color: 'bg-[#60a5fa]', pct: dist.lean_left_pct },
                  { label: 'Lean R', color: 'bg-[#f59e0b]', pct: dist.lean_right_pct },
                  { label: 'Slouch', color: 'bg-error', pct: dist.slouching_forward_pct },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-3">
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${item.color}`}></div>
                    <div className="truncate">
                      <p className="text-[10px] md:text-xs font-bold truncate">
                        {item.label} <span className="font-mono text-on-surface/60 ml-1">{item.pct}%</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] md:rounded-3xl">
            <div className="mb-6 md:mb-8 flex justify-between items-start">
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-on-surface">Daily posture</h3>
                <p className="text-xs md:text-sm text-on-surface/50">Last 7 days · min</p>
              </div>
              <div className="flex gap-2 md:gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="text-[8px] md:text-[10px] font-bold text-on-surface/60">GOOD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                  <span className="text-[8px] md:text-[10px] font-bold text-on-surface/60">POOR</span>
                </div>
              </div>
            </div>
            <div className="h-48 md:h-64 flex items-end justify-between px-1 md:px-4 gap-1">
              {(buckets.length ? buckets : DAY_LABELS.map((l) => ({ label: l, date: '', goodMin: 0, poorMin: 0 }))).map((b, i) => {
                const goodH = (b.goodMin / maxBarMin) * 100;
                const poorH = (b.poorMin / maxBarMin) * 100;
                return (
                  <div key={i} className="flex-col items-center gap-2 flex flex-1">
                    <div className="w-full max-w-[1.5rem] md:max-w-[2.5rem] flex flex-col justify-end h-32 md:h-48 rounded-md md:rounded-lg overflow-hidden bg-white/20">
                      <div className="bg-error w-full" style={{ height: `${poorH}%` }}></div>
                      <div className="bg-primary w-full" style={{ height: `${goodH}%` }}></div>
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-on-surface/40 uppercase">{b.label.charAt(0)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-3xl border border-outline-variant/10 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-on-surface">Time of Day Performance</h3>
                <p className="text-xs md:text-sm text-on-surface/50">Fatigue detection trends</p>
              </div>
              <span className="px-2 py-1 bg-surface-container rounded-lg text-[9px] md:text-[10px] font-black tracking-widest text-on-surface/40">7D AVERAGE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              {timeOfDay.map((t, i) => (
                <div key={i} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-surface-container-low border border-outline-variant/5">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                    <span className={`material-symbols-outlined text-sm md:text-base ${t.color}`}>{t.icon}</span>
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface/60 truncate">{t.label}</span>
                  </div>
                  <div className="mb-1.5 md:mb-2">
                    <span className="text-xl md:text-2xl font-black font-mono text-on-surface">{t.score}%</span>
                  </div>
                  <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${t.score >= 75 ? 'bg-tertiary' : t.score >= 50 ? 'bg-primary' : 'bg-error'}`} style={{ width: `${t.score}%` }}></div>
                  </div>
                  <p className="mt-2 text-[8px] text-on-surface/40 font-medium uppercase truncate">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 p-6 md:p-8 rounded-[2rem] md:rounded-3xl border border-primary/10">
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-primary text-white rounded-xl md:rounded-2xl flex-shrink-0">
                <span className="material-symbols-outlined text-xl md:text-2xl">auto_awesome</span>
              </div>
              <div>
                <h4 className="text-base md:text-lg font-bold text-primary leading-tight">AI Advisor</h4>
                <p className="text-[10px] md:text-xs text-primary/60">Recommendation</p>
              </div>
            </div>
            <p className="text-[13px] md:text-sm text-on-surface/70 leading-relaxed mb-6 italic">
              {worst && pctOfBucket(worst) < 70
                ? `Decline on ${weekdayName(worst.date)}s. Try a stretch at 14:30.`
                : 'Performance stable. Keep it up!'}
            </p>
            <div className="space-y-3">
              <button className="w-full py-2.5 md:py-3 bg-primary text-white rounded-xl text-[10px] md:text-xs font-bold tracking-wide hover:opacity-90 transition-opacity">Correction Drill</button>
              <button className="w-full py-2.5 md:py-3 bg-white text-on-surface/50 rounded-xl text-[10px] md:text-xs font-bold tracking-wide border border-outline-variant/20 hover:bg-surface-bright transition-colors">Set Alert</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
