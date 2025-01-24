import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

export const createFolder = (req, res) => {
  const { name, parentPath } = req.body;
  const userId = req.user.id;

  if (!name) return res.status(400).json({ error: 'Nome della cartella obbligatorio.' });

  const fullPath = path.join(process.cwd(), 'uploads', userId.toString(), parentPath || '', name);

  const checkQuery = `SELECT * FROM folders WHERE name = ? AND userId = ? AND parentPath = ?`;
  db.query(checkQuery, [name, userId, parentPath || '/'], (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore durante il controllo della cartella.' });
    if (results.length > 0) return res.status(400).json({ error: 'Una cartella con questo nome esiste già.' });

    fs.mkdir(fullPath, { recursive: true }, (err) => {
      if (err) return res.status(500).json({ error: 'Errore nella creazione della cartella.' });

      const query = `INSERT INTO folders (name, userId, parentPath) VALUES (?, ?, ?)`;
      db.query(query, [name, userId, parentPath || '/'], (err) => {
        if (err) return res.status(500).json({ error: 'Errore durante la creazione della cartella.' });
        res.status(201).json({ message: '' });
      });
    });
  });
};

export const deleteFolder = (req, res) => {
  const { folderPath } = req.body;
  const userId = req.user.id;

  if (!folderPath) {
    return res.status(400).json({ error: 'Percorso della cartella non fornito.' });
  }

  const deleteFilesQuery = `DELETE FROM files WHERE folderPath = ? AND userId = ?`;
  const deleteFolderQuery = `DELETE FROM folders WHERE name = ? AND userId = ?`;

  db.query(deleteFilesQuery, [folderPath, userId], (err) => {
    if (err) {
      console.error('Errore durante l\'eliminazione dei file:', err);
      return res.status(500).json({ error: 'Errore durante l\'eliminazione dei file.' });
    }

    db.query(deleteFolderQuery, [folderPath, userId], (err) => {
      if (err) {
        console.error('Errore durante l\'eliminazione della cartella:', err);
        return res.status(500).json({ error: 'Errore durante l\'eliminazione della cartella.' });
      }

      res.status(200).json({ message: 'Cartella eliminata con successo!' });
    });
  });
};

export const generalDelete = async (req, res) => {
  const { path: itemPath, name, isFolder } = req.body;
  const folderPath = req.body.folderPath || '';

  console.log('Deleting item with path:', itemPath, 'name:', name, 'folderPath:', folderPath);

  const normalizedPath = path.normalize(itemPath);
  const fullPath = path.join(uploadsDir, req.user.id.toString(), normalizedPath);
  const slashIndex = normalizedPath.indexOf('\\');
  
  if (slashIndex !== -1) {
    let prePath = normalizedPath.slice(0, slashIndex);
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
      
      if (!isFolder) {
        await fs.promises.unlink(fullPath);
        console.log('File eliminato:', fullPath);

        db.query(
          'DELETE FROM files WHERE encryptedName = ? AND userId = ?',
          [name, req.user.id],
          (err) => {
            if (err) {
              console.error('Errore eliminazione file dal database:', err);
              return res.status(500).json({ error: 'Errore eliminazione file dal database.' });
            }
            res.status(200).json({ message: 'File eliminato con successo!' });
          }
        );
      } else {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
        console.log('Cartella eliminata:', fullPath);

        db.query(
          'DELETE FROM folders WHERE name = ? AND userId = ?',
          [name, req.user.id],
          (err) => {
            if (err) {
              console.error('Errore eliminazione cartella dal database:', err);
              return res.status(500).json({ error: 'Errore eliminazione cartella dal database.' });
            }
            res.status(200).json({ message: 'Cartella eliminata con successo!' });
          }
        );
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error('Il file/cartella non esiste:', fullPath);
        return res.status(404).json({ error: 'Il file/cartella non esiste.' });
      }
      console.error('Errore durante l\'eliminazione:', err);
      res.status(500).json({ error: 'Errore durante l\'eliminazione.' });
    }
  }
};

export const deleteFile = (req, res) => {
    const { fileName, folderPath } = req.body;
    const userId = req.user.id;
  
    const deleteFileQuery = `DELETE FROM files WHERE encryptedName = ? AND folderPath = ? AND userId = ?`;
  
    db.query(deleteFileQuery, [fileName, folderPath, userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Errore durante l\'eliminazione del file.' });
      if (results.affectedRows === 0) return res.status(404).json({ error: 'File non trovato o accesso negato.' });
  
      const filePath = path.join(process.cwd(), 'uploads', userId.toString(), folderPath, fileName);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) return res.status(500).json({ error: 'Errore durante l\'eliminazione del file fisico.' });
        res.status(200).json({ message: 'File eliminato con successo!' });
      });
    });
  };

  export const deleteItem = (req, res) => {
    const { path: itemPath, isFolder } = req.body;
    const fullPath = path.join(uploadDir, itemPath);
  
    try {
      if (isFolder) {
        fs.rmdirSync(fullPath, { recursive: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      res.json({ message: 'Elemento eliminato con successo' });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: 'Errore durante l\'eliminazione' });
    }
  };
  
  export const getFiles = (req, res) => {
    const userId = req.user.id;
  
    const query = `
      SELECT originalName, encryptedName, id, folderPath
      FROM files 
      WHERE userId = ? AND folderPath = '/';
    `;
  
    db.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Errore nel recupero dei file.' });
      res.status(200).json({ files: results });
    });
  };
  
  export const updateFileVisibility = (req, res) => {
    const { id, itemType, visibility } = req.body;
    const userId = req.user.id;
  
    if (!id || !itemType || !['private', 'shared'].includes(visibility)) {
      return res.status(400).json({ error: 'Dati mancanti o visibilità non valida.' });
    }
  
    const table = itemType === 'file' ? 'files' : 'folders';
  
    const query = `
      UPDATE ${table} 
      SET visibility = ? 
      WHERE id = ? AND userId = ?;
    `;
  
    db.query(query, [visibility, id, userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Errore durante l\'aggiornamento della visibilità.' });
      if (results.affectedRows === 0) return res.status(404).json({ error: 'Elemento non trovato o accesso negato.' });
  
      res.status(200).json({ message: 'Visibilità aggiornata con successo.' });
    });
  };
  
  export const generateFileQRCode = async (req, res) => {
    const { folderName, fileName } = req.params;
    const fileUrl = `http://localhost:5004/uploads/${req.user.id}/${folderName}/${fileName}`;
  
    try {
      const buffer = await QRCode.toBuffer(fileUrl, { type: 'png' });
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${fileName}_qr.png"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (err) {
      res.status(500).json({ error: 'Errore durante la generazione del QR code.' });
    }
  };

