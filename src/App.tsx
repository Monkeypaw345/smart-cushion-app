import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitor } from './pages/LiveMonitor';
import { Insights } from './pages/Insights';
import { AIAdvisor } from './pages/AIAdvisor';
import { SessionHistory } from './pages/SessionHistory';
import { Settings } from './pages/Settings';
import { Shop } from './pages/Shop';
import { Squad } from './pages/Squad';
import { Passport } from './pages/Passport';

import { WebSocketProvider } from './hooks/useWebSocket';
import { GamificationProvider } from './lib/gamification';

function App() {
  return (
    <WebSocketProvider>
      <GamificationProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live-monitor" element={<LiveMonitor />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/ai-advisor" element={<AIAdvisor />} />
              <Route path="/history" element={<SessionHistory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/squad" element={<Squad />} />
              <Route path="/passport" element={<Passport />} />
            </Routes>
          </MainLayout>
        </Router>
      </GamificationProvider>
    </WebSocketProvider>
  );
}

export default App;
