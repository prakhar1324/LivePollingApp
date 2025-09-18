import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../store/slices/userSlice';
import socketService from '../services/socketService';

const StudentNameEntry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const studentId = uuidv4(); // Generate new ID for each student tab

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      const userData = {
        name: name.trim(),
        role: 'student',
        studentId,
      };

      console.log('Student submitting name:', { name: name.trim(), studentId });
      dispatch(setUser(userData));
      localStorage.setItem('pollingUser', JSON.stringify(userData));
      
      console.log('Calling socketService.join with:', { name: name.trim(), role: 'student', studentId });
      socketService.join(name.trim(), 'student', studentId);
      navigate('/student');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8f9fa',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        {}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
            ⭐ Intervue Poll
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: 'var(--black)'
          }}>
            Let's Get Started
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--medium-gray)',
            lineHeight: '1.5'
          }}>
            If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
          </p>
        </div>

        {}
        <form onSubmit={handleNameSubmit}>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: 'var(--black)'
            }}>
              Enter your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Bajaj"
              className="input-field"
              required
              style={{ fontSize: '16px' }}
            />
          </div>

          {}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ 
                padding: '16px 32px',
                fontSize: '18px',
                minWidth: '200px'
              }}
              disabled={!name.trim()}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentNameEntry;
