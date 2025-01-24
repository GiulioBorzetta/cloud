import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ColorChanger = () => {
  const [colors, setColors] = useState({
    backgroundColor: '#ffffff',
    textColor: '#000000'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColors = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-colors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.data.colors) {
          setColors(response.data.colors);
          document.body.style.backgroundColor = response.data.colors.backgroundColor;
          document.body.style.color = response.data.colors.textColor;
        }
      } catch (error) {
        console.error('Errore nel recupero dei colori:', error);
      }
    };
  
    fetchColors();
  }, []);
  
  const navigateToSettings = () => {
    navigate('/settings');
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={navigateToSettings} style={{ padding: '10px 20px' }}>
        Vai alle Impostazioni
      </button>
    </div>
  );
};

export default ColorChanger;