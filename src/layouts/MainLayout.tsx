import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { cn } from '../lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { icon: 'dashboard', label: 'Home', path: '/' },
  { icon: 'videocam', label: 'Monitor', path: '/live-monitor' },
  { icon: 'insights', label: 'Insights', path: '/insights' },
  { icon: 'history', label: 'History', path: '/history' },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased">
      <Sidebar />
      <main className="md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-outline-variant/10 flex justify-around items-center py-3 px-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-on-surface/40"
              )
            }
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
