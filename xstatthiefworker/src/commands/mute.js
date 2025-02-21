import { sendMessage } from "../utils/sendMessage.js";
import { getUser, getUserByUsername } from "../utils/db.js";

export default async function handleMute(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/mute", "").trim();
  const args = text.split(" ");

  if (args.length < 2) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /mute @username [minutes]");
  }

  const username = args[0].replace("@", "");
  const minutes = parseInt(args[1]);

  if (isNaN(minutes) || minutes <= 0) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Please enter a valid number of minutes.");
  }

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender || (sender.role !== "admin" && sender.role !== "moderator")) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to mute users.");
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    const muteUntil = new Date(Date.now() + minutes * 60000).toISOString();
    await env.DB.prepare(`
      INSERT INTO mutes (telegram_id, mute_until) 
      VALUES (?, ?) 
      ON CONFLICT(telegram_id) DO UPDATE SET mute_until = ?`)
      .bind(targetUser.telegram_id, muteUntil, muteUntil)
      .run();

    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, `🚫 You have been muted for ${minutes} minutes. You cannot send DMs.`);
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ @${username} is now muted for ${minutes} minutes.`);
  } catch (error) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Error: ${error.message}`);
  }
}
