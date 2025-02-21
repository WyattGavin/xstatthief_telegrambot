import { sendMessage } from "../utils/sendMessage.js";

export default async function handleStats(message, env) {
  const chatId = message.chat.id;

  try {
    // ✅ Get total users from the database
    const userCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM users").first("count");

    // ✅ Get total muted users
    const mutedCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM mutes").first("count");

    // ✅ Get total warnings issued
    const warningCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM warnings").first("count");

    const botVersion = await env.DB.prepare("SELECT version FROM bot_version ORDER BY id DESC LIMIT 1").first("version");

    // ✅ Format stats message
    const statsMessage = `
📊 *Bot Statistics*  
---------------------
👥 Total Users: ${userCount}  
🔇 Muted Users: ${mutedCount}  
⚠️ Warnings Issued: ${warningCount}  
🤖 Bot Version: ${botVersion || "Unknown"}  

    `;

    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, statsMessage, "Markdown");

    return new Response("Stats message sent", { status: 200 });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
