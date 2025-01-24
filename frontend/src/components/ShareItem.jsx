import React, { useState } from 'react';
import axios from 'axios';

const ShareItem = ({ itemType, itemId, onShareSuccess }) => {
  const [sharedWithUserId, setSharedWithUserId] = useState('');
  const [message, setMessage] = useState('');

  const handleShare = async () => {
    if (!sharedWithUserId) {
      displayMessage('Specifica un ID utente per condividere.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/share`,
        {
          itemType,
          itemId,
          sharedWithUserId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        displayMessage('Elemento condiviso con successo!');
        onShareSuccess();
      } else {
        displayMessage(response.data.error || 'Errore durante la condivisione.');
      }
    } catch (error) {
      console.error('Errore durante la condivisione:', error);

      displayMessage(
        error.response?.data?.error || 'Errore durante la condivisione.'
      );
    }
  };

  const displayMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="share-item">
      <input
        type="text"
        placeholder="ID Utente con cui condividere"
        value={sharedWithUserId}
        onChange={(e) => setSharedWithUserId(e.target.value)}
        className="input-share"
      />
      <button onClick={handleShare} className="btn share">
        Condividi
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ShareItem;
