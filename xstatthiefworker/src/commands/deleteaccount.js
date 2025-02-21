import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleDeleteAccount(message, env) {
  const chatId = message.chat.id;

  try {
    // ✅ Check if user exists
    const user = await getUser(env.DB, chatId);
    if (!user) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You are not registered in the database.");
    }

    // ✅ Delete user from database
    await env.DB.prepare("DELETE FROM users WHERE telegram_id = ?")
      .bind(chatId)
      .run();

    // ✅ Send confirmation message
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "✅ Your account has been deleted. If you wish to rejoin, use /start.");

    return new Response("User deleted successfully", { status: 200 });

  } catch (error) {
    console.error("Delete Account Error:", error);
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ Error deleting account: ${error.message}`);
  }
}
