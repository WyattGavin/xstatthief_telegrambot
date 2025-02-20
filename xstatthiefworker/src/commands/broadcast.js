import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleBroadcast(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/broadcast", "").trim();

  if (!text) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Please provide a message to broadcast.");
  }

  try {
    const user = await getUser(env.DB, chatId);

    if (!user) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You are not registered. Send /start first.");
    }

    if (user.role !== "admin") {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to use this command.");
    }

    // Fetch all users
    const usersQuery = env.DB.prepare("SELECT telegram_id FROM users;");
    const { results: users } = await usersQuery.all();

    if (users.length === 0) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ No users found in the database.");
    }

    // Send the message to each user
    let sentCount = 0;
    for (const user of users) {
      try {
        await sendMessage(env.TELEGRAM_BOT_TOKEN, user.telegram_id, `📢 *Broadcast Message:*\n\n${text}`, { parse_mode: "Markdown" });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${user.telegram_id}:`, error);
      }
    }

    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ Broadcast sent to ${sentCount} users.`);

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
