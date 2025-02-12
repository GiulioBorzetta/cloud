import db from '../db.js';

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = 'SELECT id, username, role FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Errore del server' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }

      const user = results[0];
      res.json({
        username: user.username,
        id: user.id,
      });
    });
  } catch (error) {
    console.error('Error in user-info:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
};

export const updateUsername = async (req, res) => {
  const userId = req.user.id;
  const { newUsername } = req.body;

  if (!newUsername) {
    return res.status(400).json({ error: 'Il nuovo nome utente è obbligatorio.' });
  }

  const query = `UPDATE users SET username = ? WHERE id = ?`;

  try {
    await new Promise((resolve, reject) => {
      db.query(query, [newUsername, userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    return res.status(200).json({ message: 'Nome utente aggiornato con successo!' });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del nome utente:', error);
    return res.status(500).json({ error: 'Errore durante l\'aggiornamento del nome utente.' });
  }
};

export const getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso non autorizzato' });
  }

  const query = 'SELECT id, username, role FROM users';

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    return res.json({ users: results });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
  }
};

export const getUsers = async (req, res) => {
  const query = `SELECT id, username FROM users WHERE id != ?`;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [req.user.id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    return res.status(200).json({ users: results });
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    return res.status(500).json({ error: 'Errore nel recupero degli utenti.' });
  }
};

