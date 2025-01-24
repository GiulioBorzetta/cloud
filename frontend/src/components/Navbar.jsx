import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/navbar.css';
import ColorChanger from './ColorChanger';

const Navbar = ({ selectedItemsCount, handleDeleteSelected }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">CLOUD</h1>
      <div className="navbar-actions">
        <button
          onClick={handleDeleteSelected}
          disabled={selectedItemsCount === 0}
          className={`deleteSelectedButton ${selectedItemsCount === 0 ? 'disabled' : ''}`}
        >
          Elimina Selezionati
        </button>
        <ColorChanger />
        <button className="logoutButton" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
