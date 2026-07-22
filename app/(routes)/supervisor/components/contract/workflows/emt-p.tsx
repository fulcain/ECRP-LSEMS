import { Stethoscope } from "lucide-react";
import type { ContractWorkflow } from "../types";
import { DASHBOARD_URL } from "../constants";


export const emtpWorkflow: ContractWorkflow = {
  value: "emt-p",
  shortLabel: "EMT-P Contract",
  label: "EMT-P Contract",
  description:
    "Process a contract switch from Master EMT to EMT-P (part-time contract).",
  accent: "border-violet-400/40 bg-violet-500/20 text-violet-300",
  border: "border-violet-400/30",
  badge: "bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/40",
  icon: <Stethoscope className="h-4 w-4" />,
  steps: [
    {
      id: "emtp-contract",
      title: "Provide the EMT-P Contract",
      description:
        "Send the EMT-P contract topic link so the employee can review and sign the part-time contract before any paperwork is updated.",
      actions: [
        {
          label: "Open EMT-P Contract",
          url: "https://gov.eclipse-rp.net/viewtopic.php?t=148063",
          description: "Government forum EMT-P contract topic.",
        },
      ],
    },
    {
      id: "emtp-roles",
      title: "Update Forum Usergroups",
      description:
        "Assign the EMT-P usergroup on the government site and remove the previous one (e.g. Master EMT or EMR).",
      actions: [
        {
          label: "User Control Panel",
          url: "https://gov.eclipse-rp.net/ucp.php",
          description: "Open the government site User Control Panel.",
        },
      ],
    },
    {
      id: "emtp-dashboard-promote",
      title: "Promote via the Dashboard",
      description:
        "Open the LSEMS Dashboard Roster, locate the employee, and click Promote. Select the role the employee held (e.g. Master EMT or EMR) → EMT-P, then confirm the promotion.",
      actions: [
        {
          label: "Open LSEMS Dashboard",
          url: DASHBOARD_URL,
          description: "Internal LSEMS dashboard for roster updates.",
        },
      ],
    },
    {
      id: "emtp-personnel",
      title: "Update the Personnel File",
      description:
        "Find the Personnel File under the Personnel Files section and post the promotion paperwork. Update the title, rank, callsign, and link the promotion entry under Operational Adjustments.",
      actions: [
        {
          label: "Open Personnel Files",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=605",
          description: "Sub-forum for all LSEMS personnel files.",
        },
        {
          label: "Copy Promotion Paperwork",
          description:
            "Copy the rank adjustment template to paste into the Emplpoyees's personnel file.",
          copyText: `[img]https://i.ibb.co/7Nj9qvT5/Fim-Ceol.png[/img]
[divbox=white]

[b]NAME:[/b]
[b]PREVIOUS RANK:[/b]

[b]ASSUMING RANK:[/b]
[b]DATE OF ADJUSTMENT:[/b]
[hr][/hr]

[ooc]SIGNATURE LINK[/ooc]
[i]{{applicantName}}[/i]
[b]RANK[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter]`,
        },
      ],
    },
    {
      id: "emtp-roster",
      title: "Update the Staff Roster",
      description:
        "Edit the Staff Roster entry to reflect the new callsign and rank under the EMT-P section.",
      actions: [
        {
          label: "Open Staff Roster",
          url: "https://gov.eclipse-rp.net/viewtopic.php?t=9497",
          description: "Official LSEMS Staff Roster topic.",
        },
      ],
    },
    {
      id: "emtp-employeeadj",
      title: "Post Employee Adjustment",
      description:
        "Post the rank adjustment paperwork under Employee Adjustments using the title 'Rank Adjustment | FName LName'.",
      actions: [
        {
          label: "Open Employee Adjustments",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=573",
          description: "Sub-forum used for rank adjustments.",
        },
      ],
    },
      {
      id: "emtp-promotion",
      title: "Link Promotion",
      description:"After posting the promotion paperwork, link it from the Personnel File (Operational Adjustments section).",
      actions:[
        {
          label:"Open Personnel files",
          url:"https://gov.eclipse-rp.net/viewforum.php?f=605",
          description:"LSEMS Personnel files section"
        }
      ]
    },
  ],
  quickLinks: [
    {
      label: "EMT-P Contract",
      url: "https://gov.eclipse-rp.net/viewtopic.php?t=148063",
      description: "Official EMT-P contract topic.",
    },
    {
      label: "Personnel Files",
      url: "https://gov.eclipse-rp.net/viewforum.php?f=605",
      description: "Sub-forum for personnel files.",
    },
    {
      label: "Employee Adjustments",
      url: "https://gov.eclipse-rp.net/viewforum.php?f=573",
      description: "Sub-forum used to post rank adjustments.",
    },
    {
      label: "Staff Roster",
      url: "https://gov.eclipse-rp.net/viewtopic.php?t=9497",
      description: "Official department roster.",
    },
    {
      label: "LSEMS Dashboard",
      url: DASHBOARD_URL,
      description: "Internal roster & operations sheets.",
    },
  ],
  oocList: [
    {
      id: "ooc-emtp-0",
      label: "Discord: change the user to the EMT-P role and remove the previous role.",
    },
    {
      id: "ooc-emtp-1",
      label: "TeamSpeak: change the user to the EMT-P server group and remove the previous one.",
    },
  ],
};
