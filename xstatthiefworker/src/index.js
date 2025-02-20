import handleStart from "./commands/start.js";
import handleProfile from "./commands/profile.js";
import handleHelp from "./commands/help.js";
import handleStats from "./commands/stats.js";
import handleBroadcast from "./commands/broadcast.js";
import handleSetRole from "./commands/setrole.js";
import handleMute from "./commands/mute.js";
import handleUnmute from "./commands/unmute.js";
import handleWarn from "./commands/warn.js";
import handleDM from "./commands/dm.js";
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
      } else if (text.startsWith("/help")) {
        return await handleHelp(message, env);
      } else if (text.startsWith("/stats")) {
        return await handleStats(message, env);
      } else if (text.startsWith("/broadcast")) {
        return await handleBroadcast(message, env);
      } else if (text.startsWith("/setrole")) {
        return await handleSetRole(message, env);
      } else if (text.startsWith("/mute")) {
        return await handleMute(message, env);
      } else if (text.startsWith("/unmute")) {
        return await handleUnmute(message, env);
      } else if (text.startsWith("/warn")) {
        return await handleWarn(message, env);
      } else if (text.startsWith("/dm")) {
        return await handleDM(message, env);
      } else {
        return await handleDefault(message, env);
      }
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
