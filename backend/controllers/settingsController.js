import db from '../db.js';

export const saveUserColors = (req, res) => {
  const { colors } = req.body;
  const userId = req.user.id;

  if (!colors || !colors.backgroundColor || !colors.textColor) {
    return res.status(400).json({ error: 'Dati colori non validi.' });
  }

  const query = `
    UPDATE user_settings 
    SET backgroundColor = ?, textColor = ? 
    WHERE userId = ?
  `;

  db.query(query, [colors.backgroundColor, colors.textColor, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore durante il salvataggio dei colori.' });
    if (results.affectedRows === 0) {
      const insertQuery = `
        INSERT INTO user_settings (userId, backgroundColor, textColor)
        VALUES (?, ?, ?)
      `;
      db.query(insertQuery, [userId, colors.backgroundColor, colors.textColor], (insertErr) => {
        if (insertErr) return res.status(500).json({ error: 'Errore durante l\'inserimento dei colori.' });
        res.status(200).json({ message: 'Colori salvati con successo!' });
      });
    } else {
      res.status(200).json({ message: 'Colori aggiornati con successo!' });
    }
  });
};

export const getUserColors = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT backgroundColor, textColor
    FROM user_settings
    WHERE userId = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Errore nel recupero dei colori.' });

    const colors = results.length > 0
      ? { backgroundColor: results[0].backgroundColor, textColor: results[0].textColor }
      : { backgroundColor: '#ffffff', textColor: '#000000' };

    res.status(200).json({ colors });
  });
};
