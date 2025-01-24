import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar';
import ShareItem from '../components/ShareItem';
import SharedWithMe from '../components/ShareWithMe';
import '../css/style.css';

const Home = () => {
    const { folderName } = useParams();
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [message, setMessage] = useState('');
    const [sharedFiles, setSharedFiles] = useState([]);

    const fetchHomeContents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/folder-contents`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setFolders(response.data.folders || []);
            setFiles(response.data.files || []);
        } catch (error) {
            console.error('Errore durante il recupero dei contenuti:', error);
            setMessage(error.response?.data?.error || 'Errore durante il recupero dei contenuti.');
        }
    };

    useEffect(() => {
        fetchHomeContents();
    }, [folderName]);

    const handleDeleteSelected = async () => {
        for (let uniqueId of selectedItems) {
            const [type, itemId] = uniqueId.split('-');

            try {
                if (type === 'file') {
                    const file = files.find(f => `file-${f.encryptedName}` === uniqueId);

                    if (!file) {
                        console.error('File non trovato nella lista locale:', uniqueId);
                        setMessage('Errore: File non trovato.');
                        continue;
                    }
                    await handleDeleteFile(`${file.folderPath ? file.folderPath : ''}/${file.encryptedName}`);
                } else if (type === 'folder') {
                    await handleDeleteFolder(itemId);
                }
            } catch (error) {
                console.error(`Errore durante l'eliminazione di ${uniqueId}:`, error);
                setMessage('Errore durante l\'eliminazione di uno o più elementi.');
            }
        }

        setMessage('Elementi selezionati eliminati con successo!');
        setTimeout(() => setMessage(''), 3000);
        setSelectedItems(new Set());
        fetchHomeContents();
    };

    const handleDeleteFile = async (filePathToDelete) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/delete`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                data: {
                    path: filePathToDelete,
                    name: filePathToDelete.split('/').pop(),
                    isFolder: false,
                },
            });

            if (response.status === 200) {
                fetchHomeContents();
            } else {
                setMessage('Errore durante l\'eliminazione del file.');
            }
        } catch (error) {
            console.error('Errore durante l\'eliminazione del file:', error);
            setMessage('Errore durante l\'eliminazione del file.');
        }
    };

    const handleDeleteFolder = async (folderName) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/delete`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                data: {
                    path: `/${folderName}`,
                    name: folderName,
                    isFolder: true,
                },
            });

            if (response.status === 200) {
                fetchHomeContents();
            } else {
                setMessage('Errore durante l\'eliminazione della cartella.');
            }
        } catch (error) {
            console.error('Errore durante l\'eliminazione della cartella:', error);
            setMessage('Errore durante l\'eliminazione della cartella.');
        }
    };

    const handleCheckboxChange = (itemId, type) => {
        const prefix = type === 'folder' ? 'folder-' : 'file-';
        const uniqueId = `${prefix}${itemId}`;

        setSelectedItems(prevSelectedItems => {
            const newSelectedItems = new Set(prevSelectedItems);
            newSelectedItems.has(uniqueId) ? newSelectedItems.delete(uniqueId) : newSelectedItems.add(uniqueId);
            return newSelectedItems;
        });
    };

    const downloadQRCode = async (fileName) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/shared-files/${encodeURIComponent(fileName)}/qr`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}_qr.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Errore durante il download del QR code:', error);
            setMessage('Errore durante il download del QR code.');
        }
    };

    useEffect(() => {
        const fetchSharedFiles = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/shared-with-me`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                setSharedFiles(response.data.files || []);
            } catch (error) {
                console.error('Errore durante il recupero dei file condivisi:', error);
                setMessage(error.response?.data?.error || 'Errore durante il recupero dei file condivisi.');
            }
        };

        fetchSharedFiles();
    }, []);

    const openSharedFile = async (fileId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/shared-files/${fileId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'shared_file.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Errore durante l\'apertura del file condiviso:', error);
            setMessage('Errore durante l\'apertura del file condiviso.');
        }
    };

    const getOriginalFileName = (encryptedName) => {
        const parts = encryptedName.split('-');
        return parts.length > 1 ? parts.slice(1).join('-') : encryptedName;
    };

    return (
        <>
            <Navbar selectedItemsCount={selectedItems.size} handleDeleteSelected={handleDeleteSelected} />
            <div className="home-container">
                <div className="dynamicLayout">
                    <Sidebar fetchFolders={fetchHomeContents} fetchFiles={fetchHomeContents} />
                    <div className="contentArea">
                        {message && <p className="message">{message}</p>}

                        {/* Sezione Cartelle */}
                        <h3 className="section-title">Le Tue Cartelle</h3>
                        {folders.length > 0 ? (
                            <ul className="item-list">
                                {folders.map((folder, index) => (
                                    <li key={index} className="item-card">
                                        <div className="item-details">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.has(`folder-${folder}`)}
                                                onChange={() => handleCheckboxChange(folder, 'folder')}
                                            />
                                            <Link to={`/folder-contents/${encodeURIComponent(folder)}`} className="item-link">
                                                {folder}
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-message">Non ci sono cartelle da visualizzare.</p>
                        )}

                        {/* Sezione File */}
                        <h3 className="section-title">I Tuoi Files</h3>
                        {files.length > 0 ? (
                            <ul className="item-list">
                                {files.map((file) => (
                                    <li key={file.encryptedName} className="item-card">
                                        <div className="item-details">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.has(`file-${file.encryptedName}`)}
                                                onChange={() => handleCheckboxChange(file.encryptedName, 'file')}
                                            />
                                            <span className="item-name">{getOriginalFileName(file.encryptedName)}</span>
                                        </div>
                                        <div className="item-actions">
                                            <ShareItem
                                                itemType="file"
                                                itemId={file.encryptedName}
                                                onShareSuccess={() => {
                                                    fetchHomeContents();
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-message">Non ci sono file da visualizzare.</p>
                        )}

                        {/* Sezione SharedWithMe */}
                        <h3 className="section-title">File Condivisi con Me</h3>
                        <SharedWithMe />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
