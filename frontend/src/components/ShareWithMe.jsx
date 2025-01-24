import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/sharedWithMe.css';

const SharedWithMe = () => {
  const [sharedItems, setSharedItems] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const fetchSharedItems = async () => {
    try {
      const [response1, response2] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/shared-with-me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (response1.status === 200 && response2.status === 200) {
        const data1 = response1.data;
        const data2 = response2.data;

        const combinedItems = Array.isArray(data1.sharedItems)
          ? data1.sharedItems.map(item => {
              const owner = data2.users.find(user => user.username === item.owner);
              return {
                ...item,
                owner,
                imageUrl: owner
                  ? `${process.env.REACT_APP_API_URL}/uploads/${owner.id}/${item.folderPath}/${item.encryptedName}`
                  : null,
              };
            })
          : [];

        setSharedItems(combinedItems);
        setMessage('Elementi condivisi caricati con successo!');
      } else {
        setMessage('Errore durante il recupero degli elementi condivisi.');
      }
    } catch (error) {
      console.error('Errore durante il recupero degli elementi condivisi:', error);
      setMessage('Errore durante il recupero degli elementi condivisi.');
      setSharedItems([]);
    }
  };

  useEffect(() => {
    fetchSharedItems();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const deleteSharedFile = async (fileId) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/delete-shared-file`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: { fileId },
      });

      if (response.status === 200) {
        setMessage('File condiviso eliminato con successo!');
        fetchSharedItems();
      } else {
        throw new Error('Errore durante l\'eliminazione del file.');
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione del file condiviso:', error);
      setMessage('Errore nell\'eliminazione del file condiviso.');
    }
  };

  const handleDownload = async (imageUrl, fileName) => {
    try {
      const response = await axios.get(imageUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore durante il download:', error);
      setMessage('Errore durante il download del file.');
    }
  };

  return (
    <div className="shared-container">
      {error && <p>{error}</p>}
      {message && <p className="shared-message">{message}</p>}
      {sharedItems.length === 0 ? (
        <p className="shared-empty">Non ci sono elementi condivisi al momento.</p>
      ) : (
        <ul className="shared-list">
          {sharedItems.map((item, index) => (
            <li key={index} className="shared-item">
              <div className="item-info">
                <span className="item-type">{item.type || 'Non disponibile'}</span>
                <span className="item-name">{item.fileName || 'Nome non disponibile'}</span>
                <span className="item-owner">Condiviso da: {item.owner?.username || 'Sconosciuto'}</span>
              </div>
              <div className="item-buttons">
                {item.imageUrl && (
                  <>
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn open"
                    >
                      Apri File
                    </a>
                    <button
                      className="btn download"
                      onClick={() => handleDownload(item.imageUrl, item.originalName || item.fileName)}
                    >
                      Scarica File
                    </button>
                  </>
                )}
                <button
                  className="btn delete"
                  onClick={() => deleteSharedFile(item.id)}
                >
                  Elimina
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharedWithMe;
