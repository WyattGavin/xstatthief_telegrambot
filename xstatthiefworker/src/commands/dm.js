import { sendDM, confirmDM } from "../utils/sendMessage.js";
import { getUser, getUserByUsername } from "../utils/db.js";

export default async function handleDM(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/dm", "").trim();
  const args = text.split(" ");

  if (args.length < 2) {
    return confirmDM(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /dm @username Your message here...");
  }

  const username = args.shift().replace("@", ""); // Extract username
  const userMessage = args.join(" "); // Extract the message content

  try {
    const sender = await getUser(env.DB, chatId);
    if (!sender) {
      return confirmDM(env.TELEGRAM_BOT_TOKEN, chatId, "❌ You are not registered. Send /start first.");
    }

    // ✅ Check if user is muted
    const muteRecord = await env.DB.prepare(
      "SELECT mute_until FROM mutes WHERE telegram_id = ?"
    )
      .bind(chatId)
      .first();

    if (muteRecord && muteRecord.mute_until) {
      const muteUntil = new Date(muteRecord.mute_until);
      const currentTime = new Date();

      if (muteUntil > currentTime) {
        // ✅ User is still muted, tell them remaining time
        const timeLeft = Math.ceil((muteUntil - currentTime) / 60000); // Convert milliseconds to minutes
        return confirmDM(
          env.TELEGRAM_BOT_TOKEN,
          chatId,
          `🚫 You are muted and cannot send DMs. <b>${timeLeft} minutes remaining.</b>`
        );
      } else {
        // ✅ User's mute expired, remove them from `mutes` table
        await env.DB.prepare("DELETE FROM mutes WHERE telegram_id = ?")
          .bind(chatId)
          .run();
      }
    }

    const targetUser = await getUserByUsername(env.DB, username);
    if (!targetUser) {
      return confirmDM(env.TELEGRAM_BOT_TOKEN, chatId, `❌ User @${username} not found.`);
    }

    if (targetUser.telegram_id === chatId) {
      return confirmDM(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ You cannot DM yourself.");
    }

    // ✅ Send the DM using sendDM utility
    await sendDM(env.TELEGRAM_BOT_TOKEN, sender, targetUser, userMessage);

    // ✅ Confirm message sent
    return confirmDM(env.TELEGRAM_BOT_TOKEN, chatId, `✅ Message sent to <b>@${username}</b>.`);

  } catch (error) {
    console.error("DM Error:", error);
    return confirmDM(env.TELEGRAM_BOT_TOKEN, chatId, `❌ Error: ${error.message}`);
  }
}
