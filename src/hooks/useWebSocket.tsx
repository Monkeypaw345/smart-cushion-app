import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types — matches system_architecture.md Interface 02 (Fog → Local App)
// ---------------------------------------------------------------------------

export type OccupancyState = 'occupied' | 'empty' | 'uncertain';
export type AlertStatus    = 'IDLE' | 'WARNING' | 'COOLDOWN';
export type PostureLabel   = 'NUP' | 'LF' | 'LB' | 'LFSR' | 'LFSL'
                           | 'CRL' | 'CLL' | 'CRLL' | 'CLLL' | 'EMPTY' | 'OBJECT';

export interface FogRealtimeUpdate {
  record_type:            'realtime_update';
  device_id:              string;
  session_id:             string;
  session_start_time_iso: string;   // ISO 8601 UTC
  occupancy_state:        OccupancyState;
  posture:                PostureLabel;
  temperature:            number;
  alert_active:           boolean;
  alert_status:           AlertStatus;
  alert_count:            number;
  session_duration_sec:   number;
  poor_posture_duration_sec: number;
  posture_distribution:   Record<string, number>;
  sensors_heatmap_pct:    number[]; // 9 values [0–100], order: FL FM FR ML MM MR BL BM BR
}

// Connection status
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// ---------------------------------------------------------------------------
// Context & Provider
// ---------------------------------------------------------------------------

interface WebSocketContextType {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  status: ConnectionStatus;
  lastMessage: FogRealtimeUpdate | null;
  msgCount: number;
  latency: number;
  error: string | null;
  connect: (overrideUrl?: string) => void;
  disconnect: () => void;
  discover: () => Promise<string | null>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [url, setUrl] = useState<string>(
    localStorage.getItem('fogWsUrl') || ''
  );
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<FogRealtimeUpdate | null>(null);
  const [msgCount, setMsgCount] = useState(0);
  const [latency, setLatency] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const lastMsgTs = useRef<number>(0);

  const connect = useCallback((overrideUrl?: string) => {
    const targetUrl = overrideUrl || url;
    if (!targetUrl) {
      setError("No connection URL available. Please try searching first.");
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) return;
    if (ws.current?.readyState === WebSocket.CONNECTING) return;

    setStatus('connecting');
    setError(null);
    localStorage.setItem('fogWsUrl', targetUrl);

    try {
      const socket = new WebSocket(targetUrl);

      socket.onopen = () => {
        setStatus('connected');
        setMsgCount(0);
        lastMsgTs.current = 0;
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          if (data.type === 'connected') return;
          if (data.record_type !== 'realtime_update') return;

          const msg = data as FogRealtimeUpdate;
          setLastMessage(msg);
          setMsgCount((prev) => prev + 1);

          const now = Date.now();
          if (lastMsgTs.current > 0) {
            setLatency(now - lastMsgTs.current);
          }
          lastMsgTs.current = now;
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      socket.onerror = () => {
        setStatus('error');
        setError(`Cannot connect to ${url}`);
      };

      socket.onclose = (event) => {
        ws.current = null;
        if (event.wasClean) {
          setStatus('disconnected');
        } else {
          setStatus('error');
          setError(`Connection lost (code ${event.code})`);
        }
      };

      ws.current = socket;
    } catch (e) {
      setStatus('error');
      setError(`Invalid WebSocket URL: ${url}`);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    ws.current?.close(1000, 'User disconnected');
    ws.current = null;
    setStatus('disconnected');
    setError(null);
  }, []);

  const discover = useCallback(async () => {
    const firebaseBaseUrl = import.meta.env.VITE_FIREBASE_DISCOVERY_URL;
    if (!firebaseBaseUrl) {
      setError('Firebase Discovery URL not configured');
      return null;
    }

    setStatus('connecting');
    setError(null);

    try {
      const response = await fetch(`${firebaseBaseUrl.replace(/\/$/, '')}/devices/cushion-01.json`);
      if (!response.ok) throw new Error('Failed to fetch from Firebase');
      
      const data = await response.json();
      if (!data || !data.local_ip) throw new Error('No Fog Node found on Cloud');

      let targetIp = data.local_ip;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        targetIp = 'localhost';
      }

      const localWsUrl = targetIp.startsWith('ws') ? targetIp : `ws://${targetIp}:8765`;
      
      console.log('Discovery: Connecting to:', localWsUrl);
      setUrl(localWsUrl);
      return localWsUrl;

    } catch (err: any) {
      setError('Smart Cushion connection failed.');
      setStatus('error');
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{
      url, setUrl, status, lastMessage, msgCount, latency, error, connect, disconnect, discover
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return ctx;
};
