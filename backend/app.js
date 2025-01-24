import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sharedRoutes from './routes/sharedRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({
  origin: '*',
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

authRoutes(app);
userRoutes(app);
sharedRoutes(app);
settingsRoutes(app);
fileRoutes(app);
adminRoutes(app);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} già in uso. Riprova con un'altra porta.`);
    process.exit(1);
  }
});




