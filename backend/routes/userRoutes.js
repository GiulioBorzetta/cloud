import authenticateToken from '../middlewares/authenticateToken.js';
import { getUserInfo, updateUsername, getAllUsers, getUsers } from '../controllers/userController.js';

export default (app) => {
  app.get('/user-info', authenticateToken, getUserInfo);
  app.put('/update-username', authenticateToken, updateUsername);
  app.get('/users/all', authenticateToken, getAllUsers);
  app.get('/users', authenticateToken, getUsers);
};
