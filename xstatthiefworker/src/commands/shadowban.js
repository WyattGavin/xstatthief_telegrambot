import { sendMessage } from "../utils/sendMessage.js";

export default async function handleShadowban(message, env) {
  const chatId = message.chat.id;
  const text = message.text.replace("/shadowban", "").trim();

  if (!text.startsWith("@")) {
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, "⚠️ Usage: /shadowban @username");
  }

  const username = text.replace("@", ""); // Remove '@'
  const nitterUrl = `https://nitter.net/search?f=users&q=${username}`;

  try {
    console.log(`🔍 Fetching Nitter search page for: @${username}`);

    const response = await fetch(nitterUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.google.com/"
      }
    });

    console.log(`✅ Fetch Status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ Fetch failed for @${username}: Status ${response.status}`);
      throw new Error(`Failed to fetch Nitter page.`);
    }

    const htmlText = await response.text();
    console.log(`📄 Received HTML Length: ${htmlText.length}`);

    // Detect if the user appears in search results via <a class="tweet-link" href="/username">
    const tweetLinkRegex = new RegExp(`<a class="tweet-link" href="/${username}"`, "gi");
    const userFound = tweetLinkRegex.test(htmlText);

    if (userFound) {
      return sendMessage(
        env.TELEGRAM_BOT_TOKEN,
        chatId,
        `✅ @${username} appears in Nitter search. No shadow ban detected.`
      );
    } else {
      return sendMessage(
        env.TELEGRAM_BOT_TOKEN,
        chatId,
        `🚨 @${username} is missing from Nitter search. Possible shadow ban detected!`
      );
    }
  } catch (error) {
    console.error(`❌ Error fetching Nitter search for @${username}:`, error);
    return sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `❌ Error fetching search results: ${error.message}`);
  }
}
