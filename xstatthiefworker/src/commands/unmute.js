import { sendMessage } from "../utils/sendMessage.js";
import { getUser, getUserByUsername } from "../utils/db.js";

export default async function handleUnmute(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/unmute", "").trim();
  const username = text.replace("@", "");

  if (!username) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /unmute @username");
  }

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender || (sender.role !== "admin" && sender.role !== "moderator")) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to unmute users.");
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    await env.DB.prepare("DELETE FROM mutes WHERE telegram_id = ?").bind(targetUser.telegram_id).run();

    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, `🔊 You have been unmuted.`);
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ @${username} is now unmuted.`);
  } catch (error) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Error: ${error.message}`);
  }
}
