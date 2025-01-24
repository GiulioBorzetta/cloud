import {
  shareItem,
  getSharedItems,
  getSharedWithMe,
  getSharedFileQRCode,
  deleteSharedFile,
} from '../controllers/sharedController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

export default (app) => {
  app.post('/share', authenticateToken, shareItem);
  app.get('/shared-items', authenticateToken, getSharedItems);
  app.get('/shared-with-me', authenticateToken, getSharedWithMe);
  app.get('/shared-files/:fileId/qr', authenticateToken, getSharedFileQRCode);
  app.delete('/delete-shared-file', authenticateToken, deleteSharedFile);
};
