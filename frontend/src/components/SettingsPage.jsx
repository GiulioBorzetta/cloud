import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/settings.css';

const SettingsPage = () => {
  const [colors, setColors] = useState({
    backgroundColor: '#ffffff',
    textColor: '#000000',
  });
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user-info`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.data.username) {
          setUsername(response.data.username);
        }
        if (response.data.colors) {
          setColors(response.data.colors);
          document.body.style.backgroundColor = response.data.colors.backgroundColor;
          document.body.style.color = response.data.colors.textColor;
        }
      } catch (error) {
        console.error('Errore nel recupero dei dati utente:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChangeColor = (e, key) => {
    const newColors = { ...colors, [key]: e.target.value };
    setColors(newColors);
    if (key === 'backgroundColor') {
      document.body.style.backgroundColor = e.target.value;
    } else if (key === 'textColor') {
      document.body.style.color = e.target.value;
    }
  };

  const handleSaveColors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/save-colors`,
        { colors },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setMessage('Colori salvati con successo!');
      }
    } catch (error) {
      console.error('Errore nel salvataggio dei colori:', error);
      setMessage('Errore nel salvataggio dei colori.');
    }
  };

  const handleUpdateUsername = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/update-username`,
        { newUsername },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setMessage('Nome utente aggiornato con successo!');
        setUsername(newUsername);
        setNewUsername('');
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del nome utente:', error);
      setMessage('Errore durante l\'aggiornamento del nome utente.');
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage('Inserisci sia la vecchia che la nuova password.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/update-password`,
        { oldPassword, newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setMessage('Password aggiornata con successo!');
        setOldPassword('');
        setNewPassword('');
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della password:', error);
      setMessage('Errore durante l\'aggiornamento della password.');
    }
  };

  return (
    <div className="settings-container">
      <button 
        onClick={() => navigate(-1)} 
        className="close-button"
      >
        X
      </button>
      <h3>Impostazioni</h3>

      <section className="settings-section">
        <h4>Cambia i colori della pagina</h4>
        <div className="color-picker">
          <label>Colore Sfondo:</label>
          <input 
            type="color" 
            value={colors.backgroundColor} 
            onChange={(e) => handleChangeColor(e, 'backgroundColor')} 
          />
        </div>
        <div className="color-picker">
          <label>Colore Testo:</label>
          <input 
            type="color" 
            value={colors.textColor} 
            onChange={(e) => handleChangeColor(e, 'textColor')} 
          />
        </div>
        <button onClick={handleSaveColors} className="save-button">
          Salva Colori
        </button>
      </section>

      <section className="settings-section">
        <h4>Cambia Nome Utente</h4>
        <p>Nome utente attuale: <strong>{username}</strong></p>
        <input
          type="text"
          placeholder="Nuovo Nome Utente"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="input-field"
        />
        <button onClick={handleUpdateUsername} className="save-button">
          Aggiorna Nome Utente
        </button>
      </section>

      <section className="settings-section">
        <h4>Cambia Password</h4>
        <input
          type="password"
          placeholder="Vecchia Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Nuova Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-field"
        />
        <button onClick={handleUpdatePassword} className="save-button">
          Aggiorna Password
        </button>
      </section>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default SettingsPage;
