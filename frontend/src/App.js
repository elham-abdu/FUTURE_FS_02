import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LeadDetail from './components/LeadDetail';
import PublicForm from './components/PublicForm';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Form - No login required */}
          <Route path="/" element={<PublicForm />} />
          
          {/* Login Page */}
          <Route path="/login" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            isAuthenticated ? 
            <Dashboard token={token} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } />
          
          <Route path="/lead/:id" element={
            isAuthenticated ? 
            <LeadDetail token={token} /> : 
            <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;