import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/adminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
          'Content-Type': 'application/json',
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Errore durante il recupero degli utenti:', error.response?.data || error.message);
        setMessage('Errore durante il recupero degli utenti.');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const updatePassword = async () => {
    if (!newPassword.trim()) {
      setMessage('La nuova password è obbligatoria.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/update-password/${selectedUserId}`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', } },
      );
      setMessage('Password aggiornata con successo.');
      setSelectedUserId(null);
      setNewPassword('');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della password:', error.response?.data || error.message);
      setMessage('Errore durante l\'aggiornamento della password.');
    }
  };

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/admin/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        'Content-Type': 'application/json',
      });
      setMessage('Utente eliminato con successo.');
      setConfirmDelete(null);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'utente:', error.response?.data || error.message);
      setMessage('Errore durante l\'eliminazione dell\'utente.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Dashboard Admin</h1>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>

      {message && <p className="message">{message}</p>}

      {users.length === 0 ? (
        <p>Non ci sono utenti da visualizzare.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Ruolo</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    onClick={() => setSelectedUserId(user.id)}
                    className="update-password-button"
                  >
                    Modifica Password
                  </button>
                  <button
                    onClick={() => setConfirmDelete(user)}
                    className="delete-user-button"
                  >
                    Elimina Utente
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUserId && (
        <div className="update-password-container">
          <h3>Modifica Password per l'Utente {selectedUserId}</h3>
          <input
            type="password"
            placeholder="Nuova Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="update-password-input"
          />
          <button onClick={updatePassword} className="save-password-button">
            Salva
          </button>
          <button onClick={() => setSelectedUserId(null)} className="cancel-button">
            Annulla
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="confirm-delete-container">
          <h3>Sei sicuro di voler eliminare l'utente "{confirmDelete.username}"?</h3>
          <button
            onClick={() => deleteUser(confirmDelete.id)}
            className="confirm-button"
          >
            Conferma
          </button>
          <button
            onClick={() => setConfirmDelete(null)}
            className="cancel-button"
          >
            Annulla
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
