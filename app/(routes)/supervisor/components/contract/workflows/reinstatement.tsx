import { RefreshCcw, Stethoscope, UserPlus } from "lucide-react";
import type { ContractTab, ContractWorkflow } from "../types";
import { DASHBOARD_URL } from "../constants";


export const reinstatementWorkflow: ContractWorkflow = {
  value: "reinstatement",
  shortLabel: "Reinstatements",
  label: "Reinstatements",
  description:
    "Sign returning LSEMS employees who are rejoining after a previous tenure.",
  accent: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300",
  border: "border-emerald-400/30",
  badge: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40",
  icon: <RefreshCcw className="h-4 w-4" />,
  steps: [
    {
      id: "rei-roles",
      title: "Assign Forum Usergroups",
      description:
        "Set the EMR usergroup as default and the LSEMS usergroup as non-default on the government site.",
      actions: [
        {
          label: "User Control Panel",
          url: "https://gov.eclipse-rp.net/ucp.php",
          description: "Open the government site User Control Panel.",
        },
      ],
    },
    {
      id: "rei-contract",
      title: "Send the Contract Link",
      description:
        "Send the contract link through Discord PM so the reinstatee can review and sign before training.",
      actions: [
        {
          label: "Open Contract Topic",
          url: "https://gov.eclipse-rp.net/viewtopic.php?t=41848",
          description: "Government forum contract link reinstatees must sign.",
        },
      ],
    },
    {
      id: "rei-badge",
      title: "Retrieve the EMR Badge",
      description:
        "Retrieve the badge from the Pillbox MD meeting room. (( Then invite the reinstatee to the faction using the F4 menu ))",
      actions: [],
    },
    {
      id: "rei-dashboard-add",
      title: "Update the Dashboard",
      description:
        "Use the 'Add Employee' option on the LSEMS Dashboard and add them to the dashboard.",
      actions: [
        {
          label: "Open LSEMS Dashboard",
          url: DASHBOARD_URL,
          description: "Internal LSEMS dashboard for roster updates.",
        },
      ],
    },
    {
      id: "rei-email",
      title: "Send Reintroduction Email",
      description:
        "Copy the reintroduction email and send it to the reinstatee so they can re-familiarise themselves with the department before reinstatement training.",
      actions: [
        {
          label: "Copy Reintroduction Email",
          description:
            "Copy the full reintroduction email BBCode to your clipboard.",
          copyText: `[img]https://i.imgur.com/up3tIuh.png[/img]
[lsemssubtitle]Introduction[/lsemssubtitle]
[divbox=white]
This re-introduction email aims to give you a clear understanding of where to find important information, as well as an overview of what your training schedule will be consisted of.
[/divbox]
[lsemssubtitle]Useful Links[/lsemssubtitle]
[divbox=white]
The following is a set of links that contains useful and important information about LSEMS. If you have been away from the department for a while, it is highly recommended that you read through everything in the handbook.
[color=firebrick][list]
[*][b][url=https://gov.eclipse-rp.net/viewforum.php?f=804]General LSEMS Handbook[/url]
[*][url=https://gov.eclipse-rp.net/viewtopic.php?t=106076]Section 8 - Medical Guide[/url]
[*][url=https://gov.eclipse-rp.net/viewtopic.php?t=106080](( Section 12 - Commands))[/url]
[*][url=https://gov.eclipse-rp.net/viewtopic.php?t=106082]Section 14 - EMR Quick Guide[/url]
[/list][/color][/b]
[/divbox]
[lsemssubtitle]Training Guidelines[/lsemssubtitle]
[divbox=white]
If your skills as an EMT have not diminished, you will most likely follow the training schedule below. If you need to brush up on some topics more, you may get assigned mandatory ride-along(s) to ensure you understand everything.

When you request a training session, you will need to use our department's radio frequency, 918, to do so. Below, find a noted example of what you will radio in. You will need to replace X with the training phase you require. [b]Please ensure you mention that it is a reinstatement training to avoid any confusion with regular training.[/b]
[color=transparent]spacer[/color]
[center]"EMR [b]Lastname[/b] is requesting a field training officer to conduct [b]X[/b] reinstatement training session."[/center]
[b][i](( Make sure to transmit this via text chat [c]/r[/c] ))[/i][/b]
[color=transparent]spacer[/color]
[center][color=firebrick][b]Keep in mind that you cannot go on duty without a trainer![/b][/center]
[/color]
[/divbox]
[lsemssubtitle]Training Schedule[/lsemssubtitle]
[divbox=white]
[center][b]Reinstatement Phase I[/b][/center]
In this phase, you will be going over most things you need to know to function as an EMT, in addition to everything that may have changed in the time you were away.
[hr][/hr]
[center][b]Reinstatement Phase II[/b][/center]
This is essentially giving you room to breathe and showcase how well you can hold your ground, and it serves as the last step to catch any errors before the certification. After completing this, you can go on duty as an EMR unit, if there is an EMT-I+ on shift.
[hr][/hr]
[center][b]Certification[/b][/center]
You will be expected to give your best effort for this, as this intends to put your skills to the test with no help from the trainer. This will be conducted by a Junior Paramedic+, which has a minimum time of 1 hour 30 minutes (can be more, depending on the trainer's discretion).
[/divbox]
[lsemssubtitle]Important Reminders[/lsemssubtitle]
[divbox=white]
You may not go on duty without a trainer. If no one is available, please utilize the [url=https://gov.eclipse-rp.net/viewtopic.php?t=93170]Student Area [b](click!)[/b][/url] to request for training. Alternatively, you may use the format and guide below to reach out to other employees if you wish to schedule in that manner instead.
[spoiler=Email Format & Guide]
[divbox=white]
Are you looking to contact another member of the department? We suggest using our email format below which will assist you in communicating with other members of the Los Santos Emergency Medical Services. Make sure to [b]preview[/b] before sending!

You can get the basic signature instructions [url=https://gov.eclipse-rp.net/viewtopic.php?p=451775]here - Section 13.3 of the General Handbook.[/url]

[spoiler=Email Format]
[code]
[img]https://i.imgur.com/rLIJtNZ.png[/img]
[divbox=white]
[img]https://i.imgur.com/9uGiPqF.png[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[size=95]"One Team, One Mission, Saving Lives"[/size][/font]
[size=115]Subject[/size]
[size=95]DD/MMM/2024[/size]
[/right][/aligntable]
[hr]

[hr][/hr]

Kind regards,

[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
[b]Rank[/b]
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[LSEMSfooter][/LSEMSfooter]
[/code]
[/spoiler]

We have also written an email guide that explains how to send an email on the government site with clear instructions on how to do so which will take you through the steps one at a time.

[spoiler=Email Guide]
[divbox=white]

[b][size=125]Step 1. Creating a new email[/size][/b]
[img]https://i.imgur.com/hVyQV6i.png[/img]

Click either the "Compose Message" or "New PM" button. This will lead you to the creation interface.

[hr]
[b][size=125]Step 2. Adding the recipient(s)[/size][/b]

[img]https://i.imgur.com/2VoZdha.png[/img]

When adding individual people to the list of recipients, you simply input their name, then click it when it pops up. After that, you need to click "Add" for the name to be attached to the list of recipients. [b]If you do not click add, the person will not get the email![/b]

If you are adding multiple people, it is highly suggested that you add them one by one.

On the right, you can also see groups present. These have specific use cases and are generally not utilized in day-to-day situations. They function the same way as adding individuals to the recipient list.

[hr]
[b][size=125]Step 3. Verifying the list[/size][/b]

[img]https://i.imgur.com/3Q2INrs.png[/img]

As you can see, the name(s) will show if you've done it correctly.

If you do not see them in this list, the email will not be sent to them.
[hr]
[b][size=125]Step 4. Basic Formatting[/size][/b]

Copy the format you can find in the spoiler above, then paste the format into the main text box.

You can then fill out the information including the date, subject, email content, and your signature.

[hr]
[b][size=125]Step 5. Preview & Send[/size][/b]

Once previewing the email, you will see it as the recipient would. From here, you can see what you will need to change before sending the email.

Make sure to always preview before sending, as even the best of us make mistakes!

Once you are ready to send the email, click submit!

[hr]
[b][size=125][ooc]Step 6. Discord Ping[/ooc][/size][/b]

(( Go over to the MD Discord, into the #notifications channel, and tag the appropriate people or group! ))
[/divbox]
[/spoiler]
[/spoiler]
[hr][/hr]
You should ask questions if something is unclear to you. This is for your own good!
[hr][/hr]
As an EMR, you are [b]not[/b] expected to meet the [b]5 hours[/b] weekly requirement. Note that this does not mean you should neglect your training. If you feel overwhelmed, stuck or have any difficulties through your training, make use of [b]optional ride-alongs[/b]. There is no limitations to how many optional ride-alongs you may do.
[hr][/hr]
If you need to take a longer break between the Reinstatement Training phases, please [url=https://gov.eclipse-rp.net/viewforum.php?f=613]Submit a Leave of Absence here.[/url]
[hr][/hr]
If you would like to resign from LSEMS, as sad as it'll be to see you go, please do make use of the correct method. You can find the link here: [url=https://gov.eclipse-rp.net/viewforum.php?f=614]Submit Resignation here[/url]
[hr][/hr]
[color=transparent]spacer[/color]
[center][i]Best of luck with your reinstatement training![/i][/center]
[/divbox]
[lsemsfooter][/lsemsfooter]`,
        },
      ],
    },
    {
      id: "rei-reinstprofile",
      title: "Create Reinstatement Training Profile",
      description:
        "Create the Reinstatement Training Program profile for the EMR following the standard format.",
      actions: [
        {
          label: "Open Reinstatement Profile Template",
          url: "https://gov.eclipse-rp.net/viewtopic.php?t=90535",
          description: "Standard reinstatement profile template on the forum.",
        },
      ],
    },
    {
      id: "rei-archive",
      title: "Search the Personnel File Archive",
      description:
        "Look up the previous personnel file in the archive. If it is up to date, unarchive it and refresh the content; if it is outdated, create a fresh file and link back to the old one.",
      actions: [
        {
          label: "Open Personnel File Archive",
          url: "https://gov.eclipse-rp.net/viewforum.php?f=624",
          description:
            "Archive sub-forum used to locate existing personnel files.",
        },
      ],
    },
    {
      id: "rei-roster",
      title: "Update the LSEMS Staff Roster",
      description:
        "Add the reinstatee to the Staff Roster using the same format used for regular hires.",
      actions: [
        {
          label: "Open Staff Roster",
          url: "https://gov.eclipse-rp.net/viewtopic.php?t=9497",
          description: "Official LSEMS Staff Roster topic.",
        },
        {
          label: "Copy Roster Entry",
          description:
            "Copy the standard Staff Roster template to paste into the roster topic.",
          copyText:
            "[b]X[/b] - [url={{employeeProfileLink}}]#{{employeeNumber}}[/url] - [b]EMR[/b] - [url={{personnelFileLink}}]{{applicantName}}[/url]",
        },
      ],
    },
    {
      id: "rei-application",
      title: "Close the Reinstatement Application",
      description:
        "Use the Reinstatement Accepted format to close the application, then move it to the Reinstatement Archive.",
      actions: [],
    },
  ],
  quickLinks: [
    {
      label: "Contract Topic",
      url: "https://gov.eclipse-rp.net/viewtopic.php?t=41848",
      description: "Official contract reinstatees must sign.",
    },
    {
      label: "Reinstatement Profile",
      url: "https://gov.eclipse-rp.net/viewtopic.php?t=90535",
      description: "Reinstatement training profile template.",
    },
    {
      label: "Personnel Files Archive",
      url: "https://gov.eclipse-rp.net/viewforum.php?f=624",
      description: "Archive used to track previous tenure.",
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
      id: "ooc-rei-0",
      label:
        "Send the LSEMS Discord invite via Discord PM if the reinstatee is no longer in the server.",
    },
    { id: "ooc-rei-1", label: "Discord: assign 'EMR Trainee' and 'Employee' roles." },
    {
      id: "ooc-rei-2",
      label:
        "TeamSpeak: rename to IC format and assign 'Emergency Medical Services' & '[LSEMS] EMR' server groups.",
    },
    {
      id: "ooc-rei-3",
      label:
        "Submit a government site name-change request in the LSEMS Discord #Forum-request channel.",
    },
    {
      id: "ooc-rei-4",
      label:
        "Move any Admin log from the reinstatement topic into #Player-Logs on Discord (crop out usernames if visible).",
    },
  ],
};
