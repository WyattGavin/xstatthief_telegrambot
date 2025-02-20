import { sendMessage } from "../utils/sendMessage.js";
import { getUser, getUserByUsername } from "../utils/db.js";

export default async function handleWarn(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/warn", "").trim();
  const args = text.split(" ");
  const username = args.shift().replace("@", "");
  const reason = args.join(" ") || "No reason given.";

  if (!username) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /warn @username [reason]");
  }

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender || (sender.role !== "admin" && sender.role !== "moderator")) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to warn users.");
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    const issuedAt = new Date().toISOString();
    await env.DB.prepare("INSERT INTO warnings (telegram_id, moderator_id, reason, issued_at) VALUES (?, ?, ?, ?)")
      .bind(targetUser.telegram_id, chatId, reason, issuedAt)
      .run();

    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, `⚠️ You have received a warning: "${reason}".`);
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ Warning issued to @${username}: "${reason}".`);
  } catch (error) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Error: ${error.message}`);
  }
}
