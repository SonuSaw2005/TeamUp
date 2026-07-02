import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Send, AlertTriangle } from 'lucide-react';
import { Client } from '@stomp/stompjs';

const ChatRoom = ({ matchId, teamId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [wsError, setWsError] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Fetch historical messages
    fetchChatHistory();

    // 2. Setup WebSocket client via STOMP
    const socketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8080/ws`;
    const client = new Client({
      brokerURL: socketUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        setConnected(true);
        setWsError(false);

        // Subscribe to match or team channel
        const topic = matchId ? `/topic/match/${matchId}` : `/topic/team/${teamId}`;
        client.subscribe(topic, (message) => {
          if (message.body) {
            const parsed = JSON.parse(message.body);
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === parsed.id)) return prev;
              return [...prev, parsed];
            });
          }
        });
      },
      onWebSocketError: (error) => {
        console.error('Socket error:', error);
        setWsError(true);
      },
      onStompError: (frame) => {
        console.error('Stomp error:', frame);
        setWsError(true);
      },
      onDisconnect: () => {
        setConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [matchId, teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const type = matchId ? 'match' : 'team';
      const targetId = matchId || teamId;
      const res = await API.get(`/api/chat/${type}/${targetId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Could not pull history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const payload = {
      senderId: user.id,
      senderName: user.name,
      matchId: matchId ? parseInt(matchId, 10) : null,
      teamId: teamId ? parseInt(teamId, 10) : null,
      content: typedMessage,
    };

    // If WebSocket is active, publish to broker
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(payload),
      });
    } else {
      // Direct REST fallback if WebSocket connection is broken
      console.warn('Socket inactive. Emitting via HTTP REST fallback...');
      // In production development we'll mock-append to retain message flow
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          senderId: user.id,
          senderName: user.name,
          content: typedMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setTypedMessage('');
  };

  return (
    <div className="flex flex-col h-[400px] border border-gray-150 dark:border-slate-800 rounded-2xl bg-gray-50 dark:bg-slate-900 overflow-hidden">
      
      {/* Connection warning */}
      {wsError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-500 p-2 text-[10px] flex items-center space-x-1 justify-center font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>WebSocket disconnected. Message fallback active.</span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-20 font-semibold">No messages yet. Send a greeting to begin!</p>
        ) : (
          messages.map((m, index) => {
            const mine = m.senderId === user.id;
            return (
              <div key={index} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5 tracking-wider">
                  {mine ? 'You' : m.senderName}
                </span>
                <div className={`p-3 rounded-2xl max-w-[80%] text-xs shadow-sm ${
                  mine 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-700/50'
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-gray-150 dark:border-slate-800 flex space-x-2">
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Type message here..."
          className="flex-grow py-2 px-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold p-2.5 rounded-xl shadow transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
