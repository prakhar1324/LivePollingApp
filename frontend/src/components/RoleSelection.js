import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../store/slices/userSlice';
import socketService from '../services/socketService';

const RoleSelection = ({ initialRole = 'student' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    const teacherName = selectedRole === 'teacher' ? 'Teacher' : '';
    const userData = {
      name: teacherName, // Set default name for teacher, empty for students
      role: selectedRole,
      studentId: null, // Will be set in StudentNameEntry for students
    };

    dispatch(setUser(userData));
    localStorage.setItem('pollingUser', JSON.stringify(userData));
    
    if (selectedRole === 'teacher') {
      socketService.join(teacherName, selectedRole, null);
      navigate('/teacher');
    } else {
      navigate('/student/name');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8f9fa',
    }}>
      <div className="card" style={{ width: '100%', display: 'flex',height:'100vh' }}>
        {}
        <div>
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
            Welcome to the Live Polling System
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--medium-gray)',
            lineHeight: '1.5'
          }}>
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        {}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          {}
          <div
            onClick={() => handleRoleSelect('student')}
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: selectedRole === 'student' ? '2px solid var(--primary-purple)' : '2px solid var(--light-gray)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: selectedRole === 'student' ? 'var(--light-gray)' : 'var(--white)'
            }}
          >
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              color: 'var(--black)'
            }}>
              I'm a Student
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--medium-gray)',
              lineHeight: '1.4'
            }}>
              Submit answers and view live poll results in real-time.
            </p>
          </div>

          {}
          <div
            onClick={() => handleRoleSelect('teacher')}
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: selectedRole === 'teacher' ? '2px solid var(--primary-purple)' : '2px solid var(--light-gray)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: selectedRole === 'teacher' ? 'var(--light-gray)' : 'var(--white)'
            }}
          >
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              color: 'var(--black)'
            }}>
              I'm a Teacher
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--medium-gray)',
              lineHeight: '1.4'
            }}>
              Create and manage polls, ask questions, and monitor your students' responses in real-time.
            </p>
          </div>
        </div>

        {}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleContinue}
            className="btn-primary"
            style={{ 
              padding: '16px 32px',
              fontSize: '18px',
              minWidth: '200px',
              marginBottom: '12px'
            }}
          >
            Continue
          </button>
      
        </div>
      </div>
    </div>
    </div>
  );
};

export default RoleSelection;
