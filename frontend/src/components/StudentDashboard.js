import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/userSlice';
import { resetPoll } from '../store/slices/pollSlice';
import { toggleChat } from '../store/slices/chatSlice';
import socketService from '../services/socketService';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import PollEnded from './PollEnded';
import Chat from './Chat';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name } = useSelector((state) => state.user);
  const { currentPoll, isActive, timeRemaining } = useSelector((state) => state.poll);
  const { isOpen: chatOpen } = useSelector((state) => state.chat);

  const [localTimeRemaining, setLocalTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const resultsTimerRef = useRef(null); // useRef instead of state

  useEffect(() => {
    if (timeRemaining > 0) {
      setLocalTimeRemaining(timeRemaining);
      setShowResults(false);
      const timer = setInterval(() => {
        setLocalTimeRemaining((prev) => {
          if (prev <= 1000) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setLocalTimeRemaining(0);
    }
  }, [timeRemaining, currentPoll]);

  useEffect(() => {
    if (!isActive && currentPoll && (localTimeRemaining <= 0 || timeRemaining <= 0)) {
      console.log('Poll ended, showing results for 10 seconds');
      setShowResults(true);

      if (resultsTimerRef.current) {
        clearTimeout(resultsTimerRef.current);
      }

      resultsTimerRef.current = setTimeout(() => {
        console.log('Hiding results after 10 seconds');
        setShowResults(false);
      }, 10000);
    }

    return () => {
      if (resultsTimerRef.current) {
        clearTimeout(resultsTimerRef.current);
      }
    };
  }, [isActive, currentPoll, localTimeRemaining, timeRemaining]);

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

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
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
                marginBottom: '8px',
              }}
            >
              ⭐ Intervue Poll
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'var(--black)',
                margin: 0,
              }}
            >
              Student Dashboard
            </h1>
            <p style={{ color: 'var(--black)', margin: '4px 0 0 0' }}>
              Welcome, {name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              color: 'var(--black)',
              border: '1px solid var(--black)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>

        <div className="card" style={{ height: '60vh' }}>
          {!isActive && !showResults ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--medium-gray)',
              }}
            >
              <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
              <h2
                style={{
                  fontSize: '24px',
                  marginBottom: '12px',
                  color: 'var(--black)',
                }}
              >
                Wait for the teacher to ask questions..
              </h2>
              <p style={{ fontSize: '16px' }}>
                You'll be notified when a new poll is available
              </p>
            </div>
          ) : showResults ? (
            <PollResults />
          ) : localTimeRemaining <= 0 ? (
            <PollEnded />
          ) : (
            <PollQuestion />
          )}
        </div>

        {chatOpen && <Chat />}

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

export default StudentDashboard;
