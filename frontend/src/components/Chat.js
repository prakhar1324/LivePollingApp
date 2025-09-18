import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab, setChatOpen } from '../store/slices/chatSlice';
import socketService from '../services/socketService';

const Chat = () => {
  const dispatch = useDispatch();
  const { messages, activeTab, participants } = useSelector((state) => state.chat);
  const { name, role } = useSelector((state) => state.user);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const interval = setInterval(() => {
      
      if (!socketService.socket || !socketService.socket.connected) {
        if (reconnectAttempts < maxReconnectAttempts) {
          console.log(`Chat: Socket disconnected, reconnecting... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          socketService.connect();
          
          const userData = JSON.parse(localStorage.getItem('pollingUser') || '{}');
          if (userData.name && userData.role) {
            socketService.join(userData.name, userData.role, userData.studentId);
          }
          reconnectAttempts++;
        }
      } else {
        
        reconnectAttempts = 0;
      }
    }, 10000); 

    return () => clearInterval(interval);
  }, []);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.sendChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };


  const handleCloseChat = () => {
    dispatch(setChatOpen(false));
  };

  const handleRemoveStudent = (studentId) => {
    if (role === 'teacher') {
      socketService.removeStudent(studentId);
    }
  };

  return (
    <div className="chat-container">
      {}
      <div className="chat-header">
        <div className="chat-tabs">
          <button
            className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabChange('chat')}
          >
            Chat
          </button>
          <button
            className={`chat-tab ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => handleTabChange('participants')}
          >
            Participants
          </button>
        </div>
        <button
          onClick={handleCloseChat}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'var(--medium-gray)'
          }}
        >
          ✕
        </button>
      </div>

      {}
      {activeTab === 'chat' ? (
        <>
          {}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'var(--medium-gray)',
                padding: '20px'
              }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages
                .filter((message) => message && message.id) 
                .map((message, index) => (
                  <div
                    key={message.id || `message-${index}-${message.timestamp}`}
                    className={`chat-message ${
                      message.user === name ? 'own' : 'other'
                    }`}
                  >
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.7,
                      marginBottom: '4px'
                    }}>
                      {message.user}
                    </div>
                    <div>{message.message}</div>
                  </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {}
          <form onSubmit={handleSendMessage} className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1 }}
            />
            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        
        <div style={{ padding: '16px', flex: 1, overflow: 'auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--light-gray)'
          }}>
            <span style={{ fontWeight: 'bold' }}>Name</span>
            {role === 'teacher' && <span style={{ fontWeight: 'bold' }}>Action</span>}
          </div>
          
          
          {participants
            .filter(user => user.role === 'student')
            .map((user) => (
              <div
                key={user.studentId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--light-gray)'
                }}
              >
                <span style={{ color: 'var(--black)' }}>{user.name}</span>
                {role === 'teacher' && (
                  <button
                    onClick={() => handleRemoveStudent(user.studentId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Kick out
                  </button>
                )}
              </div>
            ))}
          
          {participants.filter(user => user.role === 'student').length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--medium-gray)',
              padding: '20px'
            }}>
              No students connected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
