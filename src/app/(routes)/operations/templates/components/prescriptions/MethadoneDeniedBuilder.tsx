"use client";

import { copyBBCode } from "@/app/helpers/copyBBCode";
import {
  forumPostToast,
  handOffAndOpenForumPost,
} from "@/app/helpers/forumHandoff";
import { generateMethadoneDeniedBody } from "@/app/templates/prescription";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/builder/builder-layout";
import { Ban, Copy, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  INPUT_LIMITS,
  validateName,
  validateText,
  validateUrl,
  validationMessage,
} from "@/lib/validation";

export function MethadoneDeniedBuilder() {
  const [patientName, setPatientName] = useLocalStorage<string>(
    "methadone-denied-patient",
    "",
  );
  const [reason, setReason] = useLocalStorage<string>(
    "methadone-denied-reason",
    "",
  );
  const [banned, setBanned] = useLocalStorage<boolean>(
    "methadone-denied-ban",
    false,
  );
  const [patientFileUrl, setPatientFileUrl] = useLocalStorage<string>(
    "methadone-denied-patient-file-url",
    "",
  );

  const context = {
    patientName: patientName.trim(),
    reason: reason.trim(),
    banned,
  };

  const body = generateMethadoneDeniedBody(context);

  const formErrors: Record<string, string> = {};
  const nameError = validationMessage(
    validateName(context.patientName, "Patient's name"),
  );
  if (nameError) formErrors.patientName = nameError;
  const reasonError = validationMessage(
    validateText(context.reason, "Reason", {
      max: INPUT_LIMITS.notes,
      multiline: true,
    }),
  );
  if (reasonError) formErrors.reason = reasonError;
  const complete = Object.keys(formErrors).length === 0;

  // Copy & Open posts into the patient's file, so it waits for its link - an
  // empty field is not a link, however optional the field itself is.
  const patientFileLink = patientFileUrl.trim()
    ? validateUrl(patientFileUrl, "Patient profile link")
    : null;
  const hasPatientFileLink = patientFileLink?.ok === true;
  const patientFileUrlError = patientFileLink
    ? validationMessage(patientFileLink)
    : undefined;

  const post = {
    url: patientFileUrl.trim(),
    feature: "the methadone denial",
  };

  const handleCopyTemplate = () => {
    if (!complete) return;
    copyBBCode({ bbCodeText: body, post });
  };

  const handleCopyToGov = () => {
    if (!complete || !hasPatientFileLink) return;
    const handedOff = handOffAndOpenForumPost(post, body);
    navigator.clipboard
      .writeText(body)
      .then(() =>
        toast.success(
          forumPostToast(
            handedOff,
            "BBCode copied - opening the prescription posting page...",
            true,
          ),
        ),
      )
      .catch(() => toast.error("Failed to copy!"));
  };

  return (
    <div className="space-y-6">
      <BuilderShell>
        <BuilderForm>
          <BuilderSection icon={Ban} title="Denial">
            <BuilderField label="Patient's name">
              <Input
                value={patientName}
                maxLength={INPUT_LIMITS.name}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Fname Lname"
              />
            </BuilderField>
            <BuilderField label="Reason">
              <Textarea
                value={reason}
                maxLength={INPUT_LIMITS.notes}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why the prescription was denied"
                rows={4}
                className="resize-y"
              />
            </BuilderField>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background/40 p-3">
              <Checkbox
                checked={banned}
                onCheckedChange={(checked) => setBanned(checked === true)}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-foreground">
                Methadone ban
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  Tick to print Yes, leave it clear to print No.
                </span>
              </span>
            </label>
          </BuilderSection>

          <BuilderSection
            icon={FileText}
            title="Personnel file"
            hint="Copy & Open GOV opens the patient's file and pastes the denial into it."
          >
            <BuilderField
              label="Patient profile link"
              hint={
                patientFileUrlError ??
                "Copy & Open GOV opens this page and pastes the denial into it. It stays disabled until this link is filled in."
              }
            >
              <Input
                value={patientFileUrl}
                maxLength={INPUT_LIMITS.url}
                onChange={(e) => setPatientFileUrl(e.target.value)}
                placeholder="https://gov.eclipse-rp.net/viewtopic.php?t=..."
              />
            </BuilderField>
          </BuilderSection>
        </BuilderForm>

        <BuilderPreview
          icon={FileText}
          title="Post Preview"
          badge="Methadone Denied"
          actions={
            <>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleCopyTemplate}
                disabled={!complete}
                className="w-full"
              >
                <Copy className="h-4 w-4" />
                Copy Template
              </Button>

              {hasPatientFileLink ? (
                <Link
                  href={patientFileUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleCopyToGov}
                    disabled={!complete}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Copy &amp; Open GOV
                  </Button>
                </Link>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  disabled
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  Copy &amp; Open GOV
                </Button>
              )}
            </>
          }
          note="Copy & Open GOV copies the denial and opens the patient's file with the body filled in for you; it needs the patient profile link above."
        >
          <BuilderOutput label="Template Body" value={body} />

          {!complete && (
            <BuilderRequirement>
              {Object.values(formErrors)[0] ??
                (hasPatientFileLink
                  ? "Fill in every field to enable the copy buttons."
                  : "Add the patient profile link to enable Copy & Open GOV.")}
            </BuilderRequirement>
          )}
        </BuilderPreview>
      </BuilderShell>
    </div>
  );
}
