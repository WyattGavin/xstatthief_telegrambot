const TELEGRAM_API = "https://api.telegram.org";

/**
 * Send a message to any Telegram chat (general function).
 */
export async function sendMessage(botToken, chatId, text, parseMode = "HTML") {
  const url = `${TELEGRAM_API}/bot${botToken}/sendMessage`;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    }),
  });
}

/**
 * Send a direct message to another user.
 */
export async function sendDM(botToken, sender, recipient, message) {
  const formattedMessage = `
📩 <b>New Message from <a href="tg://user?id=${sender.telegram_id}">@${sender.username}</a>:</b>\n\n
<b>${message}</b>
  `;

  return sendMessage(botToken, recipient.telegram_id, formattedMessage);
}

/**
 * Send a confirmation message back to the sender.
 */
export async function confirmDM(botToken, chatId, message) {
  return sendMessage(botToken, chatId, message);
}
