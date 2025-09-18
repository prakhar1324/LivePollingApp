import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

const PollCreator = () => {
  const { isActive } = useSelector((state) => state.poll);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [isCustomTimeFinalized, setIsCustomTimeFinalized] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');

  const handleAddOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);

      const newCorrectAnswers = {};
      Object.keys(correctAnswers).forEach((key) => {
        const optionIndex = parseInt(key);
        if (optionIndex < index) {
          newCorrectAnswers[key] = correctAnswers[key];
        } else if (optionIndex > index) {
          newCorrectAnswers[optionIndex - 1] = correctAnswers[key];
        }
      });
      setCorrectAnswers(newCorrectAnswers);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index, isCorrect) => {
    setCorrectAnswers({
      ...correctAnswers,
      [index]: isCorrect,
    });
  };

  const handleCustomTimeToggle = () => {
    setShowCustomTime(true);
    setIsCustomTimeFinalized(false);
    setCustomTimeInput('');
  };

  const handleCustomTimeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomTimeInput(value);
    }
  };

  const handleCustomTimeSubmit = () => {
    if (customTimeInput !== '') {
      const minutes = parseFloat(customTimeInput);
      if (!isNaN(minutes) && minutes > 0) {
        setDuration(Math.round(minutes * 60));
        setShowCustomTime(false);
        setIsCustomTimeFinalized(true);
      }
    }
  };

  const handleCustomTimeKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomTimeSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomTime(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter((option) => option.trim());
    if (validOptions.length < 2) {
      alert('Please enter at least 2 options');
      return;
    }

    const pollData = {
      question: question.trim(),
      options: validOptions,
      duration: duration * 1000,
      correctAnswers,
    };

    socketService.createPoll(pollData);

    setQuestion('');
    setOptions(['', '']);
    setCorrectAnswers({});
    setDuration(60);
    setIsCustomTimeFinalized(false);
    setShowCustomTime(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <label
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--black)',
              }}
            >
              Enter your question
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!isCustomTimeFinalized && !showCustomTime && (
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid var(--light-gray)',
                    borderRadius: '8px',
                    background: 'var(--light-gray)',
                    fontSize: '14px',
                  }}
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>
              )}

              {isCustomTimeFinalized && !showCustomTime && (
                <span
                  style={{
                    padding: '8px 12px',
                    background: 'var(--light-gray)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--black)',
                  }}
                >
                  {duration >= 60
                    ? `${(duration / 60).toFixed(1)} min`
                    : `${duration} sec`}
                </span>
              )}

              <button
                type="button"
                onClick={handleCustomTimeToggle}
                style={{
                  padding: '8px',
                  background: showCustomTime
                    ? 'var(--primary-purple)'
                    : 'var(--light-gray)',
                  color: showCustomTime
                    ? 'var(--white)'
                    : 'var(--primary-purple)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                }}
                title="Set custom time"
              >
                <div>🕐</div>
                <div>+</div>
              </button>

              {showCustomTime && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'var(--white)',
                    border: '2px solid var(--primary-purple)',
                    borderRadius: '8px',
                  }}
                >
                  <input
                    type="text"
                    value={customTimeInput}
                    onChange={handleCustomTimeChange}
                    onKeyDown={handleCustomTimeKeyPress}
                    placeholder="2"
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '40px',
                      fontSize: '14px',
                      textAlign: 'center',
                      background: 'transparent',
                    }}
                    autoFocus
                  />
                  <span style={{ fontSize: '14px', color: 'var(--medium-gray)' }}>
                    min
                  </span>
                  <button
                    type="button"
                    onClick={handleCustomTimeSubmit}
                    style={{
                      padding: '4px 8px',
                      background: 'var(--primary-purple)',
                      color: 'var(--white)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomTime(false)}
                    style={{
                      padding: '4px 8px',
                      background: 'var(--medium-gray)',
                      color: 'var(--white)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Rahul Bajaj"
            className="input-field"
            style={{
              minHeight: '120px',
              resize: 'vertical',
              fontSize: '16px',
            }}
            maxLength={100}
            required
          />
          <div
            style={{
              textAlign: 'right',
              fontSize: '12px',
              color: 'var(--medium-gray)',
              marginTop: '4px',
            }}
          >
            {question.length}/100
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--black)',
            }}
          >
            Edit Options
          </h3>

          {options.map((option, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div className="poll-option-number" style={{ flexShrink: 0 }}>
                {index + 1}
              </div>

              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder="Rahul Bajaj"
                className="input-field"
                style={{ flex: 1 }}
                required
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '120px',
                }}
              >
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--black)',
                  }}
                >
                  Is it Correct?
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={correctAnswers[index] === true}
                      onChange={() => handleCorrectAnswerChange(index, true)}
                      style={{ accentColor: 'var(--primary-purple)' }}
                    />
                    Yes
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={correctAnswers[index] === false}
                      onChange={() => handleCorrectAnswerChange(index, false)}
                      style={{ accentColor: 'var(--primary-purple)' }}
                    />
                    No
                  </label>
                </div>
              </div>

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  style={{
                    padding: '8px',
                    background: 'var(--red)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              style={{
                padding: '12px 20px',
                background: 'var(--light-gray)',
                color: 'var(--primary-purple)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ➕ Add More option
            </button>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '16px 32px',
              fontSize: '18px',
            }}
            disabled={isActive}
          >
            Ask Question
          </button>
        </div>
      </form>
    </div>
  );
};

export default PollCreator;
