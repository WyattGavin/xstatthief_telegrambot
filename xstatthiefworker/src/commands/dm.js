import { sendMessage } from "../utils/sendMessage.js";
import { getUser, getUserByUsername } from "../utils/db.js";

export default async function handleDM(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/dm", "").trim();
  const args = text.split(" ");
  
  if (args.length < 2) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /dm @username Your message here...");
  }

  const username = args.shift().replace("@", ""); // Extract username
  const userMessage = args.join(" "); // Extract the message content

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender || (sender.role !== "admin" && sender.role !== "moderator")) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to send DMs.");
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    // Send the DM
    await sendMessage(env.TELEGRAM_BOT_TOKEN, targetUser.telegram_id, `📩 *New Message from Admin/Mod:*\n\n${userMessage}`, { parse_mode: "Markdown" });

    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ Message sent to @${username}.`);
  } catch (error) {
    return await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Error: ${error.message}`);
  }
}
