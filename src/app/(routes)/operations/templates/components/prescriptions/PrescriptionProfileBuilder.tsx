"use client";

import { copyBBCode } from "@/app/helpers/copyBBCode";
import {
  forumPostToast,
  handOffAndOpenForumPost,
} from "@/app/helpers/forumHandoff";
import {
  GOV_PRESCRIPTION_POST_URL,
  generatePrescriptionProfileBody,
  generatePrescriptionProfileTitle,
} from "@/app/templates/prescription";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Copy, ExternalLink, FileText, User } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  INPUT_LIMITS,
  validateName,
  validateText,
  validationMessage,
} from "@/lib/validation";

export function PrescriptionProfileBuilder() {
  const [name, setName] = useLocalStorage<string>("prescription-profile-name", "");
  const [phoneNumber, setPhoneNumber] = useLocalStorage<string>(
    "prescription-profile-phone",
    "",
  );

  const context = {
    name: name.trim(),
    phoneNumber: phoneNumber.trim(),
  };

  const title = generatePrescriptionProfileTitle(context);
  const body = generatePrescriptionProfileBody(context);

  const formErrors: Record<string, string> = {};
  const nameError = validationMessage(validateName(context.name, "Name"));
  if (nameError) formErrors.name = nameError;
  const phoneError = validationMessage(
    validateText(context.phoneNumber, "Phone number", {
      max: INPUT_LIMITS.short,
      allowMarkup: false,
    }),
  );
  if (phoneError) formErrors.phoneNumber = phoneError;
  const complete = Object.keys(formErrors).length === 0;

  const post = {
    subject: title,
    url: GOV_PRESCRIPTION_POST_URL,
    feature: "the prescription profile",
  };

  const handleCopyTemplate = () => {
    if (!complete) return;
    copyBBCode({ bbCodeText: body, post });
  };

  const handleCopyToGov = () => {
    if (!complete) return;
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

  const handleCopyTitle = () => {
    if (!complete) return;
    copyBBCode({ bbCodeText: title, post: { ...post, bbcode: "" } });
  };

  return (
    <div className="space-y-6">
      <BuilderShell>
        <BuilderForm>
          <BuilderSection
            icon={User}
            title="Patient"
            hint="The name and phone number at the top of the profile. The rest of the general information stays as written."
          >
            <BuilderField label="Name">
              <Input
                value={name}
                maxLength={INPUT_LIMITS.name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fname Lname"
              />
            </BuilderField>
            <BuilderField label="Phone Number">
              <Input
                value={phoneNumber}
                maxLength={INPUT_LIMITS.short}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 555-0123"
              />
            </BuilderField>
          </BuilderSection>
        </BuilderForm>

        <BuilderPreview
          icon={FileText}
          title="Post Preview"
          badge="Prescription Profile"
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

              <Link
                href={GOV_PRESCRIPTION_POST_URL}
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
            </>
          }
          note="Copy & Open GOV copies the profile and opens the prescription posting page with it: the title and the body are written into the post for you, ready to review and submit."
        >
          <BuilderTitleRow
            label="Post Title"
            value={title}
            onCopy={handleCopyTitle}
            copyLabel="Copy Title"
            disabled={!complete}
          />

          <BuilderOutput label="Template Body" value={body} />

          {!complete && (
            <BuilderRequirement>
              {Object.values(formErrors)[0] ??
                "Fill in every field to enable the copy buttons."}
            </BuilderRequirement>
          )}
        </BuilderPreview>
      </BuilderShell>
    </div>
  );
}
