"use client";

import { communicationUpdate } from "@/app/configs/divisions";
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
import { useEffect, useMemo, useState } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CommunicationUpdateForm() {
  const { medicCredentials, divisionRanks, setDivisionRanks } = useMedic();

  const [patientName, setPatientName] = useLocalStorage(
    "commUpdate_patientName",
    "",
  );
  const [contactType, setContactType] = useLocalStorage(
    "commUpdate_contactType",
    "",
  );
  const [contactDetails, setContactDetails] = useLocalStorage(
    "commUpdate_contactDetails",
    "",
  );
  const [divisionLabel, setDivisionLabel] = useLocalStorage(
    "commUpdate_divisionLabel",
    "",
  );

  const [selectedDivision, setSelectedDivision] = useState(
    communicationUpdate.find((d) => d.label === divisionLabel) || null,
  );
  const [selectedRank, setSelectedRank] = useState("");

  useEffect(() => {
    const div =
      communicationUpdate.find((d) => d.label === divisionLabel) || null;
    setSelectedDivision(div);

    if (div) {
      const savedRank = divisionRanks[div.label];
      if (savedRank) setSelectedRank(savedRank);
      else if (div.data?.ranks?.length) setSelectedRank(div.data.ranks[0]);
    } else {
      setSelectedRank("");
    }
  }, [divisionLabel, divisionRanks, setSelectedDivision, setSelectedRank]);

  useEffect(() => {
    if (selectedDivision && selectedRank) {
      setDivisionRanks((prev) => ({
        ...prev,
        [selectedDivision.label]: selectedRank,
      }));
    }
  }, [selectedRank, selectedDivision, setDivisionRanks]);

  // Memoized BBCode
  const bbCodeText = useMemo(() => {
    if (!selectedDivision || !selectedRank) return "";
    const utcDate = getCurrentUTCTime();
    return `[img]https://i.imgur.com/Wxpv58D.png[/img]
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
  }, [
    patientName,
    contactType,
    contactDetails,
    selectedDivision,
    selectedRank,
    medicCredentials,
  ]);

  const handleSubmit = () => {
    if (!bbCodeText) {
      toast.error("Please fill all fields and select a division and rank!");
      return;
    }
    navigator.clipboard
      .writeText(bbCodeText)
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
              value={divisionLabel || ""}
              onValueChange={setDivisionLabel}
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
                value={selectedRank || ""}
                onValueChange={setSelectedRank}
              >
                <SelectTrigger id="rankSelect">
                  <SelectValue placeholder="Choose your rank" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDivision.data.ranks.map((r, idx) => (
                    <SelectItem key={idx} value={r}>
                      {r}
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
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient's name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contactType" className="text-white">
                Contact Type
              </Label>
              <Input
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                placeholder="Phone, Email, etc."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contactDetails" className="text-white">
                Contact Details
              </Label>
              <Textarea
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                placeholder="Enter contact details"
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="mt-2"
              disabled={!bbCodeText}
            >
              Copy Form
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
