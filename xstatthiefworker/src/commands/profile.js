import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleProfile(message, env) {
  const chatId = message.chat.id;

  try {
    // ✅ Get user data
    const user = await getUser(env.DB, chatId);
    if (!user) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You are not registered. Use /start first.");
    }

    // ✅ Format user profile
    const profileMessage = `
👤 *Your Profile*  
---------------------
📛 Username: @${user.username || "N/A"}  
🆔 Telegram ID: ${user.telegram_id}  
📅 Joined: ${user.date_joined}  
🌍 Language: ${user.language || "Unknown"}  
🔰 Role: ${user.role}  
    `;

    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, profileMessage, "Markdown");

    return new Response("Profile message sent", { status: 200 });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
