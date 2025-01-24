import { getAllUsers, deleteUser, updateUserPassword, verifyAdmin } from '../controllers/adminController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import authenticateAdmin from '../middlewares/authenticateAdmin.js';

export default (app) => {
  app.get('/admin/users', authenticateToken, authenticateAdmin, getAllUsers);

  app.get('/verify-admin', authenticateToken, verifyAdmin);

  app.delete('/admin/delete-user/:userId', authenticateToken, authenticateAdmin, deleteUser);

  app.put('/admin/update-password/:userId', authenticateToken, authenticateAdmin, updateUserPassword);
};
