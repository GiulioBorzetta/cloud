import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

const useAccountLock = (maxAttempts) => {
  const [isLocked, setIsLocked] = useState(() => JSON.parse(localStorage.getItem('isLocked')) || false);
  const [unlockTime, setUnlockTime] = useState(() => parseInt(localStorage.getItem('unlockTime')) || null);
  const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem('attempts')) || 0);

  useEffect(() => {
    if (isLocked && unlockTime) {
      const interval = setInterval(() => {
        const remainingTime = unlockTime - Date.now();

        if (remainingTime <= 0) {
          setIsLocked(false);
          setAttempts(0);
          localStorage.removeItem('isLocked');
          localStorage.removeItem('attempts');
          localStorage.removeItem('unlockTime');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, unlockTime]);

  const incrementAttempts = useCallback(() => {
    setAttempts((prev) => {
      const newAttempts = prev + 1;
      localStorage.setItem('attempts', newAttempts);

      if (newAttempts >= maxAttempts) {
        const lockTime = Date.now() + 3 * 60 * 1000;
        setIsLocked(true);
        setUnlockTime(lockTime);
        localStorage.setItem('isLocked', true);
        localStorage.setItem('unlockTime', lockTime);
      }
      return newAttempts;
    });
  }, [maxAttempts]);

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    setIsLocked(false);
    setUnlockTime(null);
    localStorage.removeItem('attempts');
    localStorage.removeItem('isLocked');
    localStorage.removeItem('unlockTime');
  }, []);

  return { isLocked, unlockTime, attempts, incrementAttempts, resetAttempts };
};

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [welcomePopup, setWelcomePopup] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const MAX_ATTEMPTS = 5;
  const { isLocked, unlockTime, attempts, incrementAttempts, resetAttempts } = useAccountLock(MAX_ATTEMPTS);

  const handleAuth = useCallback(async () => {
    if (isLocked) {
      const remainingTime = Math.ceil((unlockTime - Date.now()) / 1000);
      setMessage(`Account bloccato. Riprova tra ${remainingTime} secondi.`);
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      const endpoint = isRegistering ? 'register' : 'login';
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/${endpoint}`, {
        username,
        password,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setMessage(response.data.message);

      if (!isRegistering) {
        const { token, role } = response.data;
        if (!token) throw new Error('Token non ricevuto durante il login');

        // Reset dei tentativi al successo del login
        resetAttempts();

        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        setWelcomePopup(`Ciao, ${username}!`);
        setTimeout(() => {
          setWelcomePopup('');
          navigate(role === 'admin' ? '/admin/dashboard' : '/home');
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Errore durante l\'operazione';
      setMessage(errorMessage);
      incrementAttempts();
    } finally {
      setIsLoading(false);
    }
  }, [isRegistering, username, password, isLocked, unlockTime, navigate, incrementAttempts, resetAttempts]);

  const getAttemptsClass = () => {
    if (attempts >= MAX_ATTEMPTS - 1) return 'auth-attempts critical';
    if (attempts <= 1) return 'auth-attempts safe';
    return 'auth-attempts';
  };

  return (
    <div data-testid="app-container" className="auth-container">
      <h1>{isRegistering ? 'Registrazione' : 'Login'}</h1>

      <div className="form-container">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
          disabled={isLocked || isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          disabled={isLocked || isLoading}
        />
        <button onClick={handleAuth} className="auth-button" disabled={isLocked || isLoading}>
          {isRegistering ? 'Registrati' : 'Login'}
        </button>
        <p className="auth-toggle" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering
            ? 'Hai già un account? Accedi qui'
            : 'Non hai un account? Registrati qui'}
        </p>
      </div>

      {message && <p className="auth-message">{message}</p>}

      {welcomePopup && (
        <div className="welcome-popup">
          <p>{welcomePopup}</p>
        </div>
      )}

      {isLoading && <p className="loading-message">Caricamento...</p>}

      {!isRegistering && !isLocked && (
        <p className={getAttemptsClass()}>
          Tentativi rimanenti: {MAX_ATTEMPTS - attempts}
        </p>
      )}
    </div>
  );
};

export default App;
