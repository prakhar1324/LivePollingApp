import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserAnswer } from '../store/slices/pollSlice';
import socketService from '../services/socketService';

const PollQuestion = () => {
  const dispatch = useDispatch();
  const { currentPoll, timeRemaining, hasAnswered } = useSelector((state) => state.poll);
  const [selectedOption, setSelectedOption] = useState(null);
  const [localTimeRemaining, setLocalTimeRemaining] = useState(timeRemaining);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeRemaining > 0) {
      console.log('PollQuestion: Setting timer with timeRemaining:', timeRemaining);
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

  const handleOptionSelect = (optionIndex) => {
    if (!hasAnswered) {
      setSelectedOption(optionIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null && !hasAnswered && !isSubmitting) {
      setIsSubmitting(true);
      dispatch(setUserAnswer(selectedOption));
      socketService.submitAnswer(selectedOption);
      
      
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }
  };

  if (!currentPoll) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: 'var(--black)',
          margin: 0
        }}>
          Question 1
        </h2>
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
      </div>

      {}
      <div style={{
        background: 'var(--primary-purple)',
        color: 'var(--white)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        {currentPoll.question}
      </div>

      {}
      <div style={{ marginBottom: '32px' }}>
        {currentPoll.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionSelect(index)}
            className={`poll-option ${selectedOption === index ? 'selected' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              margin: '12px 0',
              background: selectedOption === index ? 'var(--primary-purple)' : 'var(--light-gray)',
              borderRadius: '8px',
              cursor: hasAnswered ? 'default' : 'pointer',
              pointerEvents: hasAnswered ? 'none' : 'auto',
              transition: 'all 0.3s ease',
              border: selectedOption === index ? '2px solid var(--accent-purple)' : '2px solid transparent',
              opacity: hasAnswered ? 0.7 : 1
            }}
          >
            <div 
              className="poll-option-number"
              style={{
                background: selectedOption === index ? 'var(--white)' : 'var(--primary-purple)',
                color: selectedOption === index ? 'var(--primary-purple)' : 'var(--white)'
              }}
            >
              {index + 1}
            </div>
            <span style={{ 
              fontSize: '16px',
              fontWeight: '500',
              color: selectedOption === index ? 'var(--white)' : 'var(--black)'
            }}>
              {option}
            </span>
          </div>
        ))}
      </div>

      {}
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={handleSubmit}
          className="btn-primary"
          style={{ 
            padding: '16px 32px',
            fontSize: '18px',
            opacity: (selectedOption === null || hasAnswered || isSubmitting) ? 0.6 : 1,
            cursor: (selectedOption === null || hasAnswered || isSubmitting) ? 'not-allowed' : 'pointer'
          }}
          disabled={selectedOption === null || hasAnswered || isSubmitting}
        >
          {isSubmitting ? ' Submitting...' : hasAnswered ? ' Submitted' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default PollQuestion;
