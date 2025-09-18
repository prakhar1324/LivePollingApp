import React from 'react';

const PollEnded = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 20px',
      color: 'var(--medium-gray)'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '24px'
      }}>
        ⏰
      </div>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '12px',
        color: 'var(--black)'
      }}>
        Poll Time's Up!
      </h2>
      <p style={{ fontSize: '16px', marginBottom: '24px' }}>
        The poll has ended. Thank you for participating!
      </p>
      <div style={{
        padding: '20px',
        background: 'var(--light-gray)',
        borderRadius: '8px',
        color: 'var(--medium-gray)',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}>
          Wait for the teacher to ask a new question or end the session.
        </p>
      </div>
    </div>
  );
};

export default PollEnded;


