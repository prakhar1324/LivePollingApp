import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/userSlice';
import { resetPoll } from '../store/slices/pollSlice';
import { toggleChat } from '../store/slices/chatSlice';
import socketService from '../services/socketService';
import PollCreator from './PollCreator';
import PollResults from './PollResults';
import PollHistory from './PollHistory';
import Chat from './Chat';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPoll, isActive } = useSelector((state) => state.poll);
  const { isOpen: chatOpen } = useSelector((state) => state.chat);
  
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    
    console.log('TeacherDashboard: Ensuring socket connection');
    if (!socketService.socket || !socketService.socket.connected) {
      console.log('TeacherDashboard: Socket not connected, reconnecting...');
      socketService.connect();
      socketService.join('Teacher', 'teacher', null);
    } else {
      console.log('TeacherDashboard: Socket already connected');
    }
    
    
    console.log('TeacherDashboard: Fetching poll history on mount');
    socketService.getPollHistory();
  }, []);

  
  useEffect(() => {
    const handleFocus = () => {
      
      if (window.location.pathname.includes('teacher')) {
        socketService.getPollHistory();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetPoll());
    localStorage.removeItem('pollingUser');
    socketService.disconnect();
    navigate('/');
  };

  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  const handleViewHistory = () => {
    console.log('TeacherDashboard: Viewing poll history');
    setShowHistory(true);
    
    socketService.getPollHistory();
  };

  const handleBackToDashboard = () => {
    setShowHistory(false);
  };

  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end the session? This will disconnect all students.')) {
      socketService.endSession();
      
      setTimeout(() => {
        navigate('/session-results');
      }, 1000);
    }
  };

  if (showHistory) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <PollHistory onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'white',
      padding: '20px',
      color: 'var(--black)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <div 
              className="gradient-bg"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '20px',
                color: 'var(--white)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}
            >
              ⭐ Intervue Poll
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              color: 'var(--black)',
              margin: 0
            }}>
              Let's <strong>Get Started</strong>
            </h1>
            <p style={{ 
              color: 'var(--black)',
              margin: '4px 0 0 0'
            }}>
               you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' , height:'40px'}}>
            <button
              onClick={handleViewHistory}
              className="btn-primary"
              style={{ 
                padding: '12px 20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '60%'
              }}
            >
              👁️ View Poll History
            </button>
            <button
              onClick={handleEndSession}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, var(--accent-red) 0%, #C0392B 100%)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)',
                width: '40%'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.3)';
              }}
            >
              End Session
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                color: 'var(--black)',
                border: '1px solid var(--black)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {}
        <div className="card" >      
          {!isActive && !currentPoll ? (
            <PollCreator />
          ) : (
            <PollResults />
          )}
        </div>

        {}
        {chatOpen && <Chat />}
        
        {}
        <button
          onClick={handleToggleChat}
          className="chat-fab"
          style={{ display: chatOpen ? 'none' : 'flex' }}
        >
          💬
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
