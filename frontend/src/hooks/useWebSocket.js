import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const useWebSocket = (topicUrl, onMessageReceived) => {
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Connect using native WebSockets (bypasses SockJS wrapper requirements in StompJS v7+)
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws/websocket',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);
      if (topicUrl) {
        client.subscribe(topicUrl, (message) => {
          if (message.body) {
            const parsed = JSON.parse(message.body);
            onMessageReceived(parsed);
          }
        });
      }
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [topicUrl]);

  const sendMessage = (destination, body) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('Cannot send message, WebSocket is not connected.');
    }
  };

  return { connected, sendMessage };
};

export default useWebSocket;
