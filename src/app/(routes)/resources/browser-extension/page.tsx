import { Ban, Check, Sparkles, Wrench } from "lucide-react";

import { readExtensionSummary } from "@/lib/extension-download";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ExtensionInstallCard } from "./components/ExtensionInstallCard";

/**
 * Where a member installs the browser extension and reads what it does.
 *
 * The version and file count come from the archive the download button hands
 * out, so this page can't advertise an extension the repo no longer has.
 */
export default async function BrowserExtensionPage() {
  const summary = await readExtensionSummary();
  // Set once the store listing is live and the card stops asking people to unzip
  // anything. Unset here and the page falls back to the folder download.
  const storeUrl = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL?.trim() || null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="LSEMS Resources"
        title="Browser Extension"
        subtitle="A one-time install that turns every Copy & Open button into a ready-to-fill GOV post: open the page, press Fill, and the title, recipients and BBCode are written in for you to review and Submit."
      />

      <div className="space-y-6">
        <ExtensionInstallCard
          version={summary?.version ?? "1.0.0"}
          fileCount={summary?.fileCount ?? 0}
          available={summary !== null}
          storeUrl={storeUrl}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="panel p-5">
            <SectionHeading
              icon={<Sparkles className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />}
              title="What it fills"
            />
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                "The LOA request form: your title and the body, into the LOA section when you press Fill.",
                "Meeting agendas: the subject line and the agenda, written into the meeting's own section when you press Fill.",
                "Promotion and resignation steps: the title and the body both land on Fill, whichever of the step's two copy buttons you pressed.",
                "LOA approvals, discharge notices and other replies you post by hand today - they land in the thread you open, on Fill.",
                "BLS course reports: open the report topic's quick reply and press Fill.",
                "Division email templates: the GOV private-message composer, with the recipient and subject set once you press Fill.",
                "FTO creation requests, into the section they belong in.",
                "Anything else you copy: a GOV editor with nothing prepared for it offers one button, Fill from clipboard, so a tool that hasn't been wired up still works. A title copied on its own goes into the subject box rather than into the post.",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Chrome will list one permission worth knowing about - reading what you
              copy and paste - and that is only the clipboard fallback above: it is
              read when you press that button, never on its own. The bar in the corner
              of the GOV page always says where the prepared post is going and which
              tool prepared it, so nothing is a surprise.
              <span className="font-medium text-foreground"> Alt</span>+
              <span className="font-medium text-foreground">Shift</span>+
              <span className="font-medium text-foreground">F</span> fills the
              page you are looking at, any time.
            </p>
          </section>

          <section className="panel p-5">
            <SectionHeading
              icon={<Ban className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
              title="What it never does"
            />
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                "It never posts. There is no code in it that presses Submit, on any page, under any setting - that click stays yours.",
                "It never runs anywhere else. The extension is limited to gov.eclipse-rp.net and this app's own site.",
                "It never reads Discord, messages or other tabs. All it receives is the post the app hands it when you press a copy button.",
                "It never writes anything you did not ask for. Nothing is filled on a page load, not even a post prepared for that page: you press Fill, and a reload or the forum's own Preview cannot touch what is in the editor.",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl border border-border bg-surface-hover/40 p-3 text-xs text-muted-foreground">
              A prepared post sits in this browser&apos;s extension storage until
              it is filled and you tell it to forget it, or until the next Copy
              &amp; Open replaces it. The popup can clear it at any time.
            </p>
          </section>
        </div>

        <section className="panel p-5">
          <SectionHeading
            icon={<Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            title="When it doesn't work"
          />
          <dl className="mt-3 grid grid-cols-1 gap-4 text-sm lg:grid-cols-2">
            <Faq
              question="Nothing happened on the GOV page."
              answer="Press Fill on the bar in the page's corner: nothing is written until you do. If the bar is not there, check the post was prepared in this same browser profile, that the extension is enabled, and whether the page is the section the post was aimed at. Alt+Shift+F fills it regardless."
            />
            <Faq
              question="Nothing filled itself when the page opened."
              answer="Only a post a Copy & Open button prepared fills on its own, and it never replaces text that is already in the editor. Everything else is filled when you press Fill from clipboard on the bar, or Alt+Shift+F: a clipboard still holding an older post would otherwise fill the wrong page."
            />
            <Faq
              question="It filled the body but not the title."
              answer="That post has no title to give: some steps copy a title separately from a body. Copy the title too and it goes into the subject field."
            />
            <Faq
              question="A field stayed empty."
              answer="The forum may have renamed an input. Send the page's field names - the list to fix is in extension/README.md, and it is a one-line change."
            />
            <Faq
              question="I edited the extension and nothing changed."
              answer="Content scripts load once per page, so press reload on the extension's card and then reload the GOV tab."
            />
            <Faq
              question="The console shows a TypeError from the extension."
              answer="That comes from a copy older than the one this page installs - either a tab that outlived an update (reload it) or a second, older copy still loaded. If two versions are listed in the card above, remove the older one at chrome://extensions."
            />
          </dl>
        </section>
      </div>
    </PageContainer>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-hover/30 p-3">
      <dt className="text-xs font-medium text-foreground">{question}</dt>
      <dd className="mt-1 text-xs text-muted-foreground">{answer}</dd>
    </div>
  );
}
