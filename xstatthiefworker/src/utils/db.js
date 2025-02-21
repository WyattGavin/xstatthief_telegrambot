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

// ✅ Function to update role by Telegram ID
export async function updateUserRoleById(db, telegramId, newRole) {
  const stmt = db.prepare(`UPDATE users SET role = ? WHERE telegram_id = ?;`);
  return stmt.bind(newRole, telegramId).run();
}

export async function getAllUsers(db) {
  const stmt = db.prepare("SELECT telegram_id FROM users;");
  const { results } = await stmt.all();
  return results;
}

export async function getUserByUsername(db, username) {
  const stmt = db.prepare(`SELECT * FROM users WHERE username = ?;`);
  const { results } = await stmt.bind(username).all();
  return results.length > 0 ? results[0] : null;
}

// ✅ Function to update role by username
export async function updateUserRoleByUsername(db, username, newRole) {
  const allowedRoles = ["admin", "moderator", "user"];
  if (!allowedRoles.includes(newRole)) {
    throw new Error("Invalid role. Use: admin, moderator, or user.");
  }

  const stmt = db.prepare(`UPDATE users SET role = ? WHERE username = ?;`);
  return stmt.bind(newRole, username).run();
}

export async function updateUserRole(db, username, newRole) {
  const allowedRoles = ["admin", "moderator", "user"];
  if (!allowedRoles.includes(newRole)) {
    throw new Error("Invalid role. Use: admin, moderator, or user.");
  }

  const stmt = db.prepare(`UPDATE users SET role = ? WHERE username = ?;`);
  return stmt.bind(newRole, username).run();
}

export async function updateBotVersion(db) {
  try {
    let currentVersion = await db.prepare("SELECT version FROM bot_version ORDER BY id DESC LIMIT 1").first("version");

    if (!currentVersion) {
      currentVersion = "1.0.0";
    }

    let [major, minor, patch] = currentVersion.split(".");
    patch = (parseInt(patch) + 1).toString();
    const newVersion = `${major}.${minor}.${patch}`;

    await db.prepare("INSERT INTO bot_version (version) VALUES (?)").bind(newVersion).run();

    return newVersion;
  } catch (error) {
    console.error("Version Update Error:", error);
    return "Unknown";
  }
}
