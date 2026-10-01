"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  ClipboardCopy,
  ClipboardPaste,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  FTP_FORMATS,
  type FtpFormat,
  type FtpFormatKey,
} from "@/app/constants/divisions/ftd/ftp";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { updatePastedProfile } from "@/lib/ftp-profile-update";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BBCodeEditor } from "@/components/ui/bbcode-editor";

/**
 * Bringing a member's posted profile up to the FTP's current text.
 *
 * The FTP tab rewrites the repository; this tab rewrites nothing at all. It is
 * the other end of that pipeline: the wording has moved on, and the profiles
 * already posted on GOV have not. A trainer pastes a member's profile in, the
 * student information and each session's signature come back out of it, and
 * everything else is the FTP's own text - ready to copy and post again.
 */

function FormatCard({
  format,
  selected,
  onSelect,
}: {
  format: FtpFormat;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        selected
          ? "border-primary/50 bg-primary/10"
          : "border-border bg-surface/60 hover:bg-surface-hover",
      )}
    >
      <ClipboardPaste className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          Update {format.label}
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          Paste the member&apos;s current profile - the student information and
          the signatures are kept, the rest comes back in the FTP&apos;s own
          words. Press it again to close the box.
        </span>
      </span>
    </button>
  );
}

function ResultPanel({
  format,
  output,
  replaced,
  added,
  signaturesCarried,
  ticksCarried,
}: {
  format: FtpFormat;
  output: string;
  replaced: string[];
  added: string[];
  signaturesCarried: string[];
  ticksCarried: string[];
}) {
  const [text, setText] = useState(output);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-emerald-300/40 bg-emerald-50 px-3.5 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
          The {format.label} profile, updated
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="success">
            {replaced.length} section{replaced.length === 1 ? "" : "s"} updated
          </Badge>
          {added.length > 0 && (
            <Badge variant="muted">
              {added.length} added from the FTP
            </Badge>
          )}
          <Badge variant="muted">header kept</Badge>
          {signaturesCarried.length > 0 && (
            <Badge variant="muted">
              {signaturesCarried.length} signature
              {signaturesCarried.length === 1 ? "" : "s"} carried
            </Badge>
          )}
          {ticksCarried.length > 0 && (
            <Badge variant="muted">
              {ticksCarried.length} tick
              {ticksCarried.length === 1 ? "" : "s"} carried
            </Badge>
          )}
        </div>
        {added.length > 0 && (
          <p className="mt-2 text-[11px] text-emerald-800/85 dark:text-emerald-200/85">
            The paste had no {added.join(", ")} section, so it was taken fresh
            from the FTP - that is the FTP&apos;s newer shape, not something the
            paste lost.
          </p>
        )}
        <p className="mt-2 text-[11px] text-emerald-800/85 dark:text-emerald-200/85">
          The session paperwork comes from the FTP&apos;s blank template - fill
          the times, feedback and ratings in from the member&apos;s sessions as
          usual before posting.
        </p>
      </div>

      {/* No list of blanks here on purpose: a profile is the member's to fill
          in, and the template's own placeholders show where. */}

      <BBCodeEditor
        value={text}
        onChange={setText}
        rows={18}
        maxHeightClass="max-h-[55vh]"
        placeholder="The updated profile appears here."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          size="sm"
          onClick={() => void copyBBCode({ bbCodeText: text })}
        >
          <ClipboardCopy className="mr-1.5 h-3.5 w-3.5" />
          Copy the updated profile
        </Button>
        {format.board && (
          <a href={format.board.url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open {format.board.label} on GOV
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function UpdateProfilePanel({ format }: { format: FtpFormat }) {
  const [pasted, setPasted] = useState("");
  const [result, setResult] = useState<
    Extract<ReturnType<typeof updatePastedProfile>, { ok: true }> | null
  >(null);
  // Rebuilding replaces the result wholesale, so the output editor remounts
  // rather than showing the previous build's text as the starting value.
  const [build, setBuild] = useState(0);

  const buildProfile = () => {
    const outcome = updatePastedProfile(format.key, pasted);
    if (!outcome.ok) {
      toast.error(outcome.reason);
      return;
    }
    setResult(outcome);
    setBuild((value) => value + 1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface/60 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          Update a member&apos;s {format.label} profile
        </p>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
          Paste the member&apos;s whole current profile, exactly as it stands on
          the forum. The header - the student information - is kept as it is, and
          every other section is replaced with the FTP&apos;s own text: each
          session keeps the trainer who signed it and the ticks it had earned.
          Nothing here writes to the FTP or the repository.
        </p>
        <div className="mt-3">
          <BBCodeEditor
            value={pasted}
            onChange={(next) => {
              setPasted(next);
              setResult(null);
            }}
            rows={16}
            maxHeightClass="max-h-[45vh]"
            placeholder="Paste the member's whole profile here, from its first line."
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Button size="sm" disabled={!pasted.trim()} onClick={buildProfile}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Build the updated profile
          </Button>
          {format.board && (
            <a href={format.board.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open {format.board.label} on GOV
              </Button>
            </a>
          )}
        </div>
      </div>

      {result && (
        <ResultPanel
          key={build}
          format={format}
          output={result.output}
          replaced={result.replaced}
          added={result.added}
          signaturesCarried={result.signaturesCarried}
          ticksCarried={result.ticksCarried}
        />
      )}
    </div>
  );
}

export function UpdateProfiles() {
  // One card per declared format, in the FTP's own order - the same two
  // profiles the FTP tab updates, read from the same declaration.
  const [selected, setSelected] = useState<FtpFormatKey | null>(null);
  const format = FTP_FORMATS.find((entry) => entry.key === selected) ?? null;

  return (
    <div className="space-y-5">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      <div className="grid gap-3 sm:grid-cols-2">
        {FTP_FORMATS.map((entry) => (
          <FormatCard
            key={entry.key}
            format={entry}
            selected={selected === entry.key}
            onSelect={() => {
              setSelected(selected === entry.key ? null : entry.key);
            }}
          />
        ))}
      </div>

      {format && <UpdateProfilePanel key={format.key} format={format} />}
    </div>
  );
}
