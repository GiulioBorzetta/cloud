import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

export const getAllUsers = async (req, res) => {
  const query = 'SELECT id, username, role FROM users';

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    return res.status(500).json({ error: 'Errore nel server durante il recupero degli utenti.' });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await new Promise((resolve, reject) => {
      const deleteSharedItemsQuery = 'DELETE FROM shared_items WHERE ownerUserId = ? OR sharedWithUserId = ?';
      db.query(deleteSharedItemsQuery, [userId, userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    await new Promise((resolve, reject) => {
      const deleteFilesQuery = 'DELETE FROM files WHERE userId = ?';
      db.query(deleteFilesQuery, [userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const userUploadsPath = path.join(uploadsDir, userId);
    console.log(userUploadsPath);

    if (fs.existsSync(userUploadsPath)) {
      fs.rmSync(userUploadsPath, { recursive: true, force: true });
      console.log(`Cartella dell'utente ${userId} rimossa.`);
    } else {
      console.log(`Cartella dell'utente ${userId} non trovata.`);
    }

    await new Promise((resolve, reject) => {
      const deleteFoldersQuery = 'DELETE FROM folders WHERE userId = ?';
      db.query(deleteFoldersQuery, [userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
      db.query(deleteUserQuery, [userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(200).json({ message: 'Utente eliminato con successo e tutti i dati associati sono stati rimossi.' });
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'utente:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'utente.' });
  }
};

export const updateUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim() === '') {
    return res.status(400).json({ error: 'La nuova password è obbligatoria.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `UPDATE users SET password = ? WHERE id = ?`;
    db.query(query, [hashedPassword, userId], (err, results) => {
      if (err) {
        console.error('Errore durante l\'aggiornamento della password:', err);
        return res.status(500).json({ error: 'Errore durante l\'aggiornamento della password.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Utente non trovato.' });
      }

      res.status(200).json({ message: 'Password aggiornata con successo.' });
    });
  } catch (err) {
    console.error('Errore durante l\'hashing della password:', err);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della password.' });
  }
};


export const verifyAdmin = (req, res) => {
    console.log('Verifica ruolo utente:', req.user.role); // Aggiungi log
    if (req.user.role === 'admin') {
      return res.status(200).json({ role: 'admin' });
    } else {
      return res.status(403).json({ role: 'user' });
    }
  };