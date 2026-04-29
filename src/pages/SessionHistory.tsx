import React, { useMemo } from 'react';
import {
  fetchSessions,
  getApiConfig,
  isMockMode,
  isoDaysAgo,
  secToMin,
  todayIso,
  type SessionRecord,
  type SessionsResponse,
} from '../lib/api';
import { useApiData } from '../hooks/useApiData';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

function goodPct(s: SessionRecord): number {
  if (!s.duration_sec) return 0;
  return Math.round(((s.duration_sec - s.poor_posture_duration_sec) / s.duration_sec) * 100);
}

function scoreColor(score: number): string {
  if (score >= 85) return 'tertiary';
  if (score >= 70) return 'primary';
  return 'error';
}

function toCsv(sessions: SessionRecord[]): string {
  const header = 'session_id,start_time_iso,end_time_iso,duration_sec,poor_posture_duration_sec,alert_count,good_pct';
  const rows = sessions.map((s) =>
    [
      s.session_id,
      s.start_time_iso,
      s.end_time_iso,
      s.duration_sec,
      s.poor_posture_duration_sec,
      s.alert_count,
      goodPct(s),
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

function downloadCsv(sessions: SessionRecord[]) {
  const blob = new Blob([toCsv(sessions)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-history-${todayIso()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const SessionHistory: React.FC = () => {
  const cfg = useMemo(getApiConfig, []);
  const today = useMemo(todayIso, []);
  const from = useMemo(() => isoDaysAgo(29), []);

  const { data, loading, error, refresh } = useApiData<SessionsResponse>(
    () => fetchSessions(cfg.deviceId, from, today),
    [cfg.deviceId, from, today],
  );

  const sessions = data?.sessions ?? [];
  // Newest first.
  const sorted = [...sessions].sort((a, b) => b.start_time_iso.localeCompare(a.start_time_iso));

  const totalSec = sessions.reduce((s, x) => s + x.duration_sec, 0);
  const totalPoorSec = sessions.reduce((s, x) => s + x.poor_posture_duration_sec, 0);
  const avgGoodPct =
    totalSec > 0 ? Math.round(((totalSec - totalPoorSec) / totalSec) * 100) : 0;
  const totalAlerts = sessions.reduce((s, x) => s + x.alert_count, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center w-full px-8 py-4 bg-[#f8f9ff] print:hidden">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tracking-tighter text-on-surface">PostureAI</span>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-6 items-center">
            <a className="text-on-surface/60 hover:text-primary transition-colors duration-200 font-medium tracking-tight" href="#">Support</a>
            <a className="text-on-surface/60 hover:text-primary transition-colors duration-200 font-medium tracking-tight" href="#">Documentation</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="p-2 text-on-surface/70 hover:text-primary transition-colors"
              title="Refresh"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <button className="p-2 text-on-surface/70 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface/70 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 px-12 py-10 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black text-on-surface tracking-tighter mb-2">Session History</h1>
            <p className="text-on-surface/50 text-lg">
              {isMockMode()
                ? 'Sample data — configure VITE_API_BASE_URL for live cloud.'
                : `Last 30 days · device ${cfg.deviceId}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => downloadCsv(sorted)}
              disabled={!sessions.length}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary border border-outline-variant/20 rounded-xl font-bold hover:bg-surface-bright transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
            >
              <span className="material-symbols-outlined">table_view</span>
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              disabled={!sessions.length}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
            >
              <span className="material-symbols-outlined">picture_as_pdf</span>
              Download PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-error-container text-on-error-container">
            <p className="font-bold mb-1">Cloud unavailable</p>
            <p className="text-sm opacity-80">{error}</p>
            <button onClick={refresh} className="mt-3 text-sm font-bold underline">Try again</button>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 bg-white rounded-[2rem] p-8 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-on-surface/40 uppercase text-xs tracking-widest font-bold">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Good %</th>
                    <th className="px-6 py-4">Poor min</th>
                    <th className="px-6 py-4">Alerts</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading && !data && (
                    <>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <tr key={`skel-${i}`} className="animate-pulse">
                          <td className="px-6 py-6 bg-white rounded-l-2xl" colSpan={6}>
                            <div className="h-4 bg-surface-container rounded" />
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  {!loading && sorted.length === 0 && !error && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-on-surface/40">
                        No sessions in the selected range.
                      </td>
                    </tr>
                  )}
                  {sorted.map((s) => {
                    const score = goodPct(s);
                    const color = scoreColor(score);
                    return (
                      <tr key={s.session_id} className="group hover:bg-surface-container-low transition-all">
                        <td className="px-6 py-6 bg-white group-hover:bg-transparent rounded-l-2xl font-semibold">
                          {formatDate(s.start_time_iso)}
                        </td>
                        <td className="px-6 py-6 bg-white group-hover:bg-transparent font-mono">
                          {formatDuration(secToMin(s.duration_sec))}
                        </td>
                        <td className="px-6 py-6 bg-white group-hover:bg-transparent">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                              <div className={`h-full bg-${color}`} style={{ width: `${score}%` }}></div>
                            </div>
                            <span className={`font-mono font-bold text-${color}`}>{score}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 bg-white group-hover:bg-transparent text-on-surface/70 font-mono">
                          {secToMin(s.poor_posture_duration_sec)}m
                        </td>
                        <td className="px-6 py-6 bg-white group-hover:bg-transparent">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            color === 'error' ? 'bg-error-container text-on-error-container' :
                            color === 'tertiary' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' :
                            'bg-primary-fixed text-on-primary-fixed-variant'
                          }`}>
                            {s.alert_count} Warnings
                          </span>
                        </td>
                        <td className="px-6 py-6 bg-white group-hover:bg-transparent rounded-r-2xl text-right">
                          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors cursor-pointer">chevron_right</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 relative overflow-hidden bg-secondary/10 backdrop-blur-xl rounded-[2rem] p-8 border border-secondary-fixed-dim/20">
            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20">
                <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
              <div>
                <h3 className="text-secondary font-black text-xl mb-2">Long-term Progression AI Insight</h3>
                <p className="text-on-surface/70 leading-relaxed max-w-2xl">
                  Across {sessions.length} session{sessions.length === 1 ? '' : 's'} in the last 30 days you averaged{' '}
                  <span className="text-secondary font-bold font-mono">{avgGoodPct}%</span> good posture.
                  {' '}Sessions longer than 90 minutes show the steepest decline — consider a mid-session reset.
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-surface-container-high rounded-[2rem] p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h4 className="text-on-surface/40 uppercase text-xs tracking-widest font-bold mb-6">Aggregate Biometrics</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium">Total Sessions</span>
                  <span className="font-mono text-2xl font-bold">{sessions.length}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium">Avg Good %</span>
                  <span className="font-mono text-2xl font-bold text-tertiary">{avgGoodPct}%</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium">Total Alerts</span>
                  <span className="font-mono text-2xl font-bold text-error">{totalAlerts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30 print:hidden">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
      </button>
    </div>
  );
};
