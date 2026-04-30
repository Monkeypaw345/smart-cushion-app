import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { cn } from '../lib/utils';

export const Settings: React.FC = () => {
  const { url, setUrl, status, connect, error } = useWebSocket();
  const [tempUrl, setTempUrl] = React.useState(url);

  const handleSave = () => {
    setUrl(tempUrl);
    localStorage.setItem('fogWsUrl', tempUrl);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center w-full px-4 md:px-8 py-4 bg-[#f8f9ff] fixed top-0 z-50 border-b border-outline-variant/10">
        <div className="text-xl md:text-2xl font-black tracking-tighter text-on-surface">PostureAI</div>
        <nav className="hidden md:flex gap-8 items-center font-['Inter'] font-medium tracking-tight">
          <a className="text-on-surface/60 hover:text-primary transition-colors duration-200" href="#">Support</a>
          <a className="text-on-surface/60 hover:text-primary transition-colors duration-200" href="#">Docs</a>
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="material-symbols-outlined text-primary p-2">notifications</button>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-low border border-outline-variant/20">
             <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-24 px-4 md:px-12 pb-24 md:pb-12 min-h-screen">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-[3.5rem] font-black tracking-tighter leading-tight text-on-surface">Settings</h1>
          <p className="text-on-surface/60 max-w-2xl mt-2 text-sm md:text-base font-medium">Configure hardware, thresholds, and account preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
          {/* Left Column */}
          <div className="space-y-6 md:space-y-12">
            <section className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2rem] border border-outline-variant/10 shadow-sm transition-all hover:bg-surface-bright">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">hub</span>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Connection</h2>
              </div>
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">WebSocket URL</label>
                  <input 
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant py-2.5 px-1 font-mono text-primary focus:ring-0 focus:border-primary transition-all text-xs md:text-sm" 
                    type="text" 
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      status === 'connected' ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                    )}></div>
                    <span className="text-xs font-mono text-on-surface/60 uppercase">
                      Status: <span className={cn("font-bold", status === 'connected' ? "text-emerald-500" : "text-red-500")}>
                        {status}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => connect(tempUrl)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-lg hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                    >
                      Connect
                    </button>
                  </div>
                </div>
                {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
              </div>
            </section>

            <section className="bg-surface-container-low p-6 md:p-10 rounded-2xl md:rounded-[2rem]">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">notifications_active</span>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Alerts</h2>
              </div>
              <div className="space-y-8 md:space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Delay</label>
                    <span className="font-mono text-secondary font-bold text-sm">4.5s</span>
                  </div>
                  <input className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" max="10" min="0.5" step="0.5" type="range" defaultValue="4.5"/>
                  <p className="text-[10px] text-on-surface/40 italic leading-relaxed">Wait time before correction alert.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Intensity</label>
                    <span className="font-mono text-secondary font-bold text-sm">72%</span>
                  </div>
                  <input className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" max="100" min="0" step="1" type="range" defaultValue="72"/>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-12">
            <section className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2rem] border border-outline-variant/10 shadow-sm transition-all hover:bg-surface-bright">
              <div className="flex items-center gap-3 mb-8 md:mb-10">
                <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">person_pin</span>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Profile</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 mb-8 md:mb-10">
                <div className="relative">
                  <img 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl object-cover shadow-xl shadow-on-surface/5" 
                    alt="Clinician portrait" 
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" 
                  />
                  <div className="absolute -bottom-2 -right-2 bg-tertiary text-white p-1 rounded-full border-4 border-white">
                    <span className="material-symbols-outlined text-xs">verified</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl md:text-2xl font-black text-on-surface tracking-tighter">Dr. James Smith</h3>
                  <p className="text-xs font-mono text-primary font-bold">System ID: PKL-992-0X</p>
                </div>
              </div>
              <div className="bg-surface-container-low/50 p-4 md:p-6 rounded-xl md:rounded-2xl space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Hardware</span>
                  <span className="font-mono text-[10px] bg-white px-3 py-1 rounded-full text-on-surface/60 border border-outline-variant/20">esp32-cushion-01</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">Lab</span>
                  <span className="text-[10px] font-bold text-on-surface">Precision Kinetics</span>
                </div>
              </div>
            </section>

            <section className="bg-secondary/5 p-6 md:p-10 rounded-2xl md:rounded-[2rem] border border-secondary/10 shadow-sm">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">database</span>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Data Export</h2>
              </div>
              <p className="text-xs md:text-sm text-on-surface/60 mb-6 md:mb-8 leading-relaxed">Archive clinical sessions for compliance studies.</p>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl hover:bg-secondary/10 transition-all group border border-outline-variant/10 shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">table_view</span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-secondary">Export CSV</span>
                </button>
                <button className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl hover:bg-secondary/10 transition-all group border border-outline-variant/10 shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">picture_as_pdf</span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-secondary">Export PDF</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
