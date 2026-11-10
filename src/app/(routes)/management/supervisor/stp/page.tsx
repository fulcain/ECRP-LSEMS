"use client";

import { useMedic } from "@/app/context/MedicContext";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { pickPostTarget } from "@/app/helpers/forumHandoff";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { NowTimeButton } from "@/components/now-time-button";
import { SupervisorTabs } from "../components/SupervisorTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { validateGovUrl, validationMessage } from "@/lib/validation";
import { Copy, ExternalLink, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const phaseRideQuestions = [
  "Were there any glaring issues throughout the session? If yes, elaborate.",
  "What positive things would you like to highlight?",
  "Did the Junior Paramedic interact with coworkers correctly (if interactions happened)?",
  "Did you encounter any PD/SD/DOC/GOV scenes with the Junior Paramedic? If yes, how did it go?",
  "Is the Junior Paramedic comfortable while using the radio across the board, and do they communicate efficiently (speed and duration of transmission)?",
  "Was the Junior Paramedic able to multitask (driving, unit management, call management, department radio)?",
  "Was there a need for the  Junior Paramedic to correct/discipline someone? If yes, how did they do?",
];
const additionalQuestions = [
  "Do you think the Junior Paramedic is progressing correctly through the STP?",
  "Would you like to point out a specific thing or things that they should be improving on?",
  "Will you be assigning additional Ride-Along sessions? If yes, how many, and explain why.",
];
const evaluationQuestions = [
  "Do you think the Junior Paramedic has fully grasped all of the aspects of the STP?",
  "Has the Junior Paramedic shown satisfactory confidence when performing day-to-day tasks?",
  "Do you believe the Junior Paramedic is ready to be a Paramedic?",
  "If the evaluation was not a success - Will you be assigning additional Ride-Along sessions? If yes, how many, and explain why.",
];
const formats = [
  "Phase One",
  "Phase Two",
  "Phase Three",
  "Ride-Along 1",
  "Ride-Along 2",
  "Ride-Along 3",
  "Ride-Along 4",
  "Evaluation",
] as const;
type StpFormat = (typeof formats)[number];

export default function StpPage() {
  const { medicCredentials } = useMedic();
  const [format, setFormat] = useLocalStorage<StpFormat>("stp-format", formats[0]);
  const [date, setDate] = useLocalStorage("stp-date", "");
  const [started, setStarted] = useLocalStorage("stp-started", "");
  const [ended, setEnded] = useLocalStorage("stp-ended", "");
  const [phaseAnswers, setPhaseAnswers] = useLocalStorage<Record<string, string>>("stp-phase-answers", {});
  const [evaluationAnswers, setEvaluationAnswers] = useLocalStorage<Record<string, string>>("stp-evaluation-answers", {});
  const [notes, setNotes] = useLocalStorage("stp-notes", "");
  const [govLink, setGovLink] = useLocalStorage("stp-gov-link", "");
  const [output, setOutput] = useState("");
  const isEvaluation = format === "Evaluation";
  const questions = isEvaluation ? evaluationQuestions : phaseRideQuestions;
  const answersForFormat = isEvaluation ? evaluationAnswers : phaseAnswers;

  const generate = () => {
    const signature = medicCredentials.signature
      ? `[img]${medicCredentials.signature}[/img]`
      : "SignatureImg";
    const supervisor = `${medicCredentials.rank} ${medicCredentials.name}`;
    const filled = (index: number) => answersForFormat[String(index)] ?? "";
    const phaseAnswer = (question: string, index: number) =>
      `[size=95][i][b]${question}[/b][/i][/size]\n[list][i]${filled(index)}[/i][/list]`;
    const additionalAnswer = (question: string, index: number) =>
      `[size=95][i][b]${question}[/b][/i][/size]\n[list]${filled(index)}\n[/list]`;
    const noteLines = notes.split(/\r?\n/);
    const detailBullets = noteLines.some((line) => line.trim())
      ? noteLines.map((line) => `[*]${line}`).join("\n\n")
      : "[*]\n\n[*]\n\n[*]";
    const notesBlock = `[b]Full session details ([i]bullet point style[/i]):[/b]\n[list]${detailBullets}\n\n[/divbox]`;

    let bbcode: string;
    if (isEvaluation) {
      bbcode = `[img]https://i.imgur.com/aikvciH.png[/img]\n[lsemssubtitle]GENERAL DETAILS[/lsemssubtitle]\n[divbox=white]\n[b]SUPERVISOR+ IN CHARGE:[/b] ${supervisor}\n[b]Date:[/b] ${date}\n[b]Time started:[/b] ${started}\n[b]Time ended:[/b] ${ended} \n[/divbox]\n[lsemssubtitle]EVALUATION QUESTIONS[/lsemssubtitle]\n[divbox=white]\n${evaluationQuestions.map((question, index) => `[size=95][i][b]${question}[/b][/i][/size]\n[list]${filled(index)}\n[/list]`).join("\n\n")}\n[/divbox]\n[lsemssubtitle]EVALUATION NOTES[/lsemssubtitle]\n[divbox=white]\n${notesBlock}\n\n[divbox=white]\n${signature}\n[i]${medicCredentials.name}[/i]\n[b]${medicCredentials.rank}\nLos Santos Emergency Medical Services[/b]\n[/divbox]\n[lsemsfooter][/lsemsfooter]`;
    } else {
      const conducted = format.startsWith("Ride-Along")
        ? `Ridealong ${format.slice(-1)}`
        : format;
      bbcode = `[img]https://i.imgur.com/hqzv6z7.png[/img]\n[lsemssubtitle]GENERAL DETAILS[/lsemssubtitle]\n[divbox=white]\n[b]SUPERVISOR+ IN CHARGE:[/b] ${supervisor}\n[b]Date:[/b] ${date}\n[b]Time started:[/b] ${started}\n[b]Time ended:[/b] ${ended} \n[b]What was conducted?[/b] ${conducted}\n[/divbox]\n[lsemssubtitle]PERFORMANCE QUESTIONS[/lsemssubtitle]\n[divbox=white]\n${phaseRideQuestions.map(phaseAnswer).join("\n\n")}\n[/divbox]\n[lsemssubtitle]SESSION NOTES[/lsemssubtitle]\n[divbox=white]\n${notesBlock}\n\n[lsemssubtitle]ADDITIONAL QUESTIONS[/lsemssubtitle]\n[divbox=white]\n${additionalQuestions.map((question, index) => additionalAnswer(question, index + phaseRideQuestions.length)).join("\n\n")}\n\n[/divbox]\n[divbox=white]\n${signature}\n[i]${medicCredentials.name}[/i]\n[b]${medicCredentials.rank}\nLos Santos Emergency Medical Services[/b]\n[/divbox]\n[lsemsfooter][/lsemsfooter]`;
    }
    setOutput(bbcode);
  };

  const resetForm = () => {
    setFormat(formats[0]);
    setDate("");
    setStarted("");
    setEnded("");
    setPhaseAnswers({});
    setEvaluationAnswers({});
    setNotes("");
    setGovLink("");
    setOutput("");
  };

  const copyAndOpenGov = () => {
    const url = govLink.trim();
    const error = validationMessage(validateGovUrl(url, "GOV post link"));
    if (error) return toast.error(error);
    if (!output) return;
    copyBBCodeAndOpen({
      bbCodeText: output,
      url,
      post: {
        subject: `STP - ${format}`,
        feature: "the STP paperwork generator",
        url: pickPostTarget(url),
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Supervisor Tools" subtitle="Create STP phase, ride-along, and evaluation paperwork." />
      <SupervisorTabs active="stp" />
      <section className="space-y-5 rounded-xl border bg-card p-5">
        <Field label="Format">
          <Select value={format} onValueChange={(value) => { setFormat(value as StpFormat); setOutput(""); }}>
            <SelectTrigger className="w-full sm:max-w-md"><SelectValue placeholder="Choose a paperwork format" /></SelectTrigger>
            <SelectContent>{formats.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date"><Input placeholder="dd/MMM/YYYY" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
          <Field label="Time started"><div className="flex gap-2"><Input placeholder="00:00 am/pm" value={started} onChange={(event) => setStarted(event.target.value)} /><NowTimeButton onFill={setStarted} /></div></Field>
          <Field label="Time ended"><div className="flex gap-2"><Input placeholder="00:00 am/pm" value={ended} onChange={(event) => setEnded(event.target.value)} /><NowTimeButton onFill={setEnded} /></div></Field>
        </div>
        <h2 className="text-lg font-semibold">{isEvaluation ? "Evaluation questions" : "Performance questions"}</h2>
        <div className="grid gap-4">{questions.map((question, index) => <Field key={question} label={question}><Textarea value={answersForFormat[String(index)] ?? ""} maxLength={1000} onChange={(event) => (isEvaluation ? setEvaluationAnswers : setPhaseAnswers)((previous) => ({ ...previous, [String(index)]: event.target.value }))} /></Field>)}</div>
        {!isEvaluation && <div className="grid gap-4">{additionalQuestions.map((question, index) => {
          const answerIndex = phaseRideQuestions.length + index;
          return <Field key={question} label={question}><Textarea value={phaseAnswers[String(answerIndex)] ?? ""} maxLength={1000} onChange={(event) => setPhaseAnswers((previous) => ({ ...previous, [String(answerIndex)]: event.target.value }))} /></Field>;
        })}</div>}
        <Field label="Full session details (bullet point style)">
          <Textarea value={notes} maxLength={2000} onChange={(event) => setNotes(event.target.value)} />
          <p className="text-sm text-muted-foreground">You don&apos;t need to type [*] - each line is automatically added as a bullet.</p>
        </Field>
        <Field label="GOV post link">
          <Input value={govLink} maxLength={500} placeholder="Paste the GOV posting or topic link" onChange={(event) => setGovLink(event.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generate}>Generate format</Button>
          <Button type="button" variant="outline" onClick={resetForm}><RotateCcw className="mr-2 h-4 w-4" />Reset form</Button>
        </div>
        {output && <div className="space-y-3"><Textarea className="min-h-72 font-mono text-xs" value={output} readOnly /><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => copyBBCode({ bbCodeText: output })}><Copy className="mr-2 h-4 w-4" />Copy BBCode</Button><Button variant="outline" disabled={!govLink.trim()} onClick={copyAndOpenGov}><ExternalLink className="mr-2 h-4 w-4" />Copy &amp; Open GOV</Button></div></div>}
      </section>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
