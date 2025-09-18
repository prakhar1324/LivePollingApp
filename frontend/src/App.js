import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import RoleSelection from './components/RoleSelection';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentNameEntry from './components/StudentNameEntry';
import KickedOut from './components/KickedOut';
import SessionEnded from './components/SessionEnded';
import SessionResults from './components/SessionResults';
import { setUser } from './store/slices/userSlice';
import socketService from './services/socketService';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, role } = useSelector((state) => state.user);

  useEffect(() => {
    
    if (location.pathname === '/teacher' || location.pathname === '/student') {
      const storedUser = localStorage.getItem('pollingUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        if ((location.pathname === '/teacher' && userData.role === 'teacher') ||
            (location.pathname === '/student' && userData.role === 'student')) {
          dispatch(setUser(userData));
          socketService.join(userData.name, userData.role, userData.studentId);
        }
      }
    }
  }, [dispatch, location.pathname]);

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={<RoleSelection />}
        />
        <Route 
          path="/teacher" 
          element={
            isAuthenticated && role === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <RoleSelection initialRole="teacher" />
            )
          } 
        />
        <Route 
          path="/student" 
          element={
            isAuthenticated && role === 'student' ? (
              <StudentDashboard />
            ) : (
              <RoleSelection initialRole="student" />
            )
          } 
        />
        <Route 
          path="/student/name" 
          element={
            isAuthenticated && role === 'student' ? (
              <StudentNameEntry />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="/kicked-out" element={<KickedOut />} />
        <Route path="/session-ended" element={<SessionEnded />} />
        <Route path="/session-results" element={<SessionResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
