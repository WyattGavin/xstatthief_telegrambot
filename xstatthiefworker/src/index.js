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
import handleShadowban from "./commands/shadowban.js";
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

      if (text.startsWith("/start")) return handleStart(message, env);
      if (text.startsWith("/profile")) return handleProfile(message, env);
      if (text.startsWith("/help")) return handleHelp(message, env);
      if (text.startsWith("/stats")) return handleStats(message, env);
      if (text.startsWith("/broadcast")) return handleBroadcast(message, env);
      if (text.startsWith("/setrole")) return handleSetRole(message, env);
      if (text.startsWith("/mute")) return handleMute(message, env);
      if (text.startsWith("/unmute")) return handleUnmute(message, env);
      if (text.startsWith("/warn")) return handleWarn(message, env);
      if (text.startsWith("/dm")) return handleDM(message, env);
      if (text.startsWith("/shadowban")) return handleShadowban(message, env);
      
      return handleDefault(message, env);
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
