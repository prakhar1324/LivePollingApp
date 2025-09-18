import React from 'react';
import { useSelector } from 'react-redux';

const PollHistory = ({ onBack }) => {
  const { pollHistory } = useSelector((state) => state.poll);
  

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div>
      {}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          color: 'var(--black)',
          margin: 0
        }}>
          View Poll History
        </h1>
        <button
          onClick={onBack}
          className="btn-primary"
          style={{ 
            padding: '12px 20px',
            fontSize: '14px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {}
      <div className="card">
        {pollHistory.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: 'var(--medium-gray)'
          }}>
            <h3 style={{ 
              fontSize: '24px', 
              marginBottom: '12px',
              color: 'var(--black)'
            }}>
              No Poll History
            </h3>
            <p style={{ fontSize: '16px' }}>
              Create your first poll to see the history here
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto', width: '100%' }}>
            {pollHistory.map((poll, pollIndex) => (
              <div key={poll._id || pollIndex} style={{ 
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: pollIndex < pollHistory.length - 1 ? '1px solid var(--light-gray)' : 'none'
              }}>
                {}
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  color: 'var(--black)'
                }}>
                  Question {pollIndex + 1}
                </h3>
                
                <div style={{
                  background: 'var(--primary-purple)',
                  color: 'var(--white)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  {poll.question}
                </div>

                {}
                <div>
                  {poll.options.map((option, optionIndex) => {
                    const votes = poll.results[optionIndex] || 0;
                    const percentage = calculatePercentage(votes, poll.totalVotes);

                    return (
                      <div key={optionIndex} style={{ marginBottom: '12px' }}>
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
                            {optionIndex + 1}
                          </div>
                          
                          <span style={{ 
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'var(--black)',
                            position: 'relative',
                            zIndex: 1,
                            flex: 1
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
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--medium-gray)'
                }}>
                  <span>Total Votes: {poll.totalVotes}</span>
                  <span>
                    {new Date(poll.createdAt).toLocaleDateString()} at{' '}
                    {new Date(poll.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollHistory;
