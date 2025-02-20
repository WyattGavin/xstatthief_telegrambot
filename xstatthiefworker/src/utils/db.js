export async function getUser(db, telegramId) {
    const stmt = db.prepare(`SELECT * FROM users WHERE telegram_id = ?;`);
    const { results } = await stmt.bind(telegramId).all();
    return results.length > 0 ? results[0] : null;
  }
  
  export async function insertOrUpdateUser(db, telegramId, username, firstName, lastName, language, dateJoined, role) {
    const stmt = db.prepare(`
      INSERT INTO users (telegram_id, username, first_name, last_name, language, date_joined, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(telegram_id) DO UPDATE 
      SET username = excluded.username, 
          first_name = excluded.first_name, 
          last_name = excluded.last_name,
          language = excluded.language;
    `);
  
    return stmt.bind(telegramId, username, firstName, lastName, language, dateJoined, role).run();
  }
  
  export async function updateUserRole(db, telegramId, newRole) {
    const stmt = db.prepare(`UPDATE users SET role = ? WHERE telegram_id = ?;`);
    return stmt.bind(newRole, telegramId).run();
  }