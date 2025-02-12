import db from '../db.js';

export const saveUserColors = async (req, res) => {
  const { colors } = req.body;
  const userId = req.user.id;

  if (!colors || !colors.backgroundColor || !colors.textColor) {
    return res.status(400).json({ error: 'Dati colori non validi.' });
  }

  try {
    const updateQuery = `
      UPDATE user_settings 
      SET backgroundColor = ?, textColor = ? 
      WHERE userId = ?
    `;
    const updateResults = await new Promise((resolve, reject) => {
      db.query(updateQuery, [colors.backgroundColor, colors.textColor, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (updateResults.affectedRows === 0) {
      const insertQuery = `
        INSERT INTO user_settings (userId, backgroundColor, textColor)
        VALUES (?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        db.query(insertQuery, [userId, colors.backgroundColor, colors.textColor], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      return res.status(200).json({ message: 'Colori salvati con successo!' });
    } else {
      return res.status(200).json({ message: 'Colori aggiornati con successo!' });
    }
  } catch (error) {
    console.error('Errore durante il salvataggio dei colori:', error);
    return res.status(500).json({ error: 'Errore durante il salvataggio dei colori.' });
  }
};

export const getUserColors = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT backgroundColor, textColor
      FROM user_settings
      WHERE userId = ?
    `;
    const results = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    const colors = results.length > 0
      ? { backgroundColor: results[0].backgroundColor, textColor: results[0].textColor }
      : { backgroundColor: '#ffffff', textColor: '#000000' };

    return res.status(200).json({ colors });
  } catch (error) {
    console.error('Errore nel recupero dei colori:', error);
    return res.status(500).json({ error: 'Errore nel recupero dei colori.' });
  }
};
