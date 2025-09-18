import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import { logout } from '../store/slices/userSlice';
import { resetPoll } from '../store/slices/pollSlice';
import { useDispatch } from 'react-redux';

const SessionResults = () => {
  const navigate = useNavigate();
  const { currentPoll, results, totalVotes } = useSelector((state) => state.poll);

  const handleGoHome = () => {
    navigate('/');
  };
  const dispatch = useDispatch();

  let RoleSelectionn = () => {
    dispatch(logout());
    dispatch(resetPoll());
    localStorage.removeItem('pollingUser');
    socketService.disconnect();
    navigate('/');
  };
  

  const calculatePercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div 
            className="gradient-bg"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '20px',
              color: 'var(--black)',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px'
            }}
          >
            🏁 Session Ended
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: 'var(--black)',
            margin: '0 0 8px 0'
          }}>
            Final Results
          </h1>
          <p style={{ 
            color: 'var(--black)',
            margin: 0
          }}>
            Thank you for using Intervue Poll!
          </p>
        </div>

        {}
        <div className="card" style={{ marginBottom: '24px' }}>
          {currentPoll && (
            <>
              {}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  color: 'var(--black)',
                  marginBottom: '12px'
                }}>
                  Question
                </h2>
                <div style={{
                  background: '#f8f9fa',
                  color: 'var(--black)',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  {currentPoll.question}
                </div>
              </div>

              {}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: 'var(--black)',
                  marginBottom: '16px'
                }}>
                  Results
                </h3>
                {currentPoll.options.map((option, index) => {
                  const votes = results[index] || 0;
                  const percentage = calculatePercentage(votes);

                  return (
                    <div key={index} style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'var(--light-gray)',
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'var(--primary-purple)',
                          opacity: 0.3,
                          transition: 'width 0.3s ease'
                        }} />
                        
                        {}
                        <div 
                          className="poll-option-number"
                          style={{
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          {index + 1}
                        </div>
                        
                        <span style={{ 
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--black)',
                          position: 'relative',
                          zIndex: 1,
                          flex: 1,
                          marginLeft: '12px'
                        }}>
                          {option}
                        </span>
                        
                        <span style={{ 
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'var(--black)',
                          position: 'relative',
                          zIndex: 1
                        }}>
                          {votes} votes ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '24px',
                color: 'var(--medium-gray)',
                fontSize: '14px',
                padding: '12px',
                background: 'var(--light-gray)',
                borderRadius: '8px'
              }}>
                <strong>Total Votes: {totalVotes}</strong>
              </div>
            </>
          )}
        </div>

        {}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={RoleSelectionn}
            className="btn-primary"
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            🏠 Start New Session
          </button>
        </div>
      </div>
    </div>
  );
};


export default SessionResults;
