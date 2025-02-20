import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleStats(message, env) {
  const chatId = message.chat.id;

  try {
    const user = await getUser(env.DB, chatId);

    if (!user) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "You are not registered. Send /start first.");
    }

    if (user.role !== "admin") {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to use this command.");
    }

    // Get total user count and language distribution
    const totalUsersQuery = env.DB.prepare("SELECT COUNT(*) AS count FROM users;");
    const { results: totalUsersResult } = await totalUsersQuery.all();
    const totalUsers = totalUsersResult[0]?.count || 0;

    const languageQuery = env.DB.prepare("SELECT language, COUNT(*) AS count FROM users GROUP BY language;");
    const { results: languageResults } = await languageQuery.all();

    let languageStats = "🌍 *Language Distribution:*\n";
    languageResults.forEach(row => {
      languageStats += `- ${row.language.toUpperCase()}: ${row.count} users\n`;
    });

    const statsMessage = `
📊 *Bot Statistics*  
---------------------
👥 *Total Users:* ${totalUsers}  
${languageStats}
    `;

    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, statsMessage, { parse_mode: "Markdown" });

    return new Response("Stats sent", { status: 200 });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
