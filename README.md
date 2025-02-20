# xstatthief_telegrambot

wrangler login

wrangler init - name the worker - hello world projects - javascript - deploy

create webhook for the telegram bot,

<BOT_TOKEN> made when you make bot in botfather in telegram
"long list of random letters & #'s"

<WORKER_URL> made when you make the worker bash wrangler deploy and it will show as
https://info.workers.dev

curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<WORKER_URL>"


setting up your db

wrangler d1 create mediathief_db

wrangler d1 execute mediathief_db --remote --command "
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    language TEXT,
    date_joined TEXT,
    role TEXT DEFAULT 'user'
);"

you will also need to update your wrangler.jsonc
add,

  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mediathief_db",
      "database_id": "N/A"
    }
  ]

wrangler d1 execute mediathief_db --remote --command "
CREATE TABLE IF NOT EXISTS mutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    mute_until TEXT
);
CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT,
    moderator_id TEXT,
    reason TEXT,
    issued_at TEXT
);
"

added warnings and mute