"use client";

import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import {
  forumPostToast,
  handOffAndOpenForumPost,
} from "@/app/helpers/forumHandoff";
import {
  METHADONE_DEFAULT_REASON,
  generateMethadoneBody,
  generateMethadoneProfileEntry,
} from "@/app/templates/prescription";
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
import {
  CalendarDays,
  ClipboardCopy,
  Copy,
  ExternalLink,
  FileText,
  Pencil,
  Pill,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  INPUT_LIMITS,
  validateDateString,
  validateName,
  validateText,
  validateTimeString,
  validateUrl,
  validationMessage,
} from "@/lib/validation";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const utcDate = (now: Date): string =>
  `${String(now.getUTCDate()).padStart(2, "0")}/${MONTHS[now.getUTCMonth()]}/${now.getUTCFullYear()}`;

const utcTime = (now: Date): string => {
  const hours = now.getUTCHours();
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(twelve).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} ${suffix}`;
};

/**
 * A value the Staff Page already knows, editable only once the member says so -
 * the credentials are a starting point, not a lock on the field.
 */
function CredentialField({
  label,
  value,
  onChange,
  placeholder,
  onEdit,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onEdit: () => void;
  maxLength: number;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <BuilderField
      label={label}
      hint={
        editing ? undefined : "Taken from the Staff Page - press Edit to change it."
      }
    >
      <div className="flex gap-2">
        <Input
          value={value}
          maxLength={maxLength}
          readOnly={!editing}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={editing ? undefined : "bg-muted/40"}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => {
            setEditing((prev) => !prev);
            onEdit();
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
          {editing ? "Done" : "Edit"}
        </Button>
      </div>
    </BuilderField>
  );
}

export function MethadonePrescriptionBuilder() {
  const { medicCredentials } = useMedic();

  const [issuingEmployee, setIssuingEmployee] = useLocalStorage<string>(
    "methadone-employee",
    "",
  );
  const [employeeRank, setEmployeeRank] = useLocalStorage<string>(
    "methadone-rank",
    "",
  );
  const [date, setDate] = useLocalStorage<string>("methadone-date", "");
  const [time, setTime] = useLocalStorage<string>("methadone-time", "");
  const [patientName, setPatientName] = useLocalStorage<string>(
    "methadone-patient-name",
    "",
  );
  const [patientPhoneNumber, setPatientPhoneNumber] = useLocalStorage<string>(
    "methadone-patient-phone",
    "",
  );
  const [drugsFound, setDrugsFound] = useLocalStorage<string>(
    "methadone-drugs",
    "",
  );
  const [reason, setReason] = useLocalStorage<string>("methadone-reason", "");
  const [amount, setAmount] = useLocalStorage<string>(
    "methadone-amount",
    "1 box",
  );
  const [educated, setEducated] = useLocalStorage<boolean>(
    "methadone-educated",
    false,
  );
  const [postUrl, setPostUrl] = useLocalStorage<string>(
    "methadone-post-url",
    "",
  );
  const [patientFileUrl, setPatientFileUrl] = useLocalStorage<string>(
    "methadone-patient-file-url",
    "",
  );

  // The credentials hydrate after mount, so the fields fill only while empty.
  const [identityTouched, setIdentityTouched] = useState(false);
  useEffect(() => {
    if (identityTouched) return;
    if (!medicCredentials.name && !medicCredentials.rank) return;
    setIssuingEmployee((prev) => prev || medicCredentials.name);
    setEmployeeRank((prev) => prev || medicCredentials.rank);
  }, [
    identityTouched,
    medicCredentials.name,
    medicCredentials.rank,
    setIssuingEmployee,
    setEmployeeRank,
  ]);

  const context = {
    issuingEmployee: issuingEmployee.trim(),
    employeeRank: employeeRank.trim(),
    date: date.trim(),
    time: time.trim(),
    patientName: patientName.trim(),
    patientPhoneNumber: patientPhoneNumber.trim(),
    drugsFound: drugsFound.trim(),
    reason: reason.trim(),
    amount: amount.trim(),
    educated,
    postUrl: postUrl.trim(),
    patientFileUrl: patientFileUrl.trim(),
  };

  const body = generateMethadoneBody(context);

  const formErrors: Record<string, string> = {};
  const employeeError = validationMessage(
    validateName(context.issuingEmployee, "Issuing employee"),
  );
  if (employeeError) formErrors.issuingEmployee = employeeError;
  const rankError = validationMessage(
    validateName(context.employeeRank, "Employee rank"),
  );
  if (rankError) formErrors.employeeRank = rankError;
  const dateError = validationMessage(validateDateString(context.date, "Date"));
  if (dateError) formErrors.date = dateError;
  const timeError = validationMessage(validateTimeString(context.time, "Time"));
  if (timeError) formErrors.time = timeError;
  const patientError = validationMessage(
    validateName(context.patientName, "Patient's name"),
  );
  if (patientError) formErrors.patientName = patientError;
  const phoneError = validationMessage(
    validateText(context.patientPhoneNumber, "Patient's phone number", {
      max: INPUT_LIMITS.short,
      allowMarkup: false,
    }),
  );
  if (phoneError) formErrors.patientPhoneNumber = phoneError;
  const drugsError = validationMessage(
    validateText(context.drugsFound, "Drugs found upon testing", {
      max: INPUT_LIMITS.notes,
      multiline: true,
    }),
  );
  if (drugsError) formErrors.drugsFound = drugsError;
  const reasonError = validationMessage(
    validateText(context.reason, "Prescription reason", {
      required: false,
      max: INPUT_LIMITS.notes,
      multiline: true,
    }),
  );
  if (reasonError) formErrors.reason = reasonError;
  const amountError = validationMessage(
    validateText(context.amount, "Amount issued", {
      max: INPUT_LIMITS.short,
      allowMarkup: false,
    }),
  );
  if (amountError) formErrors.amount = amountError;
  const postUrlError = validationMessage(
    validateUrl(context.postUrl, "Methadone post link", { required: false }),
  );
  if (postUrlError) formErrors.postUrl = postUrlError;
  const complete = Object.keys(formErrors).length === 0;

  // Copy & Open posts into the patient's file, so it waits for its link - an
  // empty field is not a link, however optional the field itself is.
  const patientFileLink = context.patientFileUrl
    ? validateUrl(context.patientFileUrl, "Patient file link")
    : null;
  const hasPatientFileLink = patientFileLink?.ok === true;
  const patientFileUrlError = patientFileLink
    ? validationMessage(patientFileLink)
    : undefined;

  const post = {
    url: context.patientFileUrl,
    feature: "the methadone prescription",
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

  const profileEntryUrl = validateUrl(context.postUrl, "Methadone post link");
  const profileEntry = generateMethadoneProfileEntry({
    postUrl: context.postUrl,
    date: context.date,
    amount: context.amount,
    issuingEmployee: context.issuingEmployee,
  });

  const handleCopyProfileEntry = () => {
    if (!complete || !profileEntryUrl.ok) return;
    copyBBCode({ bbCodeText: profileEntry });
  };

  return (
    <div className="space-y-6">
      <BuilderShell>
        <BuilderForm>
          <BuilderSection icon={Pill} title="Issued by">
            <CredentialField
              label="Issuing Employee"
              value={issuingEmployee}
              maxLength={INPUT_LIMITS.name}
              onChange={setIssuingEmployee}
              onEdit={() => setIdentityTouched(true)}
              placeholder="Fname Lname"
            />
            <CredentialField
              label="Employee Rank"
              value={employeeRank}
              maxLength={INPUT_LIMITS.name}
              onChange={setEmployeeRank}
              onEdit={() => setIdentityTouched(true)}
              placeholder="Full rank (e.g. Paramedic)"
            />
          </BuilderSection>

          <BuilderSection icon={CalendarDays} title="When">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BuilderField label="Date">
                <div className="flex gap-2">
                  <Input
                    value={date}
                    maxLength={INPUT_LIMITS.short}
                    onChange={(e) => setDate(e.target.value.toUpperCase())}
                    placeholder="DD/MMM/YYYY"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => setDate(utcDate(new Date()))}
                    title="Fills in today's date (UTC)"
                  >
                    Today
                  </Button>
                </div>
              </BuilderField>
              <BuilderField label="Time (( UTC ))">
                <div className="flex gap-2">
                  <Input
                    value={time}
                    maxLength={INPUT_LIMITS.short}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="00:00 AM/PM"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => setTime(utcTime(new Date()))}
                    title="Fills in the current time (UTC)"
                  >
                    Now
                  </Button>
                </div>
              </BuilderField>
            </div>
          </BuilderSection>

          <BuilderSection icon={User} title="Encounter details">
            <BuilderField label="Patient's name">
              <Input
                value={patientName}
                maxLength={INPUT_LIMITS.name}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Fname Lname"
              />
            </BuilderField>
            <BuilderField label="Patient's phone number">
              <Input
                value={patientPhoneNumber}
                maxLength={INPUT_LIMITS.short}
                onChange={(e) => setPatientPhoneNumber(e.target.value)}
                placeholder="e.g. 555-0123"
              />
            </BuilderField>
            <BuilderField label="Drugs found upon testing">
              <Textarea
                value={drugsFound}
                maxLength={INPUT_LIMITS.notes}
                onChange={(e) => setDrugsFound(e.target.value)}
                placeholder="What the drug test confirmed"
                rows={3}
                className="resize-y"
              />
            </BuilderField>
            <BuilderField
              label="Prescription issued because"
              hint={`Optional - left empty it says "${METHADONE_DEFAULT_REASON}".`}
            >
              <Textarea
                value={reason}
                maxLength={INPUT_LIMITS.notes}
                onChange={(e) => setReason(e.target.value)}
                placeholder={METHADONE_DEFAULT_REASON}
                rows={2}
                className="resize-y"
              />
            </BuilderField>
            <BuilderField
              label="Amount issued"
              hint="One box/pack of methadone contains 10 (ten) pills."
            >
              <Input
                value={amount}
                maxLength={INPUT_LIMITS.short}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1 box"
              />
            </BuilderField>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background/40 p-3">
              <Checkbox
                checked={educated}
                onCheckedChange={(checked) => setEducated(checked === true)}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-foreground">
                Has the patient been educated on methadone usage and the
                potential dangers of misuse?
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  Tick only if you explained the usage and the risks - the form
                  prints Yes when ticked and No when not.
                </span>
              </span>
            </label>
          </BuilderSection>

          <BuilderSection
            icon={FileText}
            title="Personnel file"
            hint="The patient's file is where Copy & Open posts this prescription, so it needs its link; the methadone post link is what the copied entry points at."
          >
            <BuilderField
              label="Patient file link"
              hint={
                patientFileUrlError ??
                "Copy & Open GOV opens this page and pastes the prescription into it. It stays disabled until this link is filled in."
              }
            >
              <Input
                value={patientFileUrl}
                maxLength={INPUT_LIMITS.url}
                onChange={(e) => setPatientFileUrl(e.target.value)}
                placeholder="https://gov.eclipse-rp.net/viewtopic.php?t=..."
              />
            </BuilderField>
            <BuilderField label="Methadone post link">
              <Input
                value={postUrl}
                maxLength={INPUT_LIMITS.url}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://gov.eclipse-rp.net/viewtopic.php?p=..."
              />
            </BuilderField>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Profile entry
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyProfileEntry}
                  disabled={!complete || !profileEntryUrl.ok}
                  className="h-7 px-2 text-[10px]"
                >
                  <ClipboardCopy className="h-3 w-3" />
                  Copy entry
                </Button>
              </div>
              <pre className="max-h-40 overflow-auto rounded-xl border border-border bg-background/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                {profileEntry}
              </pre>
            </div>
          </BuilderSection>
        </BuilderForm>

        <BuilderPreview
          icon={FileText}
          title="Post Preview"
          badge="Methadone"
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
                  href={context.patientFileUrl}
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
          note="Copy & Open GOV copies the prescription and opens the patient's file with the body filled in for you; it needs the patient file link above."
        >
          <BuilderOutput label="Template Body" value={body} />

          {!complete && (
            <BuilderRequirement>
              {Object.values(formErrors)[0] ??
                (hasPatientFileLink
                  ? "Fill in every field to enable the copy buttons."
                  : "Add the patient file link to enable Copy & Open GOV.")}
            </BuilderRequirement>
          )}
        </BuilderPreview>
      </BuilderShell>
    </div>
  );
}
