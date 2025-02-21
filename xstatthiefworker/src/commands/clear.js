import { sendMessage } from "../utils/sendMessage.js";
import { getUser } from "../utils/db.js";

export default async function handleClear(message, env) {
  const chatId = message.chat.id;
  const senderId = message.from.id;

  try {
    // ✅ Check if sender is an admin or moderator
    const sender = await getUser(env.DB, senderId);
    if (!sender || (sender.role !== "admin" && sender.role !== "moderator")) {
      return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You do not have permission to clear messages.");
    }

    // ✅ Get the last message ID (used to determine range)
    const messageId = message.message_id;

    // ✅ Attempt to delete messages in bulk
    let deletedCount = 0;
    for (let i = 0; i < 100; i++) {
      const msgToDelete = messageId - i; // Delete from latest to oldest
      const deleteResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: msgToDelete
        })
      });

      const deleteData = await deleteResponse.json();
      if (deleteData.ok) {
        deletedCount++;
      } else {
        break; // Stop when deletion fails
      }
    }

    // ✅ Confirm chat has been cleared
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `✅ Cleared ${deletedCount} messages.`);
    
  } catch (error) {
    console.error("Clear Chat Error:", error);
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ Error clearing chat: ${error.message}`);
  }
}
