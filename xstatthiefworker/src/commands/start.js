import { sendMessage } from "../utils/sendMessage.js";
import { getUser, insertOrUpdateUser } from "../utils/db.js";

export default async function handleStart(message, env) {
  const chatId = message.chat.id;
  const username = message.chat.username || "N/A";
  const firstName = message.chat.first_name || "N/A";
  const lastName = message.chat.last_name || "N/A";
  const language = message.from?.language_code || "unknown";
  const dateJoined = new Date().toISOString();
  const role = "user";

  try {
    const existingUser = await getUser(env.DB, chatId);

    if (existingUser) {
      // If the user exists, just greet them
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Hi ${firstName}, welcome back!`);
    } else {
      // If user doesn't exist, add them to the database
      await insertOrUpdateUser(env.DB, chatId, username, firstName, lastName, language, dateJoined, role);
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Welcome, ${firstName}! You have been added to the database.`);
    }

    return new Response("User processed", { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
