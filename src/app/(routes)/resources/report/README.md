# Report page

Public page at `/resources/report` for sending bug reports and feature requests to the developer, who is notified through Discord.

One environment variable is required:

- `DISCORD_WEBHOOK_URL`

The page sends:

- `type`: `bug` or `feature`
- `message`: the report text

The notification is an embed with the matching label and color.
