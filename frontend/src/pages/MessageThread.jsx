import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMessagingStore from '../store/messagingStore';
import useAuthStore from '../store/authStore';

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>{part}</a> : part
  );
}

function MessageThread() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { currentMessages, fetchMessages, sendMessage, loading } = useMessagingStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages(parseInt(id));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(parseInt(id), input);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #dee2e6', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('/inbox')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>&larr;</button>
        <h2 style={{ margin: 0 }}>Conversation</h2>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {loading && currentMessages.length === 0 && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading...</p>}
        {currentMessages.map(msg => {
          const isOwn = msg.sender_id === user?.id;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
              <div style={{ ...msgBubble, backgroundColor: isOwn ? '#3498db' : '#f0f0f0', color: isOwn ? 'white' : '#2c3e50' }}>
                {!isOwn && <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '12px' }}>{msg.sender_username}</p>}
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{linkify(msg.content)}</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', opacity: 0.7 }}>{new Date(msg.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Compose */}
      <form onSubmit={handleSend} style={{ padding: '12px 20px', borderTop: '1px solid #dee2e6', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '14px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}

const msgBubble = { maxWidth: '70%', padding: '10px 14px', borderRadius: '16px', fontSize: '14px' };

export default MessageThread;
