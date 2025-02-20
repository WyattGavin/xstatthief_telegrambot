import handleStart from "./commands/start.js";
import handleProfile from "./commands/profile.js";
import handleDefault from "./commands/default.js";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Use POST method", { status: 405 });
    }

    try {
      const update = await request.json();
      const message = update?.message;
      const text = message?.text;

      if (!message || !text) {
        return new Response("Invalid request", { status: 400 });
      }

      if (text.startsWith("/start")) {
        return await handleStart(message, env);
      } else if (text.startsWith("/profile")) {
        return await handleProfile(message, env);
      } else {
        return await handleDefault(message, env);
      }
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
