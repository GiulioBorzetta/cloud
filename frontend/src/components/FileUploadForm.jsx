import React, { useState } from 'react';
import axios from 'axios';
import '../css/fileupload.css';

const FileUploadForm = ({ folderName = '/', onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage('Seleziona un file per caricare.');
      setIsError(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Token mancante. Effettua il login.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const encodedFolderName = encodeURIComponent(folderName);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload/${encodedFolderName}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setIsError(false);
        if (onFileUpload) onFileUpload();
        setSelectedFile(null);
      } else {
        setMessage(response.data.error || 'Errore durante il caricamento del file.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Errore durante il caricamento del file:', error);
      setMessage(
        error.response?.data?.error || 'Errore di rete o problema del server.'
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          id="file-input"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          disabled={loading}
          aria-label="Seleziona un file da caricare"
        />
        <label htmlFor="file-input">Seleziona File</label>
        {selectedFile && <p className="file-name">{selectedFile.name}</p>}
        <button type="submit" disabled={loading} className="btn upload">
          {loading ? 'Caricamento...' : 'Carica'}
        </button>
      </form>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}
    </div>
  );
};

export default FileUploadForm;
