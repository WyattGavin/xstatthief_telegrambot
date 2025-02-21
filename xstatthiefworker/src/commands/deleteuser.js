import { sendMessage } from "../utils/sendMessage.js";
import { getUser, getUserByUsername } from "../utils/db.js";

export default async function handleDeleteUser(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/deleteuser", "").trim();
  const username = text.replace("@", ""); // Extract username

  if (!username) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /deleteuser @username");
  }

  try {
    // ✅ Check if sender is an admin
    const sender = await getUser(env.DB, chatId);
    if (!sender || sender.role !== "admin") {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ Only admins can delete users.");
    }

    // ✅ Check if target user exists
    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    // ✅ Prevent admin from deleting themselves
    if (targetUser.telegram_id === chatId) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ You cannot delete yourself. Use /deleteaccount instead.");
    }

    // ✅ Delete user from database
    await env.DB.prepare("DELETE FROM users WHERE telegram_id = ?")
      .bind(targetUser.telegram_id)
      .run();

    // ✅ Notify the deleted user
    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, "❌ Your account has been deleted by an admin.");

    // ✅ Confirm deletion to the admin
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ @${username} has been deleted from the database.`);

  } catch (error) {
    console.error("Delete User Error:", error);
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ Error deleting user: ${error.message}`);
  }
}
