import { Divisions } from "@/app/constants/divisions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ambulance } from "lucide-react";
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
  handleGenerateNewTemplate: () => void;
}

export default function TemplateOptions({
  selectedDivision,
  selectedRank,
  subject,
  setSubject,
  recipient,
  setRecipient,
  handleGenerateSignature,
  handleGenerateNewTemplate,
}: TemplateOptionsProps) {
  return (
    <div className="lg:col-span-2">
      <div className="h-full rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Template Options
        </h2>

        {selectedDivision ? (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Division Selected
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/50 p-4 transition-all duration-200 hover:border-white/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
                  <Image
                    src={selectedDivision.image}
                    alt={selectedDivision.label}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="font-medium text-white">
                  {selectedDivision.label}
                </span>
              </div>
            </div>

            {Array.isArray(selectedDivision.data?.ranks) && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Selected Rank
                  </label>
                  <Button asChild size="sm" variant="outline" className="border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-700 hover:text-white">
                    <Link href="/staff">Set in Staff Page</Link>
                  </Button>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-800/40 p-4 text-slate-300 transition-all duration-200 hover:border-white/20">
                  <p className="text-sm">
                    {selectedRank || (
                      <span className="italic text-slate-500">No saved division rank selected yet.</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Recipient
              </label>
              <Input
                placeholder="Enter recipient (optional)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Subject
              </label>
              <Input
                placeholder="Enter email subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500 focus-visible:ring-2"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <Button
                size="lg"
                className="w-full cursor-pointer bg-sky-600 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-sky-500 active:scale-95"
                onClick={handleGenerateNewTemplate}
                disabled={
                  !selectedDivision ||
                  (Array.isArray(selectedDivision?.data?.ranks) &&
                    !selectedRank)
                }
              >
                Create Template
              </Button>

              <Link
                href="https://gov.eclipse-rp.net/ucp.php?i=pm&mode=compose"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="w-full cursor-pointer border-emerald-600/50 bg-emerald-600 text-white transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500 hover:bg-emerald-500 active:scale-95"
                  onClick={handleGenerateNewTemplate}
                  disabled={
                    !selectedDivision ||
                    (Array.isArray(selectedDivision?.data?.ranks) &&
                      !selectedRank)
                  }
                >
                  Copy to GOV
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="w-full cursor-pointer border-slate-600 text-slate-300 transition-all duration-200 hover:scale-[1.02] hover:border-sky-500/40 hover:bg-sky-950/20 hover:text-sky-200 active:scale-95"
                onClick={handleGenerateSignature}
                disabled={
                  !selectedDivision ||
                  (Array.isArray(selectedDivision?.data?.ranks) &&
                    !selectedRank)
                }
              >
                Create Signature
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 ring-1 ring-sky-500/20">
              <Ambulance className="h-7 w-7 text-sky-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-white">
              Select a Division
            </h3>
            <p className="text-sm text-slate-400">
              Choose a division from the left to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
