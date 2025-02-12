import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {
  createFolder,
  getFolders,
  deleteFolder,
  deleteFile,
  getFileContents,
  uploadFile,
  downloadFile,
  getFiles,
  updateFileVisibility,
  generateFileQRCode,
  generalDelete,
} from '../controllers/fileController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

export default (app) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      (async () => {
        try {
          const userFolder = req.params.folderName || 'default';
          const userId = req.user.id;
          const fullPath = path.join(process.cwd(), 'uploads', `${userId}`, userFolder);

          try {
            await fs.promises.access(fullPath);
          } catch (err) {
            await fs.promises.mkdir(fullPath, { recursive: true });
          }

          cb(null, fullPath);
        } catch (error) {
          cb(error);
        }
      })();
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  });
  

 const upload = multer({ storage });

  app.post('/create-folder', authenticateToken, createFolder);
  app.get('/folders', authenticateToken, getFolders);
  app.delete('/delete', authenticateToken, generalDelete);
  app.delete('/delete-folder', authenticateToken, deleteFolder);
  app.delete('/delete-file', authenticateToken, deleteFile);
  app.get('/folder-contents', authenticateToken, getFileContents);
  app.post('/upload/:folderName', authenticateToken, upload.single('file'), uploadFile);
  app.get('/files/:fileId/download', authenticateToken, downloadFile);
  app.get('/files', authenticateToken, getFiles);
  app.patch('/visibility', authenticateToken, updateFileVisibility);
  app.get('/:folderName/:fileName/qr', authenticateToken, generateFileQRCode);

};
