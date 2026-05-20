import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getWsUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
  // Replace trailing /api with /ws for the handshake endpoint
  return apiUrl.replace(/\/api$/, '/ws');
};

export const useWebSocket = (topic, onMessageReceived) => {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!topic) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(getWsUrl()),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        console.log(`STOMP client connected. Subscribing to: ${topic}`);
        client.subscribe(topic, (message) => {
          if (message.body) {
            try {
              const payload = JSON.parse(message.body);
              onMessageReceived(payload);
            } catch (err) {
              console.error("Error parsing WebSocket message:", err);
            }
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
        console.log('STOMP client disconnected');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log(`STOMP client deactivated for topic: ${topic}`);
      }
    };
  }, [topic, onMessageReceived]);

  return connected;
};
