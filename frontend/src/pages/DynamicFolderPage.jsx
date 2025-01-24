import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar';
import ShareItem from '../components/ShareItem';
import '../css/style.css';

const DynamicFolderPage = () => {
    const { folderPath = '' } = useParams();
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const fetchFolderContents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/folder-contents`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { path: folderPath },
            });

            setFolders(response.data.folders || []);
            setFiles(response.data.files || []);
        } catch (error) {
            console.error('Errore durante il recupero del contenuto della cartella:', error);
            setMessage(error.response?.data?.error || 'Errore di rete.');
        }
    };

    useEffect(() => {
        fetchFolderContents();
    }, [folderPath]);

    const goBack = () => navigate(-1);

    const hideMessageAfterDelay = () => {
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDeleteSelected = async () => {
        for (const itemId of selectedItems) {
            const [type, ...rest] = itemId.split('-');
            const name = rest.join('-');

            try {
                const pathToDelete = folderPath ? `${folderPath}/${name}` : name;

                await axios.delete(`${process.env.REACT_APP_API_URL}/delete`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    data: { path: pathToDelete, name, isFolder: type === 'folder' },
                });
            } catch (error) {
                console.error(`Errore durante l'eliminazione di ${name}:`, error);
                setMessage(`Errore durante l'eliminazione di ${name}`);
                hideMessageAfterDelay();
                return;
            }
        }

        setSelectedItems(new Set());
        setMessage('Elementi eliminati con successo.');
        hideMessageAfterDelay();
        fetchFolderContents();
    };

    const handleCheckboxChange = (name, type) => {
        const itemId = `${type}-${name}`;
        setSelectedItems(prevSelectedItems => {
            const newSelectedItems = new Set(prevSelectedItems);
            newSelectedItems.has(itemId) ? newSelectedItems.delete(itemId) : newSelectedItems.add(itemId);
            return newSelectedItems;
        });
    };

    const downloadQRCode = async (fileName) => {
        const qrCodeUrl = `${process.env.REACT_APP_API_URL}/files/${encodeURIComponent(folderPath)}/${encodeURIComponent(fileName)}/qr`;
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(qrCodeUrl, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}-qr.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Errore durante il download del QR:', error);
            setMessage('Errore durante il download del QR.');
            hideMessageAfterDelay();
        }
    };

    const getOriginalFileName = (encryptedName) => encryptedName.split('-').slice(1).join('-');

    return (
        <div>
            <Navbar selectedItemsCount={selectedItems.size} handleDeleteSelected={handleDeleteSelected} />
            <div className="dynamicLayout">
                <Sidebar fetchFolders={fetchFolderContents} fetchFiles={fetchFolderContents} currentFolderPath={folderPath} />
                <div className="contentArea">
                    <h2>/{folderPath}</h2>
                    {message && <p className="message">{message}</p>}
                    <button onClick={goBack}>Indietro</button>

                    <h3 className="section-title">LE TUE CARTELLE:</h3>
                    {folders.length > 0 ? (
                        <ul className="item-list">
                            {folders.map(folder => (
                                <li key={folder} className="item-card">
                                    <div className="item-details">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(`folder-${folder}`)}
                                            onChange={() => handleCheckboxChange(folder, 'folder')}
                                        />
                                        <Link to={`/folder-contents/${encodeURIComponent(folderPath ? `${folderPath}/${folder}` : folder)}`} className="item-link">
                                            {folder}
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nessuna cartella.</p>
                    )}

                    <h3 className="section-title">I TUOI FILES:</h3>
                    {files.length > 0 ? (
                        <ul className="item-list">
                            {files.map(file => (
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
                                                fetchFolderContents();
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nessun file.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DynamicFolderPage;
