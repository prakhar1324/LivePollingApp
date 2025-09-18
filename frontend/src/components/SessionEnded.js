import React from 'react';
import { useNavigate } from 'react-router-dom';

const SessionEnded = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          🛑
        </div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: 'var(--black)',
          marginBottom: '16px'
        }}>
          Session Ended
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: 'var(--medium-gray)',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          The teacher has ended the polling session. 
          Thank you for participating!
        </p>
        
        <button
          onClick={handleGoHome}
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
          🏠 Go Home
        </button>
      </div>
    </div>
  );
};

export default SessionEnded;
