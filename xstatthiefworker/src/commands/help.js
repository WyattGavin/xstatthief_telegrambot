import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleHelp(message, env) {
  const chatId = message.chat.id;

  try {
    const user = await getUser(env.DB, chatId);
    const role = user?.role || "user"; // Default role is "user"

    let helpMessage = `
🤖 *Bot Commands Guide*  
---------------------
/start - Register or say hi if you're already registered.  
/profile - View your saved profile information.  
/help - Show this list of commands.  
    `;

    if (role === "moderator" || role === "admin") {
      helpMessage += `
🔧 *Moderator Commands*  
---------------------
/mute @username [minutes] - Temporarily mute a user.  
/unmute @username - Unmute a user.  
/warn @username [reason] - Issue a warning.  
      `;
    }

    if (role === "admin") {
      helpMessage += `
🛠 *Admin Commands*  
---------------------
/stats - View bot statistics.  
/broadcast <message> - Send a message to all users.  
/setrole @username role - Assign a role (admin, moderator, user).  
      `;
    }

    helpMessage += `\n🔹 More commands will be added soon! Stay tuned.`;

    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, helpMessage, { parse_mode: "Markdown" });

    return new Response("Help message sent", { status: 200 });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
