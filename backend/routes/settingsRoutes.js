import { saveUserColors, getUserColors } from '../controllers/settingsController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

export default (app) => {
  app.post('/save-colors', authenticateToken, saveUserColors);
  app.get('/get-colors', authenticateToken, getUserColors);
};
