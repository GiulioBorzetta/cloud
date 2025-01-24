import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateFolder from './CreateFolder';
import FileUploadForm from './FileUploadForm';
import '../css/sidebar.css';

const Sidebar = ({ fetchFolders, fetchFiles, currentFolderPath }) => {
  const [userInfo, setUserInfo] = useState({ username: '', id: '' });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setUserInfo({ username: 'Sconosciuto', id: 'N/A' });
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user-info`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = response.data;

        if (!data.username || !data.id) {
          throw new Error('Dati utente incompleti');
        }

        setUserInfo({
          username: data.username,
          id: data.id,
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserInfo({ username: 'Sconosciuto', id: 'N/A' });
      }
    };

    fetchUserInfo();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleFolderCreated = () => {
    showMessage('Cartella creata con successo!');
    if (fetchFolders) fetchFolders();
  };

  const handleFileUploaded = () => {
    showMessage('File caricato con successo!');
    if (fetchFiles) fetchFiles();
  };

  return (
    <>
      {!isDesktop && (
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      )}

      {!isDesktop && isSidebarOpen && (
        <div className="overlay active" onClick={toggleSidebar}></div>
      )}

      <div className={`sidebar ${isDesktop || isSidebarOpen ? 'open' : 'hidden'}`}>
        <h1 className="cloud">CLOUD</h1>
        <hr />

        <div className="user-info">
          <p>
            <strong>Utente:</strong> {userInfo.username}
          </p>
          <p>
            <strong>ID:</strong> {userInfo.id}
          </p>
        </div>

        <hr />
        <div className="sidebar-section">
          <h3>Crea Cartella</h3>
          <CreateFolder
            parentPath={currentFolderPath}
            onFolderCreated={handleFolderCreated}
          />
        </div>
        <hr />
        <div className="sidebar-section">
          <h3>Carica File</h3>
          <FileUploadForm
            folderName={currentFolderPath}
            onFileUpload={handleFileUploaded}
          />
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </>
  );
};

export default Sidebar;
