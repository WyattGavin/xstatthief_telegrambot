import { sendMessage } from "../utils/sendMessage.js";

export default async function handleDefault(message, env) {
  const chatId = message.chat.id;
  const text = message.text;

  try {
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `You said: ${text}`);
    return new Response("Message sent", { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
