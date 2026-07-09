import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../services/api';

const WS_BASE = 'wss://core.geozns.com/v1/ws';
const APP_ID = 'MasGamers-movil';

export default function useWebSocket(token, enabled) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const wsRef = useRef(null);
  const pingTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const connect = useCallback(async () => {
    if (!token || !enabled) return;

    try {
      const { token: wsToken } = await api.get('/chat/ws-token');
      if (!wsToken) return;

      const url = `${WS_BASE}?token=${wsToken}&app_id=${APP_ID}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'Ping') {
            ws.send(JSON.stringify({ type: 'Pong' }));
            return;
          }
          setLastEvent(data);
        } catch {
          // ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        reconnectTimerRef.current = setTimeout(() => connect(), 5000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      reconnectTimerRef.current = setTimeout(() => connect(), 10000);
    }
  }, [token, enabled]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    };
  }, [connect]);

  return { connected, lastEvent };
}