"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Clipboard, ShieldCheck, Signature } from "lucide-react";
import { useMedic } from "@/app/context/MedicContext";
import { generateSignature } from "@/app/templates/general/signature";
import { redTemplates } from "@/app/templates/red-formats";
import { BodyAndMainTitle } from "@/components/layout/main-and-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const genderOptions = ["Mr.", "Mrs."] as const;

export default function REDFormatsPage() {
  const { medicCredentials, divisionRanks } = useMedic();
  const [selectedFormat, setSelectedFormat] = useState<
    (typeof redTemplates)[number]["value"]
  >(redTemplates[0].value);
  const [gender, setGender] = useState<(typeof genderOptions)[number]>(
    genderOptions[0],
  );
  const [applicantName, setApplicantName] = useState("");
  const [copied, setCopied] = useState(false);

  const activeFormat =
    redTemplates.find((format) => format.value === selectedFormat) ??
    redTemplates[0];
  const redRank = divisionRanks.RED ?? "";

  const signatureBlock = useMemo(() => {
    if (!medicCredentials.signature || !medicCredentials.rank) {
      return `[b]Signature[/b]: [Add your saved signature in Staff Page]\n[b]Rank[/b]: [Add your saved rank in Staff Page]`;
    }

    return generateSignature({
      selectedRank: redRank,
      medicCredentials,
    }).trim();
  }, [medicCredentials, redRank]);

  const bbcodeOutput = useMemo(() => {
    const applicant = `${gender} ${applicantName.trim() || "Applicant Name"}`;
    const staffRank = redRank
      ? `${medicCredentials.rank} / ${redRank}`
      : medicCredentials.rank || "Rank";
    const templateBody = activeFormat.renderBody({ applicant });

    return `[center][size=150][color=#ef4444][b]Recruitment and Employment Division[/b][/color][/size][/center]
[center][i]${activeFormat.label}[/i][/center]

[b]Applicant:[/b] ${applicant}
[b]Status:[/b] ${activeFormat.label}
[b]Handled By:[/b] ${medicCredentials.name || "Your Name"}
[b]Staff Rank:[/b] ${staffRank}

${templateBody}

[hr]
${signatureBlock}`;
  }, [
    activeFormat,
    applicantName,
    gender,
    medicCredentials.name,
    medicCredentials.rank,
    redRank,
    signatureBlock,
  ]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bbcodeOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <BodyAndMainTitle
      title="RED Formats"
      description="Build RED application responses with saved staff credentials and quick-swap BBCode placeholders."
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-red-500/20 bg-slate-950/80 shadow-2xl shadow-red-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.24),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(248,113,113,0.18),_transparent_34%)]" />

        <div className="relative grid gap-8 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <section className="space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 backdrop-blur">
              <div className="mb-4 flex items-center gap-2 text-white">
                <ShieldCheck className="h-4 w-4 text-red-300" />
                <div>
                  <h3 className="font-semibold">Application Builder</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="red-format">Format</Label>
                  <Select
                    value={selectedFormat}
                    onValueChange={(value) =>
                      setSelectedFormat(
                        value as (typeof redTemplates)[number]["value"],
                      )
                    }
                  >
                    <SelectTrigger
                      id="red-format"
                      className="w-full border-slate-700 bg-slate-800 text-white"
                    >
                      <SelectValue placeholder="Select a format" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-slate-900 text-white">
                      {redTemplates.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicant-gender">Applicant title</Label>
                  <Select
                    value={gender}
                    onValueChange={(value) =>
                      setGender(value as (typeof genderOptions)[number])
                    }
                  >
                    <SelectTrigger
                      id="applicant-gender"
                      className="w-full border-slate-700 bg-slate-800 text-white"
                    >
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-slate-900 text-white">
                      {genderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicant-name">Applicant name</Label>
                  <Input
                    id="applicant-name"
                    value={applicantName}
                    onChange={(event) => setApplicantName(event.target.value)}
                    placeholder="Enter the applicant's name"
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <div
                className={`rounded-[1.5rem] border bg-gradient-to-br p-5 ${activeFormat.border} ${activeFormat.accent}`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">Live Format Card</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${activeFormat.badge}`}
                  >
                    {activeFormat.label}
                  </span>
                </div>

                <div className="space-y-4 text-sm text-slate-200">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <p className="mb-1 text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                      Applicant
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {gender} {applicantName.trim() || "Applicant Name"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="mb-1 text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Saved Rank
                      </p>
                      <p className="font-medium text-white">
                        {medicCredentials.rank || "No rank saved yet"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="mb-1 text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        RED Rank
                      </p>
                      <p className="font-medium text-white">
                        {redRank || "No RED division rank saved"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="mb-2 flex items-center gap-2 text-white">
                      <Signature className="h-4 w-4 text-red-300" />
                      <span className="font-semibold">Saved Signature</span>
                    </div>
                    {medicCredentials.signature ? (
                      <Image
                        src={medicCredentials.signature}
                        alt="Saved signature"
                        width={260}
                        height={70}
                        className="h-auto max-h-20 w-auto rounded-md bg-white/95 p-2 object-contain"
                      />
                    ) : (
                      <p className="text-slate-300">
                        Add your signature from `Staff Page` to have it
                        dropped into each RED format.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                  Generated Output
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Ready to paste BBCode
                </h3>
              </div>

              <Button
                onClick={handleCopy}
                className="bg-red-600 text-white hover:bg-red-500"
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <Textarea
              value={bbcodeOutput}
              readOnly
              className="min-h-[540px] resize-none border-slate-700 bg-slate-950 text-slate-100"
            />
          </section>
        </div>
      </div>
    </BodyAndMainTitle>
  );
}
