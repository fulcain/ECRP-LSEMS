"use client";

import { useEffect, useMemo, useState } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { Copy, ExternalLink, RotateCcw } from "lucide-react";

import { divisions } from "@/app/constants/divisions";
import {
  DISCUSSION_BOARDS,
  type DiscussionBoardKey,
} from "@/app/constants/divisions/discussion-boards";
import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import {
  applyLiveFields,
  generateDiscussionBoardBody,
} from "@/app/templates/general/division-emails";
import { Button } from "@/components/ui/button";
import { BBCodeEditor } from "@/components/ui/bbcode-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** The draft, as it is kept in this browser. */
type StoredDraft = {
  subject: string;
  body: string;
  /** True once the member has typed into the body, so it stops following the template. */
  edited: boolean;
};

function draftKey(boardKey: DiscussionBoardKey): string {
  return `discussion-board:${boardKey}`;
}

/** Read the draft straight from storage: it has to be the *stored* value the
 *  first render after mount sees, before anything writes over it. */
function readDraft(boardKey: DiscussionBoardKey): StoredDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(boardKey));
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch (error) {
    console.error("Error reading the stored discussion board draft:", error);
    return null;
  }
}

/**
 * One discussion board: a subject, a post, and the two ways to send it to GOV.
 *
 * The body starts as the division's own template built the way the Division
 * Templates page builds it with both signature boxes ticked - no body
 * signature and no closing sign box - so the post carries the division's header
 * and nothing that belongs to a letter. The subject names that header as it is
 * typed, and rides along into the posting page's own subject field when the
 * extension fills it.
 *
 * Every board is the same component: the forum it posts to, the section it
 * belongs to and the division whose template it wears are the board's own
 * declaration (`constants/divisions/discussion-boards.ts`).
 */
export function DiscussionBoardComposer({
  boardKey,
  className,
}: {
  boardKey: DiscussionBoardKey;
  className?: string;
}) {
  const board = DISCUSSION_BOARDS[boardKey];
  const { medicCredentials } = useMedic();
  const division = divisions.find((entry) => entry.key === board.division);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [edited, setEdited] = useState(false);
  const [restored, setRestored] = useState(false);

  const date = useMemo(() => getCurrentDateFormatted(), []);
  const generated = useMemo(
    () =>
      generateDiscussionBoardBody({
        medicCredentials: { ...medicCredentials },
        division: division?.data,
        divisionLabel: division?.label,
        subject: subject.trim(),
        date,
      }),
    [medicCredentials, division, subject, date],
  );

  // Adopt the stored draft before the template fill below runs, so a refresh
  // lands back on what the member wrote rather than on a fresh template.
  useEffect(() => {
    const saved = readDraft(boardKey);
    if (saved) {
      setSubject(saved.subject ?? "");
      setBody(saved.body ?? "");
      setEdited(Boolean(saved.edited));
    }
    setRestored(true);
  }, [boardKey]);

  // Until the body is edited it *is* the template, so filling the subject in
  // above names the header without the member touching the same text twice.
  // Afterwards the body is theirs and only the title line follows.
  useEffect(() => {
    if (!restored) return;
    setBody((previous) =>
      edited
        ? previous
          ? applyLiveFields(previous, subject.trim(), "", date)
          : generated
        : generated,
    );
  }, [restored, edited, generated, subject, date]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(
        draftKey(boardKey),
        JSON.stringify({ subject, body, edited } satisfies StoredDraft),
      );
    } catch (error) {
      console.error("Error saving the discussion board draft:", error);
    }
  }, [restored, boardKey, subject, body, edited]);

  const post = {
    subject: subject.trim() || undefined,
    url: board.url,
    feature: `the ${board.label} composer`,
  };

  return (
    <Card className={className}>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar transition={Bounce} />
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{board.label}</CardTitle>
        <p className="text-xs text-muted-foreground">{board.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${boardKey}-subject`}>Subject</Label>
          <Input
            id={`${boardKey}-subject`}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="What the topic is about"
          />
        </div>

        <div className="space-y-2">
          <Label>Post</Label>
          <BBCodeEditor
            value={body}
            onChange={(value) => {
              setBody(value);
              setEdited(true);
            }}
            rows={14}
            placeholder="Write the post here - the toolbar inserts BBCode tags."
          />
          <p className="text-[11px] text-muted-foreground">
            Pre-filled from the {division?.label ?? "division"} template without
            the body signature or the closing sign box. Edit it freely - the
            subject still names the header.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              copyBBCodeAndOpen({ bbCodeText: body, url: board.url, post })
            }
            disabled={!body.trim()}
          >
            <ExternalLink className="h-4 w-4" />
            Copy &amp; Open GOV
          </Button>
          <Button
            variant="outline"
            onClick={() => copyBBCode({ bbCodeText: body, post })}
            disabled={!body.trim()}
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setEdited(false);
              toast.info("Post reset to the division template.", {
                theme: "dark",
              });
            }}
            disabled={!edited}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
