import { UserPlus } from "lucide-react";
import type { ContractWorkflow } from "../types";
import { DASHBOARD_URL, staffRosterEntry } from "../constants";
import {
  GOV_PM_COMPOSE_URL,
  GOV_STAFF_ROSTER_EDIT_URL,
} from "@/app/helpers/govLinks";
import { userGroupsHref } from "@/lib/user-groups";
import { FTP_DOCUMENTS } from "@/app/constants/divisions/ftd/ftp-content";


export const recruitmentWorkflow: ContractWorkflow = {
  value: "recruitment",
  shortLabel: "Regular Recruitment",
  label: "Regular Recruitment",
  description:
    "Sign LSEMS applicants joining as new Emergency Medical Responders (EMR).",
  accent: "border-sky-300/40 dark:border-sky-400/40 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300",
  border: "border-sky-300/30 dark:border-sky-400/30",
  badge: "bg-sky-100 dark:bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40",
  icon: <UserPlus className="h-4 w-4" />,
  steps: [
    {
      id: "rec-roles",
      title: "Assign Forum Usergroups",
      description:
        "Use the app's User Groups section to set EMR as the default group and LSEMS as a non-default group.",
      actions: [
        {
          label: "Open EMR Group",
          description:
            "Open the app's User Groups tool with this applicant's name and the EMR group ready to add them to.",
          internal: {
            href: userGroupsHref({
              member: "{{applicantName}}",
              group: "emr",
            }),
            label: "User Groups",
          },
        },
        {
          label: "Open LSEMS Group",
          description:
            "Open the app's User Groups tool with this applicant's name and the LSEMS group ready to add them to.",
          internal: {
            href: userGroupsHref({
              member: "{{applicantName}}",
              group: "lsems",
            }),
            label: "User Groups",
          },
        },
      ],
    },
    {
      id: "rec-contract",
      title: "Send the Contract Link",
      description:
        "Send the applicant the official LSEMS contract. (( You can send it over Discord DM ))",
      actions: [
        {
          label: "Open Contract Topic",
          url: "https://gov.eclipse-rp.net/viewtopic.php?t=41848",
          description: "Government forum contract link applicants must sign.",
        },
      ],
    },
    {
      id: "rec-badge",
      title: "Retrieve the EMR Badge",
      description:
        "Grab their badge from the Pillbox MD meeting room. (( Then invite them to the faction using the F4 menu ))",
      actions: [],
    },
    {
      id: "rec-email",
      title: "Send Introduction Email",
      description:
        "Copy the introduction email and send it to the applicant so they can read every section before any training begins.",
      actions: [
        {
          label: "Copy & Open Introduction Email",
          description:
            "Copy the introduction email and open a new GOV private message with its title and body ready to fill.",
          url: GOV_PM_COMPOSE_URL,
          postTitle: "Introduction Email",
          copyText: `[img]https://i.ibb.co/TBb1HVWP/CMVEk-E1.png[/img]

[lsemssubtitle]Introduction[/lsemssubtitle]

[divbox=white]
Congratulations on your employment with the [b]Los Santos Emergency Medical Services[/b], we are very happy to have you joining and representing us. But before you spread your wings, you have to go through some training, which begins with this email. During this introduction email, you will find information that will be crucial for your training and aims to strengthen you before you first come into the department on your first day to undergo your training phases.

We [b]understand[/b] that this may be a [b]large block of text[/b] that may overwhelm you at first but we aim to provide the best experience and training for each new [b]Emergency Medical Responder[/b] that joins and this email will be very useful to you, both now and throughout your training.

As a general heads up, while you are a trainee you will always be on duty with a trainer, and as such cannot clock on duty at all without one (unless specifically instructed to).
[/divbox]

[lsemssubtitle]Useful Links[/lsemssubtitle]

[divbox=white]
Below we have attached a few pieces of documentation that you may consider standard operating procedures that will assist you when you first come on shift and have an understanding of what to expect.

[list]
[*]First and foremost, the LSEMS department manuals. In here you will find each standard operating procedure which is broken into fifteen sections, and a table of content at the top of the page which will direct and assist you in your training. [i]Please try to read through every section at least once.[/i]
[list][url=https://gov.eclipse-rp.net/viewforum.php?f=804]LSEMS - Department Manuals[/url][/list]

[*]The next important link is our Medical Guide. This document is designed for employees to stay up to date on treatment protocols that are defined and specified by the medical director of San Andreas and will provide you with base information on treating a wound.
[list][url=https://gov.eclipse-rp.net/viewtopic.php?t=106076]Section 8 - Medical Guide[/url][/list]

[*]A section designed purely for aiding you in the training process, the EMR Quick Guide. We recommend reviewing this document to have an understanding of how we communicate over the radio professionally, understanding what to do step by step when taking on a call, how to handle the department radio and the type of calls we receive from this, unit management which explains how to communicate internally, base scene management introductions and what blockades we have and finally our radio ten codes and status codes.
[list][url=https://gov.eclipse-rp.net/viewtopic.php?t=106082]Section 14 - EMR Quick guide[/url][/list]

[*][ooc]Please see below for the faction commands that we have access to. You will learn about these commands throughout your training, please do note that some of these commands come with strict policies which you will be taught about during your phases. Any form of [b]abuse[/b] is a [b]serious offense[/b] and will be [b]handled as such[/b].[/ooc]
[list][url=https://gov.eclipse-rp.net/viewtopic.php?t=106080][ooc]Section 12 - Commands[/ooc][/url][/list]

[*]Lastly, All LSEMS employees are obligated to wear a plainly visible, powered-on, and unobstructed LSEMS-issued Bodycam at all times while on duty. Further information is found below.
[ooc]Additionally, a guide for [b][color=#BF0000]proper Bodycam Roleplay[/color][/b] (and taking a screenshot for it) can also be found below.[/ooc]
[list][url=https://gov.eclipse-rp.net/viewtopic.php?p=451765#21]Section 3.21 - Bodycam [ooc]& Bodycam RP How-to[/ooc][/url][/list]
[/list]
[/divbox]

[lsemssubtitle]Training[/lsemssubtitle]

[divbox=white]
[b]Training[/b] is going to be the most important to you as a newly recruited member of the Los Santos Emergency Medical Services as this is where you will work with our amazing Field Training Officers to conduct your training and begin to further learn how the entire department functions, one step at a time.

When you request a training session in the future, you will need to use our department's radio frequency, [b]918[/b], to do so. Below, find a noted example of what you will radio in. You will need to replace X with the training phase you're after such as [i]Phase 2[/i] or a [i]Mandatory Ridealong[/i].

[center]"EMR [b]Lastname[/b] is requesting a field training officer to conduct [b]X[/b] training session."[/center]

[b][i][color=#BF0000]Keep in mind that you cannot go on duty without a trainer![/color][/i][/b]

[b][i](( Make sure to transmit this via text chat [c]/r[/c] ))[/i][/b]

[hr][/hr]

See below for an outline of your [b]training schedule[/b], please do note there may be some deviations depending on how well you understand the material, and how busy the shifts are during your training. If the shifts are not filled with ample activity, you may be assigned an additional ridealong or two to further understand the subjects that you were taught, otherwise, you may take [b]optional ridealongs*[/b] throughout this schedule to have a further understanding out in the field.

[i]*Optional ridealongs can be requested in the same manner as other training sessions.[/i]

[spoiler=Training Schedule]
[center][b]Introduction
Mandatory 30 Minute Wait
Phase 1
Phase 2
Mandatory Ride-Along(s)
Phase 3
Mandatory Ride-Along(s)
Pre-Certification
Certification[/b][/center]
[/spoiler]

[b]Introduction[/b]
The "welcome to the department" session, during which you will be presented with information about the department as a whole and be given a tour around the hospitals that we operate out of and information about LSEMS policies and procedures. After the Introduction, you are placed on a 30-minute 'cooldown', during which you are supposed to give the reading material (found in the above section "Useful Links"), a solid read, as it is of paramount importance for your smooth progress.

[b]Phase 1[/b] - [i]1 Hour minimum, 2 Hours maximum[/i]
This phase goes directly over [b]radio usage[/b], [b]radio codes[/b], and general [b]unit management[/b], which includes [i]responding[/i] to calls, [i]going to[/i] them and [i]closing[/i] them when necessary. During the cooldown, you can read over the [b]EMR Quick Guide[/b] and see how exactly we say our radio codes over the radio, and you can use this as a frame of reference throughout your training.

[b]Phase 2[/b] - [i]1 Hour 15 Min, 2 Hours 30 Min maximum[/i]
This phase's primary objective is to teach you how to quickly and effectively provide treatment to a patient. [b]You are expected to know how to perform the treatment at a basic level at the start[/b], and you will learn more throughout the phase and future training sessions. For this phase, it is very important to read the [b]Medical Guide[/b], linked a bit below, at least once.

[b](([/b] [i]You are not required nor expected to have any real-life medical knowledge prior to, during, or after this session, but you are expected to understand the basic principles behind injury treatment using /me's and /do's. You will learn plenty about this from examples throughout training.[/i] [b]))[/b]

Additionally, Phase 2 goes over drug testing, methadone, as well as using the breath analyzer to detect blood alcohol content.

[b]Mandatory Ridealong[/b] - [i]1 Hour minimum, 2 Hour maximum[/i]

[b]Phase 3[/b] - [i]1 Hour minimum, 2 Hours maximum[/i]
This phase focuses on [b]driving and scene management[/b]. During it, you will be taken to a practice track where you can really get a good feel for how the ambulance handles and will be free to try out different speeds and turns to get you as prepared for the road as possible. You will also learn how to secure a scene using various blockades and cones in order to maximize the patient's and medics' safety.

[b]Mandatory Ridealong[/b] - [i]1 Hour minimum, 2 Hour maximum[/i]

[b]Quiz[/b] - [i]Marked by Field Training Instructors, to be submitted if Pre-Certification is Failed[/i]
The quiz consists of multiple-choice questions, as well as a few situational questions. Everything in the quiz will be related to topics you covered in your training phases, as well as the department manuals.
The scoring is fairly lenient, as the purpose of the quiz is to correct anything you missed in training.
[b]You will be sent the quiz if you [i]FAIL[/i] your Pre-Certification.[/b]

[b]Pre-Certification[/b] - [i]1 Hour 30 Min minimum, 3 Hour maximum duration[/i]
This is an [b]evaluation[/b] session during which your knowledge from the previous training sessions is put to the test, showing that you're capable of progressing to your Certification. You may ask questions during this session, but you should have most things under control. After successfully passing this, you will be permitted to clock on as EMR-1 provided there is at least 1 10-8 EMT-I+ on shift. This is highly encouraged to build out your own confidence as a medic and we allow you to judge for yourself how confident you are for your certification.

[b]Certification[/b] - [i]1 Hour 30 Min minimum, 3 Hours maximum[/i]
Simply put, you do everything while being supervised and evaluated. You cannot ask questions during the session. The supervisor assists only if the situation gets too erratic, or if a critical mistake occurs that could endanger anyone present.

[b]If you are unable to find a Field Training Officer to conduct your training sessions or struggle to find someone available at your particular time, please utilize the EMR Requests subforum which you can access [url=https://gov.eclipse-rp.net/viewtopic.php?t=93170]here - EMR Requests[/url][/b]
[/divbox]

[lsemssubtitle]Leave of absence[/lsemssubtitle]

[divbox=white]
As explained during your interview you're granted [b]4 weeks[/b] to complete your training, with an additional 1 week of leave of absence during this period. If you choose to go on an LOA for any valid reason you will need to make a post [url=https://gov.eclipse-rp.net/viewforum.php?f=613]here[/url] using the formatting found in the topic labeled [b][i][Form][Info] Leave of Absence Request Form[/i][/b].

Please see a list of information regarding the LOA system. This information can also be found on the Leave of Absence Request Form which you can find [url=https://gov.eclipse-rp.net/viewtopic.php?t=31821]here[/url].
[list]
[*]LOAs cannot be backdated.
[*]For extenuating circumstances, please contact a member of the Command Team.
[*]There is a 30-day grace period before an employee is able to file another LOA after filing a 30-day LOA.(with consideration to special cases)
[*]LOA should be filled two days in advance to allow ample time for the leadership team to process the request (with consideration to special cases)
[*]((LOAs are designed for you to step away from the game, however they may be used for either IC reasons, OOC reasons, or both. Ultimately, real life takes priority. If you have a reason that you do not wish to make public, you may reach out to anyone from High Command privately on discord with the reason.))
[/list]

If you reach the end of the 4 week timeframe for your training, and you have no LOA posted (again, maximum of 1 week), you may face termination for failing to complete your training in an acceptable timeframe.
[/divbox]

[lsemssubtitle]Email Format[/lsemssubtitle]

[divbox=white]
Are you looking to contact another member of the department? We suggest using our email format below which will assist you in communicating with other members of the Los Santos Emergency Medical Services. Make sure to [b]preview[/b] before sending!

You can get the basic signature instructions [url=https://gov.eclipse-rp.net/viewtopic.php?p=451775]here - Section 13.3 of the General Handbook.[/url]

[spoiler=Email Format]
[code]
[img]https://i.ibb.co/cXr7XYkS/HNP4ks-W.png[/img]
[divbox=white]
[img]https://i.ibb.co/TMRZzNYb/9u-Gi-Pq-F.png[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[size=95]"One Team, One Mission, Saving Lives"[/size][/font]
[size=115]Subject[/size]
[size=95]DD/MMM/2022[/size]
[/right][/aligntable]
[hr]

[hr][/hr]

Kind regards,

[img]SIGNATURE[/img]
[i]Medic Name[/i]
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
[img]https://i.ibb.co/S7X8QFCW/h-Vy-QV6i.png[/img]

Click either the "Compose Message" or "New PM" button. This will lead you to the creation interface.

[hr]
[b][size=125]Step 2. Adding the recipient(s)[/size][/b]

[img]https://i.ibb.co/CKcpK4XJ/2Vo-Zdha.png[/img]

When adding individual people to the list of recipients, you simply input their name, then click it when it pops up. After that, you need to click "Add" for the name to be attached to the list of recipients. [b]If you do not click add, the person will not get the email![/b]

If you are adding multiple people, it is highly suggested that you add them one by one.

On the right, you can also see groups present. These have specific use cases and are generally not utilized in day-to-day situations. They function the same way as adding individuals to the recipient list.

[hr]
[b][size=125]Step 3. Verifying the list[/size][/b]

[img]https://i.ibb.co/Pz6yWQXR/3Q2INrs.png[/img]

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

[/divbox]

[lsemssubtitle]Reminders[/lsemssubtitle]

[divbox=white]
During the EMR stage of your training, you cannot be on duty alone without a field training officer to supervise you - any form of clocking on without a trainer being with you can and will lead to disciplinary action.

You may begin [b]Phase I[/b] after your 30 minute cooldown has passed however, you are welcome to do optional ride-alongs with employees if you wish, but, if you do not go over the material you may be sent back to study! Generally speaking, it is best to go over the material in a calm environment so you can better understand it.

[hr][/hr]

As an EMR, you are [b]not[/b] expected to meet the [b]2.5 hours[/b] weekly requirement. Note that this does not mean you should neglect your training. If you feel overwhelmed, stuck or have any difficulties through your training, make use of [b]optional ride-alongs[/b]. There is no limitations to how many optional ride-alongs you may do.

[hr][/hr]

If you would like to resign from LSEMS, as sad as it'll be to see you go, please do make use of the correct method. You can do that [url=https://gov.eclipse-rp.net/viewforum.php?f=614]here[/url], we recommend that you reach out to a supervisor before submitting a resignation and discussing any potential issues as we'd hate to see you leave the department.
(( If there is an issue that is OOC in nature, please do not hesitate to reach out to any member of the leadership team privately on Discord. ))

[hr][/hr]

[center][i][b]Reading this has already given you a serious head start, best of luck with your training![/b][/i][/center]

[/divbox]`,
        },
      ],
    },
    {
      id: "rec-ftp",
      title: "Create a Field Training Profile",
      description:
        "Create a new Field Training Program profile for the new EMR using the standard format.",
      actions: [
        {
          label: "Open FTP Forum",
          url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=617",
          description: "Open the posting page for Field Training Program profiles.",
        },
          {
          label: "Copy & Open Field Training Profile",
          description:
            "Copy the Field Training profile and open its posting page with the title and body ready to fill.",
          requiresName: true,
          url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=617",
          postTitle: "[Pending Introduction] {{applicantName}}",
          copyText: FTP_DOCUMENTS.regular,
        },
        {
          label: "Copy FTP Title",
          description: "Copy the Field Training Program profile title.",
          requiresName: true,
          copyText: "[Pending Introduction] {{applicantName}}",
        },
      ],
    },
    {
      id: "rec-personnel",
      title: "Generate a Personnel File",
      description:
        "Create a new Personnel File thread under the Personnel Files section using the official LSEMS file layout.",
      actions: [
        {
          label: "Open Personnel Files",
          url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=605",
          description: "Sub-forum for all LSEMS personnel files.",
        },
        {
          label:"Copy & Open Personnel File",
          description:
            "Copy the personnel file and open its posting page with the title and body ready to fill.",
          requiresName: true,
          url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=605",
          postTitle: "EMR | {{applicantName}}",
          copyText:`[img]https://i.ibb.co/FL4nLkwT/nh3xp60.png[/img]
[lsemssubtitle]EMPLOYEE DETAILS[/lsemssubtitle]
[divbox=white]
[b]Full Name:[/b] {{applicantName}}
[b]Phone:[/b] {{phone}}
[b]Badge Number:[/b] {{badgeNumber}}
[b]Callsign:[/b] XXXXX
[b]Rank:[/b] EMR
[b]Date Hired:\[/b\] {{dateHired}}
[/divbox]

[lsemssubtitle]EMPLOYMENT DETAILS[/lsemssubtitle]
[divbox=white]
[spoiler=Operational Adjustments]
[url=LINK]PROMOTION -> DD/MMM/YYYY[/url]
[url=LINK]PROMOTION -> DD/MMM/YYYY[/url]
[url=LINK]PROMOTION -> DD/MMM/YYYY[/url]
[/spoiler]

[spoiler=Divisional Adjustments]
[url=LINK]JOINED DIVISION OR PROMOTION IN DIVISION -> DD/MMM/YYYY[/url]
[/spoiler]

[spoiler=LOA / ROH]
[url=LINK]LOA  -> DD/MMM/YYYY-DD/MMM/YYYY[/url] 
[/spoiler]

[spoiler=Disciplinary Actions]
[spoiler=DD/MMM/YYYY | ACTION TAKEN - BECAUSE OF]
[url=]Paperwork link[/url]
[/spoiler]
[/spoiler]

[spoiler=Commendations]
[spoiler=DD/MMM/YYYY | GIVEN BY]
[url=]Paperwork link[/url]
[/spoiler]
[/spoiler]

[spoiler=Discharges]
[spoiler=DD/MMM/YYYY | Honorable/Dishonorable | DISCHARGED BY]
[url=]Paperwork link[/url]
[/spoiler]
[/spoiler]


[/divbox][LSEMSfooter][/LSEMSfooter]`
        },
           {
          label: "Personnel file title",
          description:"Copy the personnel file title.",
          copyText: "EMR | {{applicantName}}",
        },
      ],
    },
    {
      id: "rec-roster",
      title: "Update the LSEMS Staff Roster",
      description:
        "Add the new EMR to the Staff Roster using the standard format (badge number, callsign placeholder, rank, name).",
      actions: [
        {
          label: "Copy & Open Staff Roster",
          url: GOV_STAFF_ROSTER_EDIT_URL,
          description:
            "Copy this hire's Staff Roster entry and open the roster topic to paste it into.",
          requiresMetadata: ["employeeProfileLink", "personnelFileLink"],
          copyText: staffRosterEntry("EMR"),
        },
        {
          label: "Copy Roster Entry",
          description:
            "Copy the standard Staff Roster template to paste into the roster topic.",
          requiresMetadata: ["employeeProfileLink", "personnelFileLink"],
          copyText:
            "[b]X[/b] - [url={{employeeProfileLink}}]#{{personnelFileNumber}}[/url] - [b]EMR[/b] - [url={{personnelFileLink}}]{{applicantName}}[/url]",
        },
      ],
    },
    {
      id: "rec-application",
      title: "Close & Archive the Application",
      description:
        "Use the Application Processed (Accepted) format to close the application, then move it into the Accepted Applications archive.",
      actions: [
        {
          label: "Open Accepted Format",
          internal: { href: "/divisions/red", label: "RED Formats" },
          description:
            "Generate the 'Application Accepted' BBCode on the RED Formats page.",
        },
      ],
    },
    {
      id: "rec-dashboard",
      title: "Update the Dashboard",
      description:
        "Use the 'Add Employee' section on the LSEMS Dashboard so the new EMR is reflected in the activity sheets.",
      actions: [
        {
          label: "Open LSEMS Dashboard",
          url: DASHBOARD_URL,
          description: "Internal LSEMS dashboard for roster updates.",
        },
      ],
    },
  ],
  quickLinks: [
    {
      label: "Contract Topic",
      url: "https://gov.eclipse-rp.net/viewtopic.php?t=41848",
      description: "Official contract applicants must sign.",
    },
    {
      label: "Personnel Files",
      url: "https://gov.eclipse-rp.net/viewforum.php?f=605",
      description: "Sub-forum for personnel files.",
    },
    {
      label: "Staff Roster",
      url: "https://gov.eclipse-rp.net/viewtopic.php?t=9497",
      description: "Official department roster.",
    },
    {
      label: "FTP Forum",
      url: "https://gov.eclipse-rp.net/viewforum.php?f=617",
      description: "Field Training Program profiles.",
    },
    {
      label: "LSEMS Dashboard",
      url: DASHBOARD_URL,
      description: "Internal roster & operations sheets.",
    },
  ],
  oocList: [
    {
      id: "ooc-rec-0",
      label:
        "On Discord, assign the 'EMR Trainee' and 'Employee' roles, then remove the 'Applicant' role.",
    },
    {
      id: "ooc-rec-2",
      label:
        "Send the LSEMS Discord invite via Discord PM if the new EMR joins the server for the first time.",
    },
    {
      id: "ooc-rec-3",
      label:
        "Move the Admin log from the application into the #Player-Logs channel on Discord (crop out the username if visible).",
    },
    {
      id: "ooc-rec-4",
      label:
        "Use the 'Add Employee' section on the LSEMS Dashboard so the new EMR appears on the sheets.",
    },
  ],
};
