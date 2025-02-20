import { sendMessage } from "../utils/sendMessage.js";
import { getUser, getUserByUsername, updateUserRole } from "../utils/db.js";

export default async function handleSetRole(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/setrole", "").trim();
  const args = text.split(" ");

  if (args.length < 2) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /setrole @username role (admin, moderator, user)");
  }

  const username = args[0].replace("@", ""); // Remove '@' if mentioned
  const newRole = args[1].toLowerCase();

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender || sender.role !== "admin") {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to change roles.");
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    if (targetUser.role === "admin" && newRole !== "admin") {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ You cannot demote another admin.");
    }

    await updateUserRole(env.DB, username, newRole);

    // Notify the user about their new role
    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, `🎉 Congratulations, @${username}! You are now a *${newRole}*.`);

    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ User @${username} is now a ${newRole}.`);
    
  } catch (error) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Error: ${error.message}`);
  }
}
