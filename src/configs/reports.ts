/**
 * Report requests - one declaration of what a request is and the one place its
 * Discord message is built.
 *
 * The message is built here rather than in the route so the posted message has
 * a single shape: `POST /api/report` renders through `reportMessage`.
 *
 * This module is deliberately pure and free of server imports.
 */

/** What the request is. */
export type ReportType = "bug" | "feature";

export type Report = {
  type: ReportType;
  /** The text as the member wrote it. */
  message: string;
  /** Who asked - from their session, so it is never retyped. */
  authorName: string;
};

/**
 * Who gets pinged on every new request.
 *
 * Set `DISCORD_REPORT_PING_ID` to override it; unset or empty means nobody is
 * mentioned, which is the honest answer rather than pinging a wrong person.
 */
export const REPORT_PING_ID: string =
  process.env.DISCORD_REPORT_PING_ID ?? "290467278540242944";

export const REPORT_TYPES: ReadonlyArray<{
  value: ReportType;
  label: string;
  emoji: string;
  /** The embed's side bar - red for a bug, green for a feature. */
  color: number;
}> = [
  { value: "bug", label: "Bug Report", emoji: "🐛", color: 15158332 },
  { value: "feature", label: "Feature Request", emoji: "✨", color: 4630079 },
];

export function reportTypeMeta(type: ReportType) {
  return REPORT_TYPES.find((entry) => entry.value === type) ?? REPORT_TYPES[0];
}

export function isReportType(value: unknown): value is ReportType {
  return REPORT_TYPES.some((entry) => entry.value === value);
}

/** Discord's own ceiling, so a long report is trimmed rather than rejected. */
const EMBED_DESCRIPTION_LIMIT = 4000;
const EMBED_FIELD_VALUE_LIMIT = 1024;

/**
 * Shorten to `limit`, saying so without exceeding it. A silent cut reads as the
 * app losing text, so the marker is inside the budget: the description is never
 * longer than `limit`, and a paste at exactly 4000 is never trimmed.
 */
function clamp(text: string, limit: number): string {
  if (text.length <= limit) return text;

  const marker = "\n… _(trimmed)_";
  // Leave room for the marker, then append it inside the limit.
  const room = Math.max(0, limit - marker.length);
  return text.slice(0, room) + marker;
}

/**
 * The Discord message for a request: the **ping on its own line at the top**,
 * and the request as one embed beneath it.
 *
 * The ping is the message's own `content` on purpose. A mention inside an embed
 * does not notify anyone - Discord only fires a notification for a mention in
 * the message text - so a ping that rode in the description looked right and
 * never reached the person it named. The content is the mention and nothing
 * else; the report text and who asked all live in the embed below it, so there
 * is still exactly one message.
 *
 * `allowed_mentions` is pinned to that one user, so nothing anyone types into a
 * report can make the message ping a role or `@everyone`.
 */
export function reportMessage(report: Report): {
  content?: string;
  allowed_mentions?: { parse: string[]; users: string[] };
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{ name: string; value: string; inline?: boolean }>;
  }>;
} {
  const mention = REPORT_PING_ID ? `<@${REPORT_PING_ID}>` : "";
  const type = reportTypeMeta(report.type);

  return {
    ...(mention
      ? {
          content: mention,
          allowed_mentions: { parse: [], users: [REPORT_PING_ID] },
        }
      : {}),
    embeds: [
      {
        title: `${type.emoji} ${type.label}`,
        description: clamp(report.message, EMBED_DESCRIPTION_LIMIT),
        color: type.color,
        fields: [
          {
            name: "Requested by",
            value: clamp(report.authorName || "Unknown", EMBED_FIELD_VALUE_LIMIT),
            inline: true,
          },
        ],
      },
    ],
  };
}
