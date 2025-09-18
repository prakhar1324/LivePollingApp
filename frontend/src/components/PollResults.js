import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetPoll, setUserAnswer } from '../store/slices/pollSlice';
import socketService from '../services/socketService';

const PollResults = () => {
  const dispatch = useDispatch();
  const { currentPoll, results, totalVotes, userAnswer, hasAnswered, isActive, timeRemaining } = useSelector((state) => state.poll);
  const { role } = useSelector((state) => state.user);
  const [selectedOption, setSelectedOption] = useState(null);
  const [localTimeRemaining, setLocalTimeRemaining] = useState(timeRemaining);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeRemaining > 0) {
      console.log('PollResults: Setting timer with timeRemaining:', timeRemaining);
      setLocalTimeRemaining(timeRemaining);
      const timer = setInterval(() => {
        setLocalTimeRemaining(prev => {
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

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAskNewQuestion = () => {
    dispatch(resetPoll());
    
  };


  const handleOptionSelect = (optionIndex) => {
    
    if (role === 'student' && isActive && !hasAnswered) {
      setSelectedOption(optionIndex);
    }
  };

  const handleSubmitVote = () => {
    if (selectedOption !== null && role === 'student' && !hasAnswered && isActive && !isSubmitting) {
      setIsSubmitting(true);
      dispatch(setUserAnswer(selectedOption));
      socketService.submitAnswer(selectedOption);
      
      
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }
  };

  const calculatePercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  if (!currentPoll) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div>
      {}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: 'var(--black)',
            margin: 0
          }}>
            Question
          </h2>
          {}
          {role === 'student' && isActive && localTimeRemaining > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: 'var(--red)',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🕐 {formatTime(localTimeRemaining)}
            </div>
          )}
        </div>
        <div style={{
          background: 'var(--primary-purple)',
          color: 'var(--white)',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          {currentPoll.question}
        </div>
      </div>

      {}
      <div style={{ marginBottom: '32px' }}>
        {currentPoll.options.map((option, index) => {
          const votes = results[index] || 0;
          const percentage = calculatePercentage(votes);
          const isUserAnswer = userAnswer === index;
          const isSelected = selectedOption === index;
          const isClickable = role === 'student' && !hasAnswered && isActive;
          
          
          
          const shouldShowResults = role === 'teacher' || (!isActive && localTimeRemaining <= 0);

          return (
            <div key={index} style={{ marginBottom: '16px' }}>
              <div 
                onClick={() => handleOptionSelect(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: isUserAnswer ? 'var(--primary-purple)' : 
                             isSelected ? 'var(--primary-purple)' : 'var(--light-gray)',
                  borderRadius: '8px',
                  border: isUserAnswer ? '2px solid var(--accent-purple)' : 
                         isSelected ? '2px solid var(--accent-purple)' : '2px solid transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isClickable ? 'pointer' : 'default',
                  pointerEvents: (role === 'student' && hasAnswered) ? 'none' : 'auto',
                  transition: 'all 0.3s ease',
                  opacity: (role === 'student' && hasAnswered) ? 0.7 : 1
                }}
              >
                {}
                {shouldShowResults && (
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
                )}
                
                {}
                <div 
                  className="poll-option-number"
                  style={{
                    background: (isUserAnswer || isSelected) ? 'var(--white)' : 'var(--primary-purple)',
                    color: (isUserAnswer || isSelected) ? 'var(--primary-purple)' : 'var(--white)',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {index + 1}
                </div>
                
                <span style={{ 
                  fontSize: '16px',
                  fontWeight: '500',
                  color: (isUserAnswer || isSelected) ? 'var(--white)' : 'var(--black)',
                  position: 'relative',
                  zIndex: 1,
                  flex: 1
                }}>
                  {option}
                </span>
                
                {}
                {shouldShowResults && (
                  <span style={{ 
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: (isUserAnswer || isSelected) ? 'var(--white)' : 'var(--black)',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {percentage}%
                  </span>
                )}
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
        fontSize: '14px'
      }}>
        {}
        {(role === 'teacher' || (!isActive && localTimeRemaining <= 0)) && (
          <div>Total Votes: {totalVotes}</div>
        )}
        {role === 'student' && !hasAnswered && isActive && (
          <div style={{ 
            marginTop: '8px',
            padding: '8px 16px',
            background: 'var(--light-gray)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--medium-gray)'
          }}>
            💡 You can still vote! Click on an option above.
          </div>
        )}
        {role === 'student' && isActive && localTimeRemaining > 0 && (
          <div style={{ 
            padding: '12px 20px',
            background: 'var(--light-gray)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--medium-gray)'
          }}>
            🔒 Results will be shown when the poll ends
          </div>
        )}
      </div>

      {}
      {role === 'student' && !hasAnswered && isActive && selectedOption !== null && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            onClick={handleSubmitVote}
            className="btn-primary"
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? '⏳ Submitting...' : ' Submit Vote'}
          </button>
        </div>
      )}

      {}
      {role === 'student' && hasAnswered && isActive && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '24px',
          padding: '12px 20px',
          background: '#d4edda',
          borderRadius: '8px',
          color: '#155724',
          fontSize: '16px',
          fontWeight: '500'
        }}>
           Your answer has been submitted! Results will be shown when the poll ends.
        </div>
      )}

      {}
      {role === 'teacher' ? (
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleAskNewQuestion}
            className="btn-primary"
            style={{ 
              padding: '16px 32px',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ➕ Ask a new question
          </button>
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center',
          padding: '20px',
          background: 'var(--light-gray)',
          borderRadius: '8px',
          color: 'var(--medium-gray)'
        }}>
          <p style={{ fontSize: '16px', margin: 0 }}>
            Wait for the teacher to ask a new question..
          </p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
