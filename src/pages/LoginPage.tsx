import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock Login for Vercel Demo
    setTimeout(() => {
      login(username || 'Smart User', 'user', 100, [], 10);
      navigate('/');
      setLoading(false);
    }, 800);
  };

  const handleDemo = () => {
    login('Demo Guest', 'demo', 100, [], 10);
    navigate('/');
  };

  const handleLegacyDemo = () => {
    login('Legacy Demo', 'user', 0, [], 0);
    navigate('/legacy-demo');
  };

  return (
    <div className="min-h-screen bg-legacy-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Professional subtle backdrop */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-legacy-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-legacy-surface-low rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-legacy-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 transition-transform hover:rotate-0 cursor-default">
            <span className="material-symbols-outlined text-white text-4xl">align_items_stretch</span>
          </div>
          <h1 className="text-4xl font-black text-legacy-on-surface tracking-tighter">PostureAI</h1>
          <p className="text-legacy-on-surface/50 font-medium mt-2">Clinical Grade Spinal Monitoring</p>
        </div>

        <div className="bg-white border border-legacy-on-surface/5 rounded-[2.5rem] p-10 shadow-2xl shadow-legacy-primary/10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-legacy-on-surface/40 mb-3 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="smartcushion"
                className="w-full bg-legacy-bg border-0 rounded-2xl px-6 py-4 text-legacy-on-surface focus:ring-2 focus:ring-legacy-primary/20 transition-all placeholder:text-legacy-on-surface/20"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-legacy-on-surface/40 mb-3 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-legacy-bg border-0 rounded-2xl px-6 py-4 text-legacy-on-surface focus:ring-2 focus:ring-legacy-primary/20 transition-all placeholder:text-legacy-on-surface/20"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-error text-xs font-bold text-center bg-error/5 py-3 rounded-xl border border-error/10"
              >
                ⚠ {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-legacy-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-legacy-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Access Portal'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-legacy-on-surface/5 space-y-4">
            <button
              onClick={handleDemo}
              className="w-full py-4 bg-legacy-bg text-legacy-on-surface font-bold rounded-2xl hover:bg-legacy-surface-container transition-colors text-sm"
            >
              Open V2 Dashboard (Modern)
            </button>
            <button
              onClick={handleLegacyDemo}
              className="w-full py-4 border-2 border-legacy-primary/20 text-legacy-primary font-bold rounded-2xl hover:bg-legacy-primary/5 transition-colors text-sm"
            >
              View Legacy Demo (Classic)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
