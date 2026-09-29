"use client";

import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import {
  forumPostToast,
  handOffAndOpenForumPost,
} from "@/app/helpers/forumHandoff";
import {
  generateLOARequestBody,
  generateLOATitle,
  GOV_LOA_POST_URL,
} from "@/app/templates/loa-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BuilderField,
  BuilderForm,
  BuilderOutput,
  BuilderPreview,
  BuilderRequirement,
  BuilderSection,
  BuilderShell,
  BuilderTitleRow,
} from "@/components/builder/builder-layout";
import {
  AlertTriangle,
  CalendarDays,
  Copy,
  ExternalLink,
  FileText,
  RotateCcw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

export function LOATemplate() {
  const { medicCredentials } = useMedic();

  // Kept in local storage: a request is written over minutes, and anything typed
  // here used to be gone on a refresh. The touched flags stay in session state,
  // because they only govern what the staff page is allowed to autofill.
  const [rank, setRank, rankLoaded] = useLocalStorage<string>("loa-request-rank", "");
  const [firstName, setFirstName, firstNameLoaded] = useLocalStorage<string>(
    "loa-request-first-name",
    "",
  );
  const [lastName, setLastName, lastNameLoaded] = useLocalStorage<string>(
    "loa-request-last-name",
    "",
  );
  const [startDate, setStartDate] = useLocalStorage<string>(
    "loa-request-start-date",
    "",
  );
  const [endDate, setEndDate] = useLocalStorage<string>(
    "loa-request-end-date",
    "",
  );
  const [icReason, setIcReason] = useLocalStorage<string>("loa-request-ic-reason", "");
  const [oocReason, setOocReason] = useLocalStorage<string>(
    "loa-request-ooc-reason",
    "",
  );

  // Auto-fill from the staff page until the user edits a field, so fields
  // populate even though credentials hydrate from localStorage after mount.
  const [rankTouched, setRankTouched] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);

  // The staff page fills a field only while it is still empty. A value that came
  // back from storage was typed by the member, and must not be overwritten by a
  // form that is just offering a default.
  useEffect(() => {
    if (!rankLoaded || rankTouched || rank) return;
    if (medicCredentials.rank) setRank(medicCredentials.rank);
  }, [rankLoaded, rank, rankTouched, medicCredentials.rank, setRank]);

  useEffect(() => {
    if (!firstNameLoaded || !lastNameLoaded) return;
    const { firstName: first, lastName: last } = splitName(
      medicCredentials.name,
    );
    if (!firstNameTouched && first && !firstName) setFirstName(first);
    if (!lastNameTouched && last && !lastName) setLastName(last);
  }, [
    medicCredentials.name,
    firstNameTouched,
    lastNameTouched,
    firstNameLoaded,
    lastNameLoaded,
    firstName,
    lastName,
    setFirstName,
    setLastName,
  ]);

  const isCredentialsEmpty =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  const resetFromCredentials = () => {
    setRank(medicCredentials.rank);
    const { firstName: first, lastName: last } = splitName(
      medicCredentials.name,
    );
    setFirstName(first);
    setLastName(last);
    setRankTouched(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
  };

  const context = {
    rank: rank.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    icReason: icReason.trim(),
    oocReason: oocReason.trim(),
  };

  const title = generateLOATitle(context);
  const body = generateLOARequestBody(context);

  // Both reasons are required before anything can be copied.
  const reasonsComplete = Boolean(context.icReason && context.oocReason);

  // Both copies are a GOV post in the making, so the browser extension gets the
  // title and the section with them.
  const loaPost = {
    subject: title,
    url: GOV_LOA_POST_URL,
    feature: "the LOA request form",
  };

  const handleCopyTemplate = () => {
    if (!reasonsComplete) return;
    copyBBCode({ bbCodeText: body, post: loaPost });
  };

  // The link around this button is what opens the posting page, so the post is
  // marked as that page's: it pastes itself in once as it loads. A plain Copy
  // leaves it for the shortcut instead.
  const handleCopyToGov = () => {
    if (!reasonsComplete) return;
    const handedOff = handOffAndOpenForumPost(loaPost, body);
    navigator.clipboard
      .writeText(body)
      .then(() =>
        toast.success(
          forumPostToast(
            handedOff,
            "BBCode copied - opening the LOA posting page...",
            true,
          ),
        ),
      )
      .catch(() => toast.error("Failed to copy!"));
  };

  const handleCopyTitle = () => {
    if (!reasonsComplete) return;
    copyBBCode({ bbCodeText: title, post: { ...loaPost, bbcode: "" } });
  };

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        transition={Bounce}
      />

      <BuilderShell>
        {/* Left: Form */}
        <BuilderForm>
          {/* Employee Information */}
          <BuilderSection icon={Users} title="Employee Information">
          <BuilderField label="Rank">
            <Input
              value={rank}
              onChange={(e) => {
                setRank(e.target.value);
                setRankTouched(true);
              }}
              placeholder="e.g. Senior Paramedic"
            />
          </BuilderField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BuilderField label="First Name">
              <Input
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFirstNameTouched(true);
                }}
                placeholder="First name"
              />
            </BuilderField>
            <BuilderField label="Last Name">
              <Input
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setLastNameTouched(true);
                }}
                placeholder="Last name"
              />
            </BuilderField>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFromCredentials}
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Staff Page
          </Button>
        </BuilderSection>

          {/* Leave Dates */}
          <BuilderSection icon={CalendarDays} title="Leave of Absence Dates">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BuilderField label="Beginning Date">
                <Input
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value.toUpperCase())}
                  placeholder="DD/MMM/YYYY (e.g. 20/JUL/2026)"
                  className="font-mono"
                />
              </BuilderField>
              <BuilderField label="Return Date">
                <Input
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value.toUpperCase())}
                  placeholder="DD/MMM/YYYY (e.g. 20/AUG/2026)"
                  className="font-mono"
                />
              </BuilderField>
            </div>
          </BuilderSection>

          {/* Reasons */}
          <BuilderSection
            icon={FileText}
            title="Reason"
            hint="Reason does not have to be too specific, but please leave both an IC and OOC reason."
          >
            <BuilderField label="IC Reason">
              <Textarea
                value={icReason}
                onChange={(e) => setIcReason(e.target.value)}
                placeholder="In-character reason for the leave of absence"
                rows={3}
                className="resize-y"
              />
            </BuilderField>

            <BuilderField
              label="OOC Reason"
              hint={
                <>
                  Placed after the IC reason inside <code>(( ... ))</code>.
                </>
              }
            >
              <Textarea
                value={oocReason}
                onChange={(e) => setOocReason(e.target.value)}
                placeholder="Out-of-character reason - wrapped in (( ... )) with [ooc][/ooc]"
                rows={3}
                className="resize-y"
              />
            </BuilderField>
          </BuilderSection>

          {/* Credentials Warning */}
          {isCredentialsEmpty && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Staff credentials not set
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Set your name, signature, and rank in the{" "}
                  <Link
                    href="/workspace/staff"
                    className="underline transition-colors hover:text-amber-300"
                  >
                    Staff Page
                  </Link>{" "}
                  so the rank and name auto-fill.
                </p>
              </div>
            </div>
          )}
        </BuilderForm>

        {/* Right: Preview */}
        <BuilderPreview
          icon={FileText}
          title="Post Preview"
          badge="LOA"
          actions={
            <>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleCopyTemplate}
                disabled={!reasonsComplete}
                className="w-full"
              >
                <Copy className="h-4 w-4" />
                Copy Template
              </Button>

              <Link
                href={GOV_LOA_POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  type="button"
                  size="lg"
                  onClick={handleCopyToGov}
                  disabled={!reasonsComplete}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  Copy to GOV
                </Button>
              </Link>
            </>
          }
          note="Copy to GOV copies the template and opens the LOA posting page with it: the title and the body are written into the post for you, ready to review and submit."
        >
          <BuilderTitleRow
            label="Post Title"
            value={title}
            onCopy={handleCopyTitle}
            copyLabel="Copy Title"
            disabled={!title || !reasonsComplete}
          />

          <BuilderOutput label="Template Body" value={body} />

          {!reasonsComplete && (
            <BuilderRequirement>
              Fill in both the IC and OOC reasons to enable the copy buttons.
            </BuilderRequirement>
          )}
        </BuilderPreview>
      </BuilderShell>
    </div>
  );
}