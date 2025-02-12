import db from '../db.js';
import QRCode from 'qrcode';

export const shareItem = async (req, res) => {
  const { itemType, itemId, sharedWithUserId } = req.body;
  const { id: ownerUserId } = req.user;

  if (!itemType || !itemId || !sharedWithUserId) {
    return res.status(400).json({ error: 'Dati mancanti per la condivisione.' });
  }

  if (String(ownerUserId) === String(sharedWithUserId)) {
    return res.status(400).json({ error: 'Non è possibile condividere un elemento con il proprio account.' });
  }

  const query = `INSERT INTO shared_items (itemType, itemId, ownerUserId, sharedWithUserId) VALUES (?, ?, ?, ?)`;

  try {
    await new Promise((resolve, reject) => {
      db.query(query, [itemType, itemId, ownerUserId, sharedWithUserId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    return res.status(201).json({ message: 'Elemento condiviso con successo!' });
  } catch (error) {
    console.error('Errore durante la condivisione dell\'elemento:', error);
    return res.status(500).json({ error: 'Errore durante la condivisione dell\'elemento.' });
  }
};

export const getSharedItems = async (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT si.itemType, si.id, f.originalName AS fileName, fo.name AS folderName, u.username AS owner
    FROM shared_items si
    LEFT JOIN files f ON si.itemType = 'file' AND si.id = f.id
    LEFT JOIN folders fo ON si.itemType = 'folder' AND si.id = fo.id
    LEFT JOIN users u ON si.ownerUserId = u.id
    WHERE si.sharedWithUserId = ?
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    return res.status(200).json({ sharedItems: results });
  } catch (error) {
    console.error('Errore nel recupero degli elementi condivisi:', error);
    return res.status(500).json({ error: 'Errore nel recupero degli elementi condivisi.' });
  }
};

export const deleteSharedFile = async (req, res) => {
  const { fileId } = req.body;
  if (!fileId) {
    return res.status(400).json({ error: 'ID del file mancante.' });
  }

  const query = `
    DELETE FROM shared_items 
    WHERE id = ? AND sharedWithUserId = ?
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [fileId, req.user.id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'File condiviso non trovato.' });
    }
    return res.status(200).json({ message: 'File condiviso eliminato con successo.' });
  } catch (error) {
    console.error('Errore durante l\'eliminazione del file condiviso:', error);
    return res.status(500).json({ error: 'Errore durante l\'eliminazione del file condiviso.' });
  }
};

export const getSharedFileQRCode = async (req, res) => {
  const { fileId } = req.params;
  const query = `SELECT qrCode FROM shared_items WHERE itemId = ? AND itemType = 'file';`;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [fileId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (results.length === 0) {
      return res.status(404).json({ error: 'QR code non trovato per l\'elemento condiviso.' });
    }

    const qrCode = results[0].qrCode || '';
    if (!qrCode.startsWith('data:image/png;base64,')) {
      console.error('Formato QR code non valido:', qrCode);
      return res.status(500).json({ error: 'Formato QR code non supportato.' });
    }

    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${fileId}_qr.png"`,
      'Content-Length': buffer.length,
    });
    return res.end(buffer);
  } catch (error) {
    console.error('Errore durante il recupero del QR code:', error);
    return res.status(500).json({ error: 'Errore nel server.' });
  }
};

export const getSharedWithMe = async (req, res) => {
  const { id: userId } = req.user;
  const query = `
    SELECT 
      si.itemType, 
      si.id, 
      si.itemId, 
      CASE 
        WHEN si.itemType = 'file' THEN f.originalName
        WHEN si.itemType = 'folder' THEN fo.name
        ELSE NULL
      END AS itemName,
      f.folderPath, 
      f.encryptedName,
      si.qrCode,
      u.username AS owner
    FROM shared_items si
    LEFT JOIN files f ON si.itemType = 'file' AND si.itemId = f.encryptedName
    LEFT JOIN folders fo ON si.itemType = 'folder' AND si.itemId = fo.id
    LEFT JOIN users u ON si.ownerUserId = u.id
    WHERE si.sharedWithUserId = ?;
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (results.length === 0) {
      return res.status(200).json({ message: 'Non ci sono elementi condivisi.' });
    }

    const formattedResults = results.map((item) => ({
      id: item.id,
      fileName: item.itemName,
      type: item.itemType,
      folderPath: item.folderPath || '/',
      encryptedName: item.encryptedName || '',
      qrCode: item.qrCode,
      owner: item.owner,
    }));

    return res.status(200).json({ sharedItems: formattedResults });
  } catch (error) {
    console.error('Errore nel recupero degli elementi condivisi:', error);
    return res.status(500).json({ error: 'Errore nel recupero degli elementi condivisi.' });
  }
};

