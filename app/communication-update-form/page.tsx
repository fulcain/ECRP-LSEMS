"use client";

import { communicationUpdate, Divisions } from "@/app/configs/divisions";
import { useMedic } from "@/app/context/MedicContext";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { getCurrentUTCTime } from "@/app/helpers/timeUtils";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
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
import { useEffect } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
  patientName: string;
  contactType: string;
  contactDetails: string;
  divisionLabel: string;
  rank: string;
}

export default function CommunicationUpdateForm() {
  const { medicCredentials, divisionRanks, setDivisionRanks } = useMedic();

  const [formData, setFormData] = useLocalStorage<FormData>("commUpdateForm", {
    patientName: "",
    contactType: "",
    contactDetails: "",
    divisionLabel: "",
    rank: "",
  });

  const selectedDivision =
    communicationUpdate.find((d) => d.label === formData.divisionLabel) || null;
  const selectedRank = formData.rank;

  useEffect(() => {
    if (
      selectedDivision &&
      selectedRank &&
      divisionRanks[selectedDivision.label] !== selectedRank
    ) {
      setDivisionRanks({
        ...divisionRanks,
        [selectedDivision.label]: selectedRank,
      });
    }
  }, [selectedRank, selectedDivision]);

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    if (
      !formData.patientName ||
      !formData.contactType ||
      !formData.contactDetails ||
      !selectedDivision ||
      !selectedRank
    ) {
      toast.error("Please fill all fields and select a division and rank!");
      return;
    }

    const utcDate = getCurrentUTCTime();

    const text = `[img]https://i.imgur.com/Wxpv58D.png[/img]
[divbox=white]
[hr]
[b]Patient Name:[/b] ${formData.patientName}
[hr]
[b]Date / Time:[/b] ${getCurrentDateFormatted()} - ${utcDate}
[hr]
[b]Contact Method:[/b] ${formData.contactType}
[hr]
[b]Details:[/b] ${formData.contactDetails}
[hr]
[/divbox]
[divbox=white]

[img]${medicCredentials.signature}[/img]
[i]${medicCredentials.name}[/i]
[b]${selectedRank} | ${medicCredentials.rank}[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox][img]https://i.imgur.com/HNP4ksW.png[/img]`.trim();

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("BBCode copied to clipboard!"))
      .catch(() => toast.error("Failed to copy!"));
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        transition={Bounce}
      />
      <main className="text-foreground min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
              Communication Update Form
            </h1>
            <p className="text-slate-400">
              Fill in patient info, contact details, select division and rank
            </p>
          </div>

          {/* Division Selector */}
          <div className="mb-6 flex flex-col gap-2">
            <Label htmlFor="divisionSelect" className="text-white">
              Select Division
            </Label>
            <Select
              onValueChange={(val) => handleChange("divisionLabel", val)}
              value={formData.divisionLabel || ""}
            >
              <SelectTrigger id="divisionSelect">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                {communicationUpdate.map((div) => (
                  <SelectItem key={div.label} value={div.label}>
                    {div.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rank Selector */}
          {selectedDivision && Array.isArray(selectedDivision.data?.ranks) && (
            <div className="mb-6 flex flex-col gap-2">
              <Label htmlFor="rankSelect" className="text-white">
                Select Rank
              </Label>
              <Select
                onValueChange={(val) => handleChange("rank", val)}
                value={formData.rank || ""}
              >
                <SelectTrigger id="rankSelect">
                  <SelectValue placeholder="Choose your rank" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDivision.data.ranks.map((rank, idx) => (
                    <SelectItem key={idx} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Inputs */}
          <div className="mb-8 flex flex-col gap-4 rounded-lg bg-slate-800 p-6 shadow-lg">
            <div className="flex flex-col gap-2">
              <Label htmlFor="patientName" className="text-white">
                Patient Name
              </Label>
              <Input
                id="patientName"
                placeholder="Enter patient's name"
                value={formData.patientName}
                onChange={(e) => handleChange("patientName", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contactType" className="text-white">
                Contact Type
              </Label>
              <Input
                id="contactType"
                placeholder="Phone, Email, etc."
                value={formData.contactType}
                onChange={(e) => handleChange("contactType", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contactDetails" className="text-white">
                Contact Details
              </Label>
              <Textarea
                id="contactDetails"
                placeholder="Enter contact details"
                value={formData.contactDetails}
                onChange={(e) =>
                  handleChange("contactDetails", e.target.value)
                }
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="mt-2 cursor-pointer"
              disabled={
                !formData.patientName ||
                !formData.contactType ||
                !formData.contactDetails ||
                !selectedDivision ||
                !selectedRank
              }
            >
              Copy Form
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
