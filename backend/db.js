import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Errore di connessione al database:', err.message);
        return;
    }
    console.log('Connessione al database MySQL avvenuta con successo!');
});

export default db;
