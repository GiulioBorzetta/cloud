export default function authenticateAdmin(req, res, next) {
    console.log('req.user:', req.user);

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accesso negato. Solo gli admin possono accedere.' });
    }

    next();
  }
  