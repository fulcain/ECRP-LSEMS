"use client";

import { useEffect, useState } from "react";
import {
  reinstatementConfig,
  ReinstatementPhaseKey,
} from "@/app/(routes)/divisions/ftd/paperwork/lib/reinstatementConfig";
import { generateReinstatementBBCode } from "@/app/(routes)/divisions/ftd/paperwork/lib/generateReinstatementBBCode";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { toast, ToastContainer } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BbcodeTextarea } from "@/app/(routes)/divisions/ftd/paperwork/components/BbcodeTextarea";
import { NextPhaseTitleCard } from "@/app/(routes)/divisions/ftd/paperwork/components/NextPhaseTitleCard";
import { ReinstatementNotesCard } from "@/app/(routes)/divisions/ftd/paperwork/components/ReinstatementNotesCard";
import {
  Copy,
  Trash2,
  FileText,
  User,
  Phone,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Pencil,
  Lock,
} from "lucide-react";
import { useSession } from "@/app/(routes)/divisions/ftd/paperwork/components/SessionContext";
import { formatTime24h } from "@/app/(routes)/divisions/ftd/paperwork/lib/formatTime";
import { useHighestRank } from "@/app/hooks/useHighestRank";
import { rankOptions } from "@/app/constants/general/ranks";

const defaultFormState = {
  participated: false,
  tenFifteenCalls: [] as { rating: string; performanceNotes: string }[],
  detailedNotes: "",
  detailedNotesListNone: false,
  issues: "",
  reasonFailure: "",
  rank: "",
  rideAlongType: "",
  ftsCompleted: false,
  wasMedicalGiven: false,
  callsign: 0,
  notesNextTraining: "",
  departmentCalls: false,
  roleplayNotes: "",
  phasePassed: false,
  reintroEmailSent: false,
};

