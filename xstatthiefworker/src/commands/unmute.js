import { sendMessage } from "../utils/sendMessage.js";
import { getUser, getUserByUsername } from "../utils/db.js";

export default async function handleUnmute(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/unmute", "").trim();
  const username = text.replace("@", "");

  if (!username) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /unmute @username");
  }

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender || (sender.role !== "admin" && sender.role !== "moderator")) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to unmute users.");
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    // ✅ Remove from mutes table
    await env.DB.prepare("DELETE FROM mutes WHERE telegram_id = ?")
      .bind(targetUser.telegram_id)
      .run();

    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, `✅ You have been unmuted. You can now send DMs.`);
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ @${username} has been unmuted.`);
  } catch (error) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Error: ${error.message}`);
  }
}
