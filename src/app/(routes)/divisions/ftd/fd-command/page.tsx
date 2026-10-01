import { canEditFtp as mayEditFtp } from "@/lib/role-config";
import { getSession } from "@/lib/session";

import { CommandTabs } from "./components/command-tabs";

/**
 * FTD Command, and the one tab not everyone gets.
 *
 * The page itself sits behind the permission matrix like any other; the FTP
 * tab is narrower, because editing it *commits to the repository* rather than
 * the store. That is decided here and in `/api/ftp` from roles - FTD Head,
 * Assistant Head of FTD and Command+, with the Discord admins in
 * `DISCORD_ADMIN_IDS` always in - and never from a matrix row, since the
 * permission editor must not be able to hand out the ability to write the
 * repository.
 *
 * Decided on the server, like every other nav entry in the app - the tab is
 * never rendered for a member who cannot open it, so nobody is offered a tool
 * that would then refuse them. The endpoint refuses them again regardless.
 */
export default async function CommandPage() {
  const session = await getSession();

  return (
    <CommandTabs
      canEditFtp={mayEditFtp(session?.roles ?? [], session?.discordId)}
    />
  );
}
