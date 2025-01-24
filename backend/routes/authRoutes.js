import { verifyToken, updatePassword, register, login } from '../controllers/authController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 5,
  message: {
    error: 'Troppi tentativi di accesso falliti. Riprova tra 3 minuti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default (app) => {
  app.get('/verify-token', verifyToken);
  app.put('/update-password', authenticateToken, updatePassword);
  app.post('/register', register);
  app.post('/login', loginLimiter, login);
  
};