/** Reinstatement paperwork form (returning EMT rejoining the program). */
export default function ReinstatementForm() {
  const [phase, setPhase] = useState<ReinstatementPhaseKey>("reinstatementPhase1");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    details,
    resolvedEMR,
    selectedEMRProfileLink,
    setCurrentPhase,
    additionalMandatories,
    setAdditionalMandatories,
    setDetails,
  } = useSession();

  const { rankLabel: autoRankLabel } = useHighestRank();

  // Rank dropdown is locked by default. The toggle only ever flips this
  // boolean - it never mutates `form.rank` on its own, so re-locking keeps
  // the user's last manual pick instead of snapping back to auto.
  const [isRankEditing, setIsRankEditing] = useState(false);

  // Dropdown options ordered high → low so they mirror the heading text.
  // Sourced from the rank registry, so adding a rank there is enough.

  useEffect(() => {
    setCurrentPhase(phase);
  }, [phase, setCurrentPhase]);

  useEffect(() => {
    return () => {
      setCurrentPhase(null);
    };
  }, [setCurrentPhase]);

  const openProfileLink = () => {
    if (!selectedEMRProfileLink) return;
    window.open(selectedEMRProfileLink, "_blank", "noopener,noreferrer");
  };

  // additionalMandatories lives in shared SessionContext, not on the form.
  // The hook *is* the form's state. Mirroring it into a second `useState` and
  // writing that back lost the stored data: the mirror's own mount write
  // replaced the hydrated value before it could ever be applied.
  const [form, setForm] = useLocalStorage<any>(
    "ftd-reinstatement-paperwork-form-data",
    { ...defaultFormState },
  );

  // Auto-populate Rank from the user's highest Discord role once the
  // /api/auth/me lookup resolves. Always overwrites on page reload so
  // the rank reflects their current Discord roles even if it changed since
  // the last visit.
  useEffect(() => {
    if (!autoRankLabel) return;
    setForm((prev: any) => ({ ...prev, rank: autoRankLabel }));
  }, [autoRankLabel, setForm]);

  const clearAllFields = () => {
    setForm({
      ...defaultFormState,
      // After clearing, fall back to the user's auto-detected rank rather
      // than the previously-edited value. If we couldn't detect a rank,
      // keep whatever the user had typed.
      rank: autoRankLabel ?? form.rank,
    });
    setOutput("");
    setCopied(false);
    setAdditionalMandatories("");

    toast.info("All fields cleared", { theme: "dark" });
  };

  const update = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const addTenFifteenCall = () => {
    update("tenFifteenCalls", [
      ...form.tenFifteenCalls,
      { rating: "", performanceNotes: "" },
    ]);
  };

  const updateTenFifteenCall = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...form.tenFifteenCalls];
    updated[index][field] = value;
    update("tenFifteenCalls", updated);
  };

  const removeTenFifteenCall = (index: number) => {
    const updated = form.tenFifteenCalls.filter(
      (_: any, i: number) => i !== index,
    );
    update("tenFifteenCalls", updated);
  };

  const config = reinstatementConfig[phase];

  const generate = () => {
    const valuesWithSession = {
      ...form,
      // additionalMandatories lives in shared SessionContext, not on the form.
      additionalMandatories,
      signature: details.signature,
      timeStarted: formatTime24h(details.timeStart),
      timeEnded: formatTime24h(details.timeFinish),
      emrName: resolvedEMR,
    };
    const bbcode = generateReinstatementBBCode(
      valuesWithSession,
      phase,
      config.sections,
      config.image || undefined,
    );
    setOutput(bbcode);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);

    toast.success("Copied!", { theme: "dark" });
  };

  const showSection = (section: string) => config.sections.includes(section);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Section heading for screen readers; the page-level <h1> lives in the
            PaperworkTypeSelector header above. */}
        <h2 className="sr-only">Reinstatement Paperwork</h2>

        {/* === FTO Signature & Rank === */}
        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Signature (image link)
                </Label>                  <Input
                  value={details.signature}
                  onChange={(e) =>
                    setDetails((prev) => ({
                      ...prev,
                      signature: e.target.value,
                    }))
                  }
                  placeholder="insert link here"
                  className="bg-background"
                />
              </div>
              <div className="flex-1 min-w-[160px] space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  Rank
                  {autoRankLabel && form.rank === autoRankLabel && (
                    <span
                      aria-live="polite"
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-primary/70"
                      title={`Auto-detected: ${autoRankLabel}. Click the pencil to override.`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      auto
                      <span className="sr-only">
                        Auto-detected {autoRankLabel} from your Discord
                        roles.
                      </span>
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={form.rank || undefined}
                    onValueChange={(v) => update("rank", v)}
                    disabled={!isRankEditing}
                  >
                    <SelectTrigger
                      className="bg-background flex-1"
                      aria-label="Rank"
                    >
                      <SelectValue
                        placeholder={
                          autoRankLabel ?? "No rank detected - click edit"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {rankOptions.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRankEditing((v) => !v)}
                    aria-label={
                      isRankEditing ? "Lock rank" : "Edit rank manually"
                    }
                    title={
                      isRankEditing
                        ? "Click to lock"
                        : autoRankLabel
                          ? `Auto-selected: ${autoRankLabel}. Click to edit.`
                          : "Edit manually"
                    }
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    {isRankEditing ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === Phase Selector === */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(reinstatementConfig).map(([key, value]) => (
            <Button
              key={key}
              variant={phase === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setPhase(key as ReinstatementPhaseKey)}
              className="text-sm font-normal"
            >
              {value.label}
            </Button>
          ))}
        </div>

        {/* === Phase Reference Notes === */}
        <ReinstatementNotesCard />

        {/* === Phase-Specific Form Sections === */}
        <div className="space-y-4">
          {/* === Department Calls === */}
          {showSection("tenFifteen") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Department Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="departmentCalls"
                    checked={form.departmentCalls}
                    onCheckedChange={(val) => update("departmentCalls", val)}
                  />
                  <Label
                    htmlFor="departmentCalls"
                    className="text-sm cursor-pointer"
                  >
                    Were there any department calls?
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* === Ride Along === */}
          {showSection("rideAlong") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Ride Along
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Single-select: MANDATORY / OPTIONAL, clears on re-click. */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rideAlongMandatory"
                    checked={form.rideAlongType === "MANDATORY"}
                    onCheckedChange={(val) =>
                      update("rideAlongType", val ? "MANDATORY" : "")
                    }
                  />
                  <Label
                    htmlFor="rideAlongMandatory"
                    className="text-sm cursor-pointer"
                  >
                    Mandatory
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rideAlongOptional"
                    checked={form.rideAlongType === "OPTIONAL"}
                    onCheckedChange={(val) =>
                      update("rideAlongType", val ? "OPTIONAL" : "")
                    }
                  />
                  <Label
                    htmlFor="rideAlongOptional"
                    className="text-sm cursor-pointer"
                  >
                    Optional
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* === 10-15 Transports === */}
          {showSection("tenFifteen") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  10-15 Transport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="participated"
                    checked={form.participated}
                    onCheckedChange={(val) => {
                      update("participated", val);
                      if (val && form.tenFifteenCalls.length === 0) {
                        update("tenFifteenCalls", [
                          { rating: "", performanceNotes: "" },
                        ]);
                      }
                      if (!val) {
                        update("tenFifteenCalls", []);
                      }
                    }}
                  />
                  <Label
                    htmlFor="participated"
                    className="text-sm cursor-pointer"
                  >
                    Did the reinstatee transport a 10-15?
                  </Label>
                </div>

                {form.participated && (
                  <div className="space-y-4 mt-4">
                    {form.tenFifteenCalls.map((call: any, index: number) => (
                      <div
                        key={index}
                        className="bg-muted/20 p-4 rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Transport #{index + 1}
                          </span>
                          {form.tenFifteenCalls.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTenFifteenCall(index)}
                              className="h-7 px-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Rating (1-5)
                            </Label>
                            <Input
                              value={call.rating}
                              onChange={(e) =>
                                updateTenFifteenCall(
                                  index,
                                  "rating",
                                  e.target.value,
                                )
                              }
                              placeholder="3"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs text-muted-foreground">
                              Performance Notes
                            </Label>
                            <BbcodeTextarea
                              className="min-h-[80px] bg-background"
                              value={call.performanceNotes}
                              onChange={(value) =>
                                updateTenFifteenCall(
                                  index,
                                  "performanceNotes",
                                  value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTenFifteenCall}
                    >
                      + Add transport
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* === Roleplay Notes === */}
          {showSection("tenFifteen") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Roleplay Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BbcodeTextarea
                  className="min-h-[100px] bg-background"
                  value={form.roleplayNotes}
                  onChange={(value) => update("roleplayNotes", value)}
                  placeholder="How did they do Roleplay-wise? Note anything negative and positive..."
                />
              </CardContent>
            </Card>
          )}

          {/* === Session / Certification Notes === */}
          {showSection("detailedNotes") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {phase === "reinstatementCertPassed" || phase === "reinstatementCertFailed"
                    ? "Certification Notes"
                    : "Session Notes"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BbcodeTextarea
                  className="min-h-[120px] bg-background"
                  value={form.detailedNotes}
                  onChange={(value) => update("detailedNotes", value)}
                  placeholder={
                    phase === "reinstatementCertPassed" || phase === "reinstatementCertFailed"
                      ? "Certification notes (50 word minimum for cert)..."
                      : "Document the training session details..."
                  }
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="listNone"
                    checked={form.detailedNotesListNone}
                    onCheckedChange={(val) =>
                      update("detailedNotesListNone", val)
                    }
                  />
                  <Label
                    htmlFor="listNone"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Use plain list style (no bullets)
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* === Issues Encountered === */}
          {showSection("issues") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Issues Encountered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BbcodeTextarea
                  className="min-h-[100px] bg-background"
                  value={form.issues}
                  onChange={(value) => update("issues", value)}
                  placeholder="Document any issues or concerns..."
                />
              </CardContent>
            </Card>
          )}

          {/* === Failed-Cert Details === */}
          {showSection("failedCert") && (
            <Card className="border shadow-sm border-destructive/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-destructive">
                  Certification Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BbcodeTextarea
                  className="min-h-[100px] bg-background"
                  value={form.reasonFailure}
                  onChange={(value) => update("reasonFailure", value)}
                  placeholder="Reason(s) for failure..."
                />
              </CardContent>
            </Card>
          )}

          {/* === Next Session Focus === */}
          {phase !== "reinstatementCertPassed" && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {phase === "reinstatementCertFailed"
                    ? "Failed Certification Follow-up"
                    : "Next Session Focus"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {phase === "reinstatementCertFailed"
                      ? "Mandatory Ride-Alongs (Minimum 2)"
                      : "Mandatory Ride-Alongs"}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      value={additionalMandatories}
                      onChange={(e) =>
                        setAdditionalMandatories(e.target.value)
                      }
                      placeholder="0"
                      className="bg-background w-32"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Subjects to focus on
                  </Label>
                  <BbcodeTextarea
                    className="min-h-[80px] bg-background"
                    value={form.notesNextTraining}
                    onChange={(value) => update("notesNextTraining", value)}
                    placeholder="Any subjects that require additional attention..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* === Phase-Specific Checkboxes === */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ftsCompleted"
                  checked={form.ftsCompleted}
                  onCheckedChange={(val) => update("ftsCompleted", val)}
                />
                <Label
                  htmlFor="ftsCompleted"
                  className="text-sm cursor-pointer"
                >
                  Field Training Session Report Completed
                </Label>
              </div>

              {phase === "reinstatementPhase1" && (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="phasePassed"
                      checked={form.phasePassed}
                      onCheckedChange={(val) => update("phasePassed", val)}
                    />
                    <Label
                      htmlFor="phasePassed"
                      className="text-sm cursor-pointer"
                    >
                      Did the Reinstatee pass Phase I?
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="reintroEmailSent"
                      checked={form.reintroEmailSent}
                      onCheckedChange={(val) => update("reintroEmailSent", val)}
                    />
                    <Label
                      htmlFor="reintroEmailSent"
                      className="text-sm cursor-pointer"
                    >
                      Was the Reinstatee sent the Re-Introduction Email?
                    </Label>
                  </div>
                </>
              )}

              {phase === "reinstatementPhase2" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="phasePassed"
                    checked={form.phasePassed}
                    onCheckedChange={(val) => update("phasePassed", val)}
                  />
                  <Label
                    htmlFor="phasePassed"
                    className="text-sm cursor-pointer"
                  >
                    Did the reinstatee pass Reinstatement Phase II?
                  </Label>
                </div>
              )}

              {phase === "reinstatementCertPassed" && (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="wasMedicalGiven"
                      checked={form.wasMedicalGiven}
                      onCheckedChange={(val) => update("wasMedicalGiven", val)}
                    />
                    <Label
                      htmlFor="wasMedicalGiven"
                      className="text-sm cursor-pointer"
                    >
                      Medical License Present/Given?
                    </Label>
                  </div>
                  <div className="flex items-start flex-col gap-1">
                    <div className="flex items-center flex-row gap-1">
                      <Label htmlFor="callsign" className="text-sm">
                        Call Sign:
                      </Label>
                      <Input
                        id="callsign"
                        className="w-24 h-8"
                        placeholder="Number"
                        value={form.callsign}
                        onChange={(e) => update("callsign", e.target.value)}
                      />
                    </div>

                    <span className="text-xs text-muted-foreground">
                      (Only put the number. ex: 12 - it will output ECHO-12)
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </div>

        {/* === Next Phase Title + Action Bar === */}
        <NextPhaseTitleCard />

        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 flex flex-wrap gap-2 justify-center md:justify-start shadow-lg">
          <Button onClick={generate} size="sm" className="px-6">
            <FileCheck className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button
            disabled={!output}
            variant="secondary"
            size="sm"
            onClick={copyToClipboard}
            className="px-6"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!selectedEMRProfileLink}
            onClick={openProfileLink}
            className="px-6"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open EMR Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFields}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* === Generated BBCode Output === */}
        {output && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Generated BBCode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-background"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
