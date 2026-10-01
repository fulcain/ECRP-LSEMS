import { isDiscordAdmin } from "@/lib/role-config";
import { getSession } from "@/lib/session";

import { CommandTabs } from "./components/command-tabs";

/**
 * FTD Command, and the one tab not everyone gets.
 *
 * The page itself sits behind the permission matrix like any other; the Handbook
 * tab is narrower, because editing it *writes the repository* rather than the
 * store. That is decided here and in `/api/handbook` from `DISCORD_ADMIN_IDS`:
 * there is deliberately no matrix row for it, since the permission editor must
 * not be able to hand out the ability to write the source files.
 *
 * Decided on the server, like every other nav entry in the app - the tab is
 * never rendered for a member who cannot open it, so nobody is offered a tool
 * that would then refuse them. The endpoint refuses them again regardless.
 */
export default async function CommandPage() {
  const session = await getSession();

  return <CommandTabs canEditHandbook={isDiscordAdmin(session?.discordId)} />;
}
