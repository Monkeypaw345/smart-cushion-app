import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useGamification } from '../lib/gamification';

const mainItems = [
  { icon: 'home',     label: 'My Posture', path: '/live-monitor' },
  { icon: 'trending_up', label: 'Coach',   path: '/' },
  { icon: 'list_alt', label: 'My Journey', path: '/history' },
  { icon: 'insights', label: 'Insights',   path: '/insights' },
];

const capyItems = [
  { icon: 'palette',         label: 'Sticker Shop', path: '/shop' },
  { icon: 'star',            label: 'Squad Hub',    path: '/squad' },
  { icon: 'menu_book',       label: 'My Passport',  path: '/passport' },
];

const aiItems = [
  { icon: 'forum', label: 'AI Pal', path: '/ai-advisor' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'mx-3 px-4 py-2.5 flex items-center gap-3 rounded-2xl transition-colors text-sm',
    isActive
      ? 'bg-capy-active text-capy-brown font-bold shadow-sm'
      : 'text-capy-brown hover:bg-capy-hover font-medium'
  );

const sectionLabel = 'px-6 mt-6 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-capy-muted-2';

export const Sidebar: React.FC = () => {
  const { state } = useGamification();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-capy-sidebar flex flex-col py-6 hidden md:flex z-50 border-r border-capy-border overflow-y-auto custom-scrollbar">
      <div className="px-6 mb-2">
        <h2 className="text-2xl font-black tracking-tight text-capy-brown leading-none">Capy Squad</h2>
        <p className="text-sm text-capy-muted font-medium mt-1">Posture Coach</p>
      </div>

      <nav className="flex-1 flex flex-col">
        <p className={sectionLabel}>Main</p>
        <div className="mx-3 px-4 py-2.5 flex items-center gap-3 rounded-2xl text-sm text-capy-brown font-bold">
          <span className="text-base">👋</span>
          <span>Welcome, [User]!</span>
        </div>
        {mainItems.map(item => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <p className={sectionLabel}>Capy Squad</p>
        {capyItems.map(item => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <p className={sectionLabel}>AI Advisor</p>
        {aiItems.map(item => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <NavLink to="/settings" className={linkClass}>
          <span className="material-symbols-outlined text-xl">settings</span>
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Capy mascot avatar floating above the cash pill */}
      <div className="px-4 relative">
        <img
          src="/capy-good.png"
          alt="Capy"
          className="absolute -top-10 right-2 w-14 h-14 object-contain drop-shadow-md pointer-events-none"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      <div className="mx-4 mt-4 bg-capy-card border border-capy-border rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-capy-amber inline-block" />
          <div className="flex flex-col leading-tight">
            <span className="font-black text-capy-text text-sm">Capy Cash</span>
            <span className="text-[10px] text-capy-muted">{state.streak}-day streak ★</span>
          </div>
        </div>
        <span className="font-black font-mono text-capy-brown">{state.gems}</span>
      </div>
    </aside>
  );
};
