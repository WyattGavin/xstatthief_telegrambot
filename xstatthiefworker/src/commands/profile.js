import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleProfile(message, env) {
  const chatId = message.chat.id;

  try {
    const user = await getUser(env.DB, chatId);

    if (!user) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "You are not in the database. Please send /start first.");
    }

    const profileMessage = `
👤 *Your Profile*
---------------------
📛 *Username:* ${user.username || "N/A"}
📝 *First Name:* ${user.first_name || "N/A"}
📝 *Last Name:* ${user.last_name || "N/A"}
🌍 *Language:* ${user.language || "Unknown"}
📅 *Joined:* ${new Date(user.date_joined).toLocaleString()}
🔖 *Role:* ${user.role}
    `;

    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, profileMessage, { parse_mode: "Markdown" });
    return new Response("Profile sent", { status: 200 });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