export const getFolderContents = (req, res) => {
    try {
      const folderPath = req.query.path || '';
      const fullPath = path.join(uploadDir, folderPath);
  
      if (!fs.existsSync(fullPath)) {
        return res.json({ files: [], folders: [] });
      }
  
      const contents = fs.readdirSync(fullPath);
      const files = [];
      const folders = [];
  
      contents.forEach(item => {
        const itemPath = path.join(fullPath, item);
        const stat = fs.statSync(itemPath);
  
        if (stat.isDirectory()) {
          folders.push(item);
        } else {
          files.push({ encryptedName: item, folderPath });
        }
      });
  
      res.json({ files, folders });
    } catch (error) {
      console.error('Error reading folder contents:', error);
      res.status(500).json({ error: 'Errore durante la lettura dei contenuti della cartella' });
    }
  };
  
  export const generateQRCode = async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const shareUrl = `http://yourapp.com/shared/${fileId}`;
  
      const qrCode = await QRCode.toBuffer(shareUrl);
      res.type('png').send(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ error: 'Errore durante la generazione del QR code' });
    }
  };

  export const downloadFile = (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;

  const query = `
    SELECT encryptedName, folderPath 
    FROM files 
    WHERE id = ? AND userId = ?;
  `;

  db.query(query, [fileId, userId], (err, results) => {
    if (err) {
      console.error('Errore durante il recupero del file:', err);
      return res.status(500).json({ error: 'Errore durante il recupero del file.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'File non trovato.' });
    }

    const { encryptedName, folderPath } = results[0];

    const filePath = path.join(
      process.cwd(),
      'uploads',
      userId.toString(),
      folderPath || '',
      encryptedName
    );

    res.download(filePath, (err) => {
      if (err) {
        console.error('Errore durante il download del file:', err);
        res.status(500).json({ error: 'Errore durante il download del file.' });
      }
    });
  });
};

export const getFileContents = (req, res) => {
  const { path: folderPath } = req.query;
  const userId = req.user.id;

  const fullPath = path.join(
    process.cwd(),
    'uploads',
    userId.toString(),
    folderPath || ''
  );

  fs.readdir(fullPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error('Errore nel recupero dei contenuti della cartella:', err);
      return res.status(500).json({ error: 'Errore nel recupero dei contenuti della cartella.' });
    }

    const folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        originalName: entry.name.split('-').slice(1).join('-'),
        encryptedName: entry.name,
      }));

    res.status(200).json({ folders, files });
  });
};


export const getFolders = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT id, name, parentPath 
    FROM folders 
    WHERE userId = ? AND parentPath = '/';
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Errore nel recupero delle cartelle:', err);
      return res.status(500).json({ error: 'Errore nel recupero delle cartelle.' });
    }

    res.status(200).json({ folders: results });
  });
};

export const uploadFile = async (req, res) => {
  try {
    let folderName = decodeURIComponent(req.params.folderName);

    if (!folderName || folderName.trim() === '') {
      folderName = '';
    }

    const { id: userId } = req.user;
    const userFolderPath = path.join(process.cwd(), 'uploads', `${userId}`, folderName);
    console.log(userFolderPath);
    console.log('Controllo se la cartella esiste:', userFolderPath);

    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato.' });
    }

    try {
      await fs.promises.access(userFolderPath);
    } catch {
      console.log(`La cartella ${userFolderPath} non esiste, la creo.`);
      await fs.promises.mkdir(userFolderPath, { recursive: true });
    }

    const fileId = `${Date.now()}`;
    const fileUrl = `http://localhost:5000/files/${fileId}/download`;

    const qrCode = await QRCode.toDataURL(fileUrl);

    const query = `
      INSERT INTO files (id, originalName, encryptedName, userId, folderPath, qrCode) 
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    db.query(
      query,
      [fileId, req.file.originalname, req.file.filename, userId, folderName, qrCode],
      (dbErr) => {
        if (dbErr) {
          console.error('Errore durante l\'inserimento nel database:', dbErr);
          return res.status(500).json({ error: 'Errore durante l\'inserimento nel database.' });
        }

        res.status(201).json({
          message: 'File caricato con successo!',
          folderName,
          qrCode,
        });
      }
    );
  } catch (error) {
    console.error('Errore durante l\'upload del file:', error);
    res.status(500).json({ error: 'Errore durante l\'upload del file.' });
  }
};