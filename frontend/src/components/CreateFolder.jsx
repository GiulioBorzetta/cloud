import React, { useState } from 'react';
import axios from 'axios';
import '../css/createfolder.css';

const CreateFolder = ({ parentPath, onFolderCreated }) => {
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName) {
      setMessage('Il nome della cartella è obbligatorio.');
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/create-folder`,
        {
          name: folderName,
          parentPath,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsError(false);

        if (onFolderCreated) {
          onFolderCreated();
        }
      } else {
        setMessage(
          <p className="error">{response.data?.error || 'Errore durante la creazione della cartella.'}</p>
        );
        setIsError(true);
      }
    } catch (error) {
      console.error('Errore durante la creazione della cartella:', error);

      setMessage(
        <p className="error">
          {error.response?.data?.error || 'Errore di rete o problema del server.'}
        </p>
      );
      setIsError(true);
    } finally {
      setFolderName('');
    }
  };

  return (
    <div className="create-folder">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Nome della cartella"
          required
        />
        <button type="submit" className="btn create">Crea</button>
      </form>
      {message && <span className={`message ${isError ? 'error' : 'success'}`}>{message}</span>}
    </div>
  );
};

export default CreateFolder;
