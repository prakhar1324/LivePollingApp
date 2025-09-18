import React from 'react';
import { useNavigate } from 'react-router-dom';

const KickedOut = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/');
  };

  return (
    <div style={{  
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8f9fa',
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', textAlign: 'center' }}>
        {}
        <div style={{ marginBottom: '32px' }}>
          <div 
            className="gradient-bg"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '20px',
              color: 'var(--white)',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '24px'
            }}
          >
            ✓ Intervue Poll
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: 'var(--black)'
          }}>
            You've been Kicked out !
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--medium-gray)',
            lineHeight: '1.5'
          }}>
            Looks like the teacher had removed you from the poll system. Please Try again sometime.
          </p>
        </div>

        {}
        <div>
          <button
            onClick={handleTryAgain}
            className="btn-primary"
            style={{ 
              padding: '16px 32px',
              fontSize: '18px',
              minWidth: '200px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickedOut;
