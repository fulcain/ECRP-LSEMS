"use client";

import { communicationUpdate, Divisions } from "@/app/configs/divisions";
import { useMedic } from "@/app/context/MedicContext";
import { getCurrentDateFormatted } from "@/app/helpers/getCurrentDateFormatted";
import { getCurrentUTCTime } from "@/app/helpers/timeUtils";
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
import { useState, useEffect } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CommunicationUpdateForm() {
  const { medicCredentials, divisionRanks, setDivisionRanks } = useMedic();

  const [patientName, setPatientName] = useState("");
  const [contactType, setContactType] = useState("");
  const [contactDetails, setContactDetails] = useState("");

  const [selectedDivision, setSelectedDivision] = useState<Divisions | null>(
    null,
  );
  const [selectedRank, setSelectedRank] = useState("");

  useEffect(() => {
    if (selectedDivision) {
      const savedRank = divisionRanks[selectedDivision.label] || "";
      setSelectedRank(savedRank);
    } else {
      setSelectedRank("");
    }
  }, [selectedDivision]);

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

  const handleSubmit = () => {
    if (
      !patientName ||
      !contactType ||
      !contactDetails ||
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
[b]Patient Name:[/b] ${patientName}
[hr]
[b]Date / Time:[/b] ${getCurrentDateFormatted()} - ${utcDate}
[hr]
[b]Contact Method:[/b] ${contactType}
[hr]
[b]Details:[/b] ${contactDetails}
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
              onValueChange={(val) => {
                const div =
                  communicationUpdate.find((d) => d.label === val) || null;
                setSelectedDivision(div);
              }}
              value={selectedDivision?.label || ""}
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
                onValueChange={(val) => setSelectedRank(val)}
                value={selectedRank}
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
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contactType" className="text-white">
                Contact Type
              </Label>
              <Input
                id="contactType"
                placeholder="Phone, Email, etc."
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contactDetails" className="text-white">
                Contact Details
              </Label>
              <Textarea
                id="contactDetails"
                placeholder="Enter contact details"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSubmit} className="mt-2 cursor-pointer">
              Copy Form
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
