import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/verify-admin`, {
          headers: { Authorization: `Bearer ${token}` },
          'Content-Type': 'application/json',
        });
        setIsAdmin(response.data.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/access-denied" />;
};

export default AdminRoute;
