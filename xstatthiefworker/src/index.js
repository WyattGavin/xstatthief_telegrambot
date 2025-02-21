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
import handleClear from "./commands/clear.js";
import handleDeleteAccount from "./commands/deleteaccount.js";
import handleDeleteUser from "./commands/deleteuser.js"; 
import handleDefault from "./commands/default.js";

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Use POST method", { status: 405 });
    }

    try {
      const update = await request.json();
      const message = update?.message;
      const text = message?.text?.trim();

      if (!message || !text) {
        return new Response("Invalid request", { status: 400 });
      }

      // ✅ Command Mapping for Cleaner Handling
      const commands = {
        "/start": handleStart,
        "/profile": handleProfile,
        "/help": handleHelp,
        "/stats": handleStats,
        "/broadcast": handleBroadcast,
        "/setrole": handleSetRole,
        "/mute": handleMute,
        "/unmute": handleUnmute,
        "/warn": handleWarn,
        "/dm": handleDM,
        "/shadowban": handleShadowban,
        "/clear": handleClear,
        "/deleteaccount": handleDeleteAccount,
        "/deleteuser": handleDeleteUser,
      };

      // ✅ Extract command (handles cases like `/command@botname`)
      const command = text.split(" ")[0].split("@")[0];

      if (commands[command]) {
        return commands[command](message, env);
      }

      return handleDefault(message, env);

    } catch (error) {
      console.error("Bot Error:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
