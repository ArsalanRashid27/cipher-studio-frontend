// src/Auth.js (New Attractive UI)
import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // Wahi CSS file use hogi, hum bas use update karenge
import { FaCode } from 'react-icons/fa'; // Ek icon add karte hain

// Backend auth URLs
const AUTH_API_URL = "http://localhost:5000/api/auth";

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    const url = isRegistering ? `${AUTH_API_URL}/register` : `${AUTH_API_URL}/login`;

    try {
      const response = await axios.post(url, { username, password });

      if (isRegistering) {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
      } else {
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        onLoginSuccess(token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* --- Left Side (Branding) --- */}
        <div className="auth-branding">
          <FaCode size={50} className="auth-logo" />
          <h1 className="auth-title">CipherStudio</h1>
          <p className="auth-subtitle">Your React IDE in the Cloud 🚀</p>
        </div>

        {/* --- Right Side (Form) --- */}
        <div className="auth-box">
          <form onSubmit={handleSubmit}>
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back!'}</h2>
            {error && <p className="auth-error">{error}</p>}
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-button">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="toggle-auth-button"
          >
            {isRegistering
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;