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

  if (!["admin", "moderator", "user"].includes(newRole)) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ Invalid role. Use: admin, moderator, or user.");
  }

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You are not registered. Send /start first.");
    }

    // Moderators can only change "user" ↔ "moderator" roles
    if (sender.role === "moderator" && newRole === "admin") {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ Moderators cannot assign admin roles.");
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    // Prevent moderators from modifying admins
    if (sender.role === "moderator" && targetUser.role === "admin") {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You cannot change an admin's role.");
    }

    await updateUserRole(env.DB, username, newRole);

    // Notify the user about their new role
    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, `🎉 Congratulations, @${username}! You are now a *${newRole}*.`);

    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ User @${username} is now a ${newRole}.`);

  } catch (error) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Error: ${error.message}`);
  }
}
