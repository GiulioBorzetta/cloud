import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import path from 'path';
import fs from 'fs/promises';

export const verifyToken = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token non fornito.' });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      });
    });

    return res.status(200).json({
      message: 'Token valido',
      user,
    });
  } catch (error) {
    console.error('Errore di verifica token:', error);
    return res.status(403).json({ error: 'Token non valido.' });
  }
};

export const updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Vecchia e nuova password sono obbligatorie.' });
  }

  try {
    const selectQuery = 'SELECT password FROM users WHERE id = ?';
    const results = await new Promise((resolve, reject) => {
      db.query(selectQuery, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato.' });
    }

    const userPassword = results[0].password;
    const isMatch = await bcrypt.compare(oldPassword, userPassword);

    if (!isMatch) {
      return res.status(403).json({ error: 'La vecchia password non è corretta.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    await new Promise((resolve, reject) => {
      db.query(updateQuery, [hashedPassword, userId], (updateErr, updateResults) => {
        if (updateErr) return reject(updateErr);
        resolve(updateResults);
      });
    });

    return res.status(200).json({ message: 'Password aggiornata con successo!' });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della password:', error);
    return res.status(500).json({ error: 'Errore durante l\'aggiornamento della password.' });
  }
};

export const register = async (req, res) => {
  const { username, password, role, adminPassword } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password sono obbligatori.' });
  }

  if (role === 'admin' && adminPassword !== process.env.ADMIN_CREATION_PASSWORD) {
    return res.status(403).json({ error: 'Permesso negato. La password di sicurezza per creare un admin non è valida.' });
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

  try {
    const results = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (results.length === 0) {
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

    return res.status(200).json({ message: 'Login riuscito!', token, role: user.role });
  } catch (error) {
    console.error('Errore durante il login:', error);
    return res.status(401).json({ error: 'Credenziali non valide' });
  }
};