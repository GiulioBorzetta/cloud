import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import path from 'path';
import fs from 'fs/promises';

export const verifyToken = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Token non fornito.' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token non valido.' });
      }
      res.status(200).json({
        message: 'Token valido',
        user,
      });
    });
  };

export const updatePassword = (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Vecchia e nuova password sono obbligatorie.' });
  }

  const query = `SELECT password FROM users WHERE id = ?`;
  db.query(query, [userId], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore nel recupero della password.' });

    if (results.length === 0) return res.status(404).json({ error: 'Utente non trovato.' });

    const userPassword = results[0].password;
    const isMatch = await bcrypt.compare(oldPassword, userPassword);

    if (!isMatch) return res.status(403).json({ error: 'La vecchia password non è corretta.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery = `UPDATE users SET password = ? WHERE id = ?`;

    db.query(updateQuery, [hashedPassword, userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: 'Errore durante l\'aggiornamento della password.' });
      res.status(200).json({ message: 'Password aggiornata con successo!' });
    });
  });
};

export const register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password sono obbligatori.' });
  }

  try {
    const checkQuery = `SELECT * FROM users WHERE username = ?`;
    db.query(checkQuery, [username], async (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Errore durante il controllo dell\'esistenza dell\'utente:', checkErr);
        return res.status(500).json({ error: 'Errore durante il controllo dell\'esistenza dell\'utente.' });
      }

      if (checkResults.length > 0) {
        return res.status(409).json({ error: 'L\'username è già in uso. Scegli un altro nome.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role === 'admin' ? 'admin' : 'user';

      const insertQuery = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
      db.query(insertQuery, [username, hashedPassword, userRole], async (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Errore durante la registrazione:', insertErr);
          return res.status(500).json({ error: 'Errore durante la registrazione.' });
        }

        const userId = insertResults.insertId;
        const userFolderPath = path.join(process.cwd(), 'uploads', `${userId}`);

        try {
          await fs.mkdir(userFolderPath, { recursive: true });
          console.log(`Cartella creata per l'utente ${userId}: ${userFolderPath}`);
          res.status(201).json({ message: 'Utente registrato con successo.' });
        } catch (mkdirErr) {
          console.error('Errore durante la creazione della cartella utente:', mkdirErr);
          return res.status(500).json({ error: 'Errore durante la creazione della cartella utente.' });
        }
      });
    });
  } catch (err) {
    console.error('Errore hashing password:', err);
    res.status(500).json({ error: 'Errore durante la registrazione.' });
  }
};
  
  export const login = async (req, res) => {
    const { username, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }
  
      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }
  
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Login riuscito!', token, role: user.role });
    });
  };