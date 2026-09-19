import { Divisions } from "@/app/constants/divisions";
import BBCodeEditor from "@/app/(routes)/operations/division-templates/components/BBCodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ambulance, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TemplateOptionsProps {
  selectedDivision: Divisions | null;
  selectedRank: string;
  subject: string;
  setSubject: (subject: string) => void;
  recipient: string;
  setRecipient: (recipient: string) => void;
  handleGenerateSignature: () => void;
  handleCopyTemplate: () => void;
  previewBody: string;
  onPreviewChange: (value: string) => void;
  onPreviewReset: () => void;
}

export default function TemplateOptions({
  selectedDivision,
  selectedRank,
  subject,
  setSubject,
  recipient,
  setRecipient,
  handleGenerateSignature,
  handleCopyTemplate,
  previewBody,
  onPreviewChange,
  onPreviewReset,
}: TemplateOptionsProps) {
  return (
    <div className="lg:col-span-2">
      <div className="h-full rounded-[1.5rem] border border-border bg-surface/90 p-5 transition-colors duration-200 hover:border-border">
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Template Options
        </h2>

        {selectedDivision ? (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Division Selected
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-hover/50 p-4 transition-all duration-200 hover:border-border">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-hover/50">
                  <Image
                    src={selectedDivision.image}
                    alt={selectedDivision.label}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="font-medium text-foreground">
                  {selectedDivision.label}
                </span>
              </div>
            </div>

            {(selectedDivision.data?.ranks.length ?? 0) > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Selected Rank
                  </label>
                  <Button asChild size="sm" variant="outline" className="border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-surface-hover hover:text-foreground">
                    <Link href="/workspace/staff">Set in Staff Page</Link>
                  </Button>
                </div>

                <div className="rounded-xl border border-border bg-surface-hover/40 p-4 text-muted-foreground transition-all duration-200 hover:border-border">
                  <p className="text-sm">
                    {selectedRank || (
                      <span className="italic text-muted-foreground">No saved division rank selected yet.</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Recipient
              </label>
              <Input
                placeholder="Enter recipient (optional)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-border focus-visible:ring-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Email Subject
              </label>
              <Input
                placeholder="Enter email subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border-border bg-surface-hover text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:border-border focus-visible:ring-2"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-muted-foreground">
                  Preview
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer text-muted-foreground transition-all duration-200 hover:bg-surface-hover/60 hover:text-foreground active:scale-[0.98]"
                  onClick={onPreviewReset}
                  disabled={!previewBody}
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </Button>
              </div>
              <BBCodeEditor
                placeholder="Generated template appears here - type to edit; edits are saved locally."
                value={previewBody}
                onChange={onPreviewChange}
                rows={12}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <Button
                size="lg"
                className="w-full cursor-pointer border-emerald-600/50 bg-emerald-600 text-foreground transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500 hover:bg-emerald-500 active:scale-[0.98]"
                onClick={handleCopyTemplate}
                disabled={
                  !selectedDivision ||
                  ((selectedDivision?.data?.ranks.length ?? 0) > 0 &&
                    !selectedRank)
                }
              >
                Copy Template
              </Button>

              <Link
                href="https://gov.eclipse-rp.net/ucp.php?i=pm&mode=compose"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="w-full cursor-pointer border-emerald-600/50 bg-emerald-600 text-foreground transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500 hover:bg-emerald-500 active:scale-[0.98]"
                  onClick={handleCopyTemplate}
                  disabled={
                    !selectedDivision ||
                    ((selectedDivision?.data?.ranks.length ?? 0) > 0 &&
                      !selectedRank)
                  }
                >
                  Copy to GOV
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="w-full cursor-pointer border-border text-muted-foreground transition-all duration-200 hover:scale-[1.02] hover:border-sky-500/40 hover:bg-sky-950/20 hover:text-sky-200 active:scale-[0.98]"
                onClick={handleGenerateSignature}
                disabled={
                  !selectedDivision ||
                  ((selectedDivision?.data?.ranks.length ?? 0) > 0 &&
                    !selectedRank)
                }
              >
                Signature
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 ring-1 ring-sky-500/20">
              <Ambulance className="h-7 w-7 text-sky-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-foreground">
              Select a Division
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose a division from the left to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
