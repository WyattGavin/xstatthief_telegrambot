import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleBroadcast(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/broadcast", "").trim();

  if (!text) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /broadcast <message>");
  }

  try {
    // ✅ Check if sender is admin
    const sender = await getUser(env.DB, chatId);
    if (!sender || sender.role !== "admin") {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ Only admins can broadcast messages.");
    }

    // ✅ Get all users
    const users = await env.DB.prepare("SELECT telegram_id FROM users").all();

    let sentCount = 0;
    for (const user of users.results) {
      await sendMessage(env.TELEGRAM_BOT_TOKEN, user.telegram_id, `📢 *Broadcast Message:*\n\n${text}`, "Markdown");
      sentCount++;
    }

    // ✅ Send confirmation to sender
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ Broadcast sent to ${sentCount} users:`);

    return new Response(`Broadcast sent to ${sentCount} users`, { status: 200 });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
