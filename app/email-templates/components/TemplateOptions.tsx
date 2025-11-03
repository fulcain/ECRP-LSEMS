import { Divisions } from "@/app/configs/divisions/";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ambulance } from "lucide-react";
import Image from "next/image";

interface TemplateOptionsProps {
  selectedDivision: Divisions | null;
  selectedRank: string;
  setSelectedRank: (rank: string) => void;
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
  setSelectedRank,
  subject,
  setSubject,
  recipient,
  setRecipient,
  handleGenerateSignature,
  handleGenerateNewTemplate,
}: TemplateOptionsProps) {
  return (
    <div className="lg:col-span-2">
      <div className="h-full rounded-lg bg-slate-800 p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Template Options
        </h2>

        {selectedDivision ? (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Division Selected
              </label>
              <div className="flex items-center rounded-md bg-slate-700/50 p-3">
                <div className="mr-3 h-8 w-8 flex-shrink-0">
                  <Image
                    src={selectedDivision.image}
                    alt={selectedDivision.label}
                    width={32}
                    height={32}
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
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Select Rank
                </label>
                <Select
                  onValueChange={(val) => setSelectedRank(val)}
                  value={selectedRank}
                >
                  <SelectTrigger className="w-full cursor-pointer border-slate-600 bg-slate-700">
                    <SelectValue placeholder="Choose your rank" />
                  </SelectTrigger>
                  <SelectContent className="w-full border-slate-700 bg-slate-800">
                    {selectedDivision.data.ranks.map((rank, idx) => (
                      <SelectItem
                        className="w-full cursor-pointer focus:bg-slate-700"
                        key={idx}
                        value={rank}
                      >
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                className="w-full border-slate-600 bg-slate-700 text-white"
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
                className="w-full border-slate-600 bg-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <Button
                size="lg"
                className="w-full cursor-pointer bg-red-600 hover:bg-red-700"
                onClick={handleGenerateNewTemplate}
                disabled={
                  !selectedDivision ||
                  (Array.isArray(selectedDivision?.data?.ranks) &&
                    !selectedRank)
                }
              >
                Create Template
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full cursor-pointer border-slate-600 text-white hover:bg-slate-700"
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
              <Ambulance />
            </div>
            <h3 className="mb-1 text-lg font-medium text-white">
              Select a Division
            </h3>
            <p className="text-slate-400">
              Choose a division from the left to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
