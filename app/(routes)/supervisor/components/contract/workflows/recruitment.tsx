import { UserPlus } from "lucide-react";
import type { ContractWorkflow } from "../types";
import { DASHBOARD_URL } from "../constants";


export const recruitmentWorkflow: ContractWorkflow = {
  value: "recruitment",
  shortLabel: "Regular Recruitment",
  label: "Regular Recruitment",
  description:
    "Sign LSEMS applicants joining as new Emergency Medical Responders (EMR).",
  accent: "border-sky-400/40 bg-sky-500/20 text-sky-300",
  border: "border-sky-400/30",
  badge: "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40",
  icon: <UserPlus className="h-4 w-4" />,
  steps: [
    {
      id: "rec-roles",
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
          label: "Copy Introduction Email",
          description:
            "Copy the full introduction email BBCode to your clipboard.",
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
          url: "https://gov.eclipse-rp.net/viewforum.php?f=617",
          description: "Field Training Program profiles sub-forum.",
        },
          {
          label: "Field Training Profile BBCode",
          description: "Field Training Program profiles BBCode",
          copyText:`[img]https://i.ibb.co/0R8458jJ/f-SVDi7f.png[/img]
[lsemssubtitle]STUDENT INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Student Name:[/b] {{applicantName}}
[b]Date Hired:\[/b\] {{dateHired}}
[b]Mark the corresponding checkbox with a 'cbc' upon completion of each Phase or Mandatory item.[/b]
- [b]If an additional Mandatory is required,[/b] please list it [i]below the current Phase being conducted[/i].
[cb]Introduction
[cb]Phase 1
[cb]Phase 2
[cb]Phase 2 Mandatory
[cb]Phase 3
[cb]Phase 3 Mandatory
[cb]Pre-Certification
[cb]Certification
[/divbox]

[lsemssubtitle]SESSION INFORMATION AND GUIDES[/lsemssubtitle]
[spoiler=Introduction]
[divbox=white]
[lsemssubtitle]INTRODUCTION - EMT-I+[/lsemssubtitle]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list=1]
[*][color=#800000][b]Uniform and On Duty[/b][/color]
[list][*]Let the EMR know that they [b]cannot[/b] be on duty without a trainer. Make sure they understand this. If they cannot find a trainer by using the radio then direct them to the Student area.
[*][ooc]Inform them that they must first reach out in /r for an FTO and if they have no luck then they can also reach out on the MD discord in the #fto-availability channel using the copy paste provided.[/ooc]
[*]Bring the EMR into our locker room and show them where their locker is and provide them with their uniform, bodycam and ALS bag.
[*][ooc]Explain how to use the /FL command, and the surrounding RP. Make sure they know they must RP pulling out equipment as well as putting it back.[/ooc]
[*]We are required to wear body cams on duty, and they are provided by LSEMS. Make sure the EMR is aware that they must have a bodycam running when on shift, at all times and demonstrate how to do so correctly.
[ooc]Educate them on Bodycam RP rules, and explain that you will need to RP putting one on but you are not required to use recording software. If you can record, it is recommended but not required.[/ooc]
[*][ooc]Let them know that they do NOT have access to everything they see in the uniform menu. They can only wear uniforms that they ICly have access to. [/ooc]
[*]Let them know that if they change their name at all for any reason then they MUST notify Command and High Command
[*][b]Inform the EMR, if they are detained and arrested, they must notify Command and High Command immediately with what they were charged with.[/b] Please have the EMR repeat this back to you.
[*]Let them know that if they are IA'ed for any reason, they cannot talk to [b]anyone[/b] about it. They can only speak to those handling the IA report when asked directly about the report.
[*][ooc]IA reports cannot be talked about OOC as well, about an IC IA report nor an OOC IA report.[/ooc]
[*]Inform the EMR of the social media policy: no livestreaming and/or donating to livestreams on duty and if you are distracted by your phone, do not use it on duty.
[/list]
[*][color=#800000][b]Unit Management[/b][/color]
[list]
Explain the following to the EMR:
[list]
[*]How to create a unit (( /createunit [name] ))
[*]Renaming the unit (( /renameunit [name] ))
[*]Disbanding the unit (( /disbandunit ))
[*]Joining a unit (( /joinunit [name] ))
[*]Leaving a unit (( /leaveunit ))
[/list]
[*]Have the EMR create the unit, but make sure they ran through all four of the above at least once. And let them know that they will be creating the unit from here on out.
[*]Inform the EMR that there can be a maximum of 2 medics per unit, FTP callsigns and high command are exempt from this rule.
[/list]
[*][color=#800000][b]Callsigns[/b][/color]
[list]
[*]Shortly explain to the EMR how our rank system works.
[*]Inform the EMR about the existence of Zulu (Z), Echo (E), Delta (D), Oscar (O), Charlie (C), Bravo (B), and Alpha (A).
[list]
[*][b]Zulu [/b]- Training Units Z-11, D-1Z, O-1Z, C-1Z, B-1Z, A-1Z
[*][b]Echo [/b]- EMTs (EMT-B/I/A/P)
[*][b]Delta [/b]- Master EMT
[*][b]Oscar [/b]- Supervisors-in-training (Junior Paramedic)
[*][b]Charlie [/b]- Supervisors (Paramedic/Senior Paramedic/Lead Paramedic)
[*][b]Bravo [/b]- Command (Lieutenant/Captain/Commander)
[*][b]Alpha [/b]- High Command (Deputy Chief, Assistant Chief, Chief of EMS)
[/list]
[*]Explain to the EMR that the highest-ranked medic on a scene is the scene leader.
[*]Explain that callsigns range from Echo-11 to Echo-99, whilst Delta and Charlie callsigns range from 1-10 or as necessary.
[*]Remind the EMR that they cannot leave a scene without first acquiring permission from whoever is scene leader.

[*]Inform the EMR about the existence of divisional callsigns[list]
[*][b]AMU [/b]- Advanced Medical Unit
[*][b]BLS [/b]- Basic Life Support 
[*][b]PR [/b]- Public Relations
[*][b]RED [/b]- Recruitment and Employment
[*][b]ENG [/b]- Fire Engine
[*][b]FIRE[/b] - Fire unit
[*][b]EVAC [/b]- Air unit
[*][b]RSC [/b]- Kamacho unit
[*][b]LFG [/b]- Lifeguard
[*][b]FOR [/b]- Forensics
[/list][/list]
[*][color=#800000][b]Radio[/b][/color]
[list]
[*]Explain to the EMR that they always have to be on MD frequency while on duty.
[*]Inform them that we respect each other on the radio and if someone is speaking we don't [b]interrupt![/b] Teach them how to react when they hear someone speaking at the same time.
[/list]
[*][color=#800000][b]On Duty Equipment[/b][/color][list]
[*]Inform the EMR that they are given service equipment and that it is not to be used inappropriately. 
[*]Inform the EMR that any form of abuse of service equipment is punishable and could lead to dismissal from the department if serious enough.
[*]Inform the EMR that any personal weapon or tool is to be left at home or personal vehicle. 
[*]Inform the EMR that Kevlar is available after their Certification, and that they will have one available in their vehicles at all times. It is only to be worn in (potential) hostile or life-threatening situations, and can be requested by the most senior on shift.
[/list]
[*][color=#800000][b]Pillbox Hospital Tour[/b][/color]
[list]
[*][b]Vending machines(Ward D)[/b]: Take the EMR into Ward D and show them where to find the vending machine (first door on the right). 
Inform the EMR that anything acquired from this vending machine is for [b]LSEMS Staff[/b] only.
[*][b]Morgue[/b]: Inform the EMR that the Morgue is to remain [b]LOCKED[/b] at all times.
[*][b]Employee Parking[/b]:
[list][*]Show the EMR how to lock/unlock the gates. Explain that this is for on duty staff only. Off duty employee's with a vehicle here will be towed and secure impounded if the leadership team deems it necessary. 
[*]Explain to the EMR that the employee parking only keeps the vehicle safe. No valuables should be kept in the vehicle as the location is susceptible to lock pickers.
[i]If a vehicle has valuables stored, parking at Legion Parking would be recommended instead.[/i][/list][list]
[/list]
[*]Inform the EMR that all doors that are accessible by the public are to be kept [b]locked[/b] at all times.
[/list]
[*][color=#800000][b]Hospitals[/b][/color]
[list]
[*]Show the EMR where to drop off at Upper Pillbox, then Lower Pillbox
[*]Roam to Paleto MD, and explain how to perform a drop off at Paleto MD (through the right side where the entrance of the building is, driving around to the exit on the left)
[*]Take the EMR inside Paleto MD, showing them where they could clock on, as well as where the plastic surgeon is located.
[*]Inform the EMR that if they wish to clock on at Paleto MD, they should park their vehicle at Paleto Parking, as it is unsafe to park at Paleto MD.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b][ooc]TeamSpeak[/ooc][/b][/color]
[list][*][ooc]Ask them to join [b]TeamSpeak 3[/b], and make sure they have the correct IC name.[/ooc]
[*][ooc]Explain to them how to set up the unit tag before their name in TeamSpeak, for example [Z-11] John Doe[/ooc]
[*][ooc][b]Inform the EMR that they may not connect to the TeamSpeak server while on a criminal focused character. Doing so will lead to server punishments.[/b] [/ooc]
[*][ooc]Explain that if we use VOIP we say, Zulu, if we use text chat we type Z instead of Zulu.[/ooc]
[/list]
[*][color=#800000][b][ooc]OOC Corruption + Faction Commands[/ooc][/b][/color][list]
[*][ooc]Explain the OOC corruption ruling that LSEMS has in place to the EMR. Inform them we don't require IC evidence to terminate due to any illegal activities.[/ooc]
[*][ooc]Explain that faction-related commands are a privilege and not given out to mess around with. Explain that they cannot use the commands without first doing the applicable roleplay before using the command. If found to have done so it can lead to Faction repercussions and/or server punishments.[/ooc]
[*][ooc]Explain that much like faction commands, faction equipment and vehicles also follow the same consequences as commands.[/ooc]
[*][ooc]Explain that if they receive an admin punishment that they MUST tell High Command within 48 hours. Let them know that they need to send the link to the report and to inform High Command when it is concluded along with the result.[/ooc]
[*][ooc]Let them know that in the event that they cannot post an LOA for OOC reasons then they should reach out to someone from Command or High Command to let them know.[/ooc][/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Ending Introduction[/b][/color][list]
[*]Tell the EMR they can use the radio to attempt to reach a certified Field Training Officer for training and teach them how to do it.
[*]Example: "EMR Smith to dispatch, are there any available FTOs?" [ooc][b]**NO VOIP RADIO**[/b][/ooc]
[*]Inform them that they have a mandatory [b]30[/b] minute break between the introduction and phase I. [b]Explain to them they should go over their introduction email once more to fully grasp all the information they've been given.[/b]
[*]Encourage the EMR to fill out a duty report once a week. Although not required, it does help supervisors see your work.
[*]If you want you can take the EMR on a ride-along or ask someone else if they can take them if they want to see how it works.
[*][b]Before proceeding to do your paperwork, check if the EMR has received the Introduction email. If not, send the EMR the Introduction email:[/b]
[url=https://pastebin.com/raw/gq687baN]Introduction E-mail[/url]
[/list]
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[spoiler=Paperwork]
[code]
[img]https://i.ibb.co/0y2snnsR/9fb-JGt0.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]
[list]

[*][b]Time Started:[/b] 

[*][b]Time Ended:[/b] 

[*][b]If there were any issues, describe them below: [/b]
X

[*][b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[*][b]Checked if the EMR was sent the Introduction Email?  [cb][/b] [i](Please add a 'cbc' in the box if completed.)[/i]
[/list]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code]
[/spoiler]
[/spoiler]

[spoiler=Phase 1]
[divbox=white]
[lsemssubtitle]PHASE 1 - EMT-I+, 1 Hour Minimum/2 Hour Maximum[/lsemssubtitle]
[b][center]**THE EMR IS NOT TO DRIVE OR PROVIDE TREATMENT DURING PHASE I. BUT IS REQUIRED TO MANAGE THEIR UNIT**[/b][/center]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list=1]
[*][color=#800000][b]Radio Codes[/b][/color][list]
[*]Explain to the EMR all the different radio codes we have, and what each one of them means
[*]Have them open Section 14.7 of the General Handbook 
[*]You can find a list of codes here:
[spoil][b]Ten Codes:[/b]
[list]
[*][b]10-1[/b] - Roll Call
[*][b]10-3[/b] - Please Stop Transmitting
[*][b]10-4[/b] - Affirmative
[*][b]10-5[/b] - Repeat Last Transmission
[*][b]10-6[/b] - Disregard Last Transmission
[*][b]10-8[/b] - Available
[*][b]10-9[/b] - Unavailable
[*][b]10-15[/b] - Injured Suspect
[*][b]10-16[/b] - Injured Patient
[*][b]10-20[/b] - Location
[*][b]10-21[/b] - Report Status
[*][b]10-37[/b] - Unit Identify
[*][b]10-70[/b] - Backup Request
[*][b]10-99[/b] - Concluded Situation
[/list]
 
[b]Status Codes:[/b]
[list][*][b]Code 0[/b] - Fell asleep (( Game Crash ))
[*][b]Code 1[/b] - Urgent Assistance Required (ALL UNITS)
[*][b]Code 2[/b] - Non-Emergency
[*][b]Code 3[/b] - Emergency
[*][b]Code 4[/b] - No Further Assitance Required
[*][b]Code 6[/b] - On scene
[/list][/spoil]
[/list]
[*][color=#800000][b]Radio Calls[/b][/color][list]
[*]Explain to the EMR all the different radio calls we have, and what each one of them means
[*]Point them to Section 14.2 of the General Handbook
[*]You can find a list of standard radio calls here:
[spoil][list]
[*]Getting on shift and starting service under someone:
[list][*]EMR [b][I][Lastname][/i][/b] is starting services under [b][i][Callsign][/i][/b].
[/list]
[*]Getting on shift and forming your own unit:
[list][*]EMR [b][I][Lastname][/i][/b] is forming [b][i][Callsign][/i][/b] and is [color=#BF0000][b]10-8[/b][/color] from [color=#BF0000][b]Pillbox[/b][/color]/[color=#BF0000][b]Paleto[/b][/color].
[/list]
[*]Ending services while under someone:
[list][*]EMR [b][I][Lastname][/i][/b] is leaving [b][i][Callsign][/i][/b] and is [color=#BF0000][b]10-9[/b][/color] ending services.
[/list]
[*]Ending services and disbanding the unit:
[list][*]EMR [b][I][Lastname][/i][/b] is disbanding [b][i][Callsign][/i][/b] and is [b][color=#BF0000]10-9[/color][/b] ending services.
[/list]
[*]Radio callout when you arrive on a scene: 
[list][*][b][i][Callsign][/i][/b] is [b][color=#BF0000]Code 6[/color][/b] on last call. ([i]you can say the exact number, but it is not mandatory[/i])
[/list]
[*]Radio callout when you are leaving a scene:
[list][*][b][i][Callsign][/i][/b] is [color=#BF0000][b]Code 2[/b][/color]/[color=#BF0000][b]Code 3[/b][/color] to [color=#BF0000][b]Pillbox[/b][/color]/[color=#BF0000][b]Paleto [/b][/color]with [color=#BF0000]X[/color] [color=#BF0000][b]10-15[/b][/color]/[color=#BF0000][b]10-16[/b]('s) [/color]from [color=#BF0000]last call[/color].
[/list]
[*]Roaming:
[list][*][b][i][Callsign][/i][/b] is [b][color=#BF0000]10-8[/color][/b] roaming [b][color=#BF0000][Location][/color][/b] / [color=#BF0000][b][To Location][/b][/color].
[/list]
[*]Requesting backup:
[list][*][b][i][Callsign][/i][/b] to any [b][color=#BF0000]10-8[/color][/b] units, requesting a [color=#BF0000][b]10-70[/b][/color] on [color=#BF0000][b][Call ID][/b][/color] / [b][color=#BF0000][Location][/color][/b]
[/list]
[*]Sidewalk encounter or patient:
[list][*][b][i][Callsign][/i][/b] is [b][color=#BF0000]10-9[/color][/b] with a sidewalk patient at [color=#BF0000][b][Location][/b][/color].
[/list]
[*]Dropping response from a call:
[list][*][b][i][Callsign][/i][/b] is dropping response from[color=#BF0000][b] [Call ID][/b][/color] and is [b][color=#BF0000][Status][/color][/b].
[/list]
[/list][/spoil][/list]
[*][color=#800000][b]Calls List[/b][/color][list]
[*]Introduce the EMR to our dispatch system [ooc]/calls[/ooc], inform them that we can see the location, call number, description, and if the call is already taken. [ooc]/calls[/ooc]
[*]Explain how to respond to calls, how to close the call, how to check the location of the call, cross reference this with the next section (Panics & Backups)[size=90][ooc]/resp, /closecall, /setcall; make sure to tell them how to utilize /setcall -1 as well[/ooc][/size]
[i]You can use a back-up [ooc]/backup[/ooc] call to have the EMR practice how to respond, drop response, and close a call[/i]
[list]Explain call priority:
[*]Injured medics on duty
[*]PD and SD
[*]DOC and GOV
[*]Civilians calls from oldest to the newest
[*]Walk-in patients[/list]
[*]Inform the EMR that they can close a call if the call is older than one hour. ((Phone time))
[*]Explain to the EMR why calls don't close by themselves. If the caller was not injured the call will not close.
[*]Explain to the EMR regarding duplicate calls and why we close them.
[*]If your GPS hasn't updated and is showing the previous call you'll need to go ahead and clear your GPS. [ooc]/setcall -1[/ooc]
[*]The callers' phone number will show up in the call log. If there is any trouble, it may help to call the patient.
[/list]
[*][color=#800000][b]Panic Button and Backup Calls[/b][/color][list]
[*]Explain to the EMR the difference between the panic button and a backup call.
[*]Inform the EMR that if they want to do a backup call, they have to provide a brief summary of the situation. [ooc]/backup [text][/ooc]
[*]Tell the EMR that if they ask for backup they must stay put at the location as these are associated with their cruiser.
[*]Let the EMR know that unfortunately, panic button calls will not show in PD / SD dispatch [ooc]/calls[/ooc].
[*]Tell the EMR that if they need help from PD or SD, they should use the department radio and provide them with the backup/panic call number. [ooc][c]/dep[/c][/ooc].
[*]Ask the EMR if they would do a backup call or panic based on the following scenarios:
[list]
[*]They flip their ambulance
[*]Armed assailants are standing over their patient(s) and are issuing threats. (( Make sure to remind them of FearRP - they cannot hit a panic while under FearRP! ))
[*]They run out of fuel in their ambulance.
[*]They have a severe accident resulting in them getting injured. (Remind them to call 911 to provide information in [b]addition to the panic[/b] if they are unable to reach for their radio!)
[/list]
[/list]
[*][color=#800000][b]Department Radio[/b][/color][list]
[*]Explain how we use the department radio [ooc][c]/dep[/c] & [c]/deplow[/c][/ooc].
[*]Inform the EMR who is on department frequency. (MD, PD, SD, DOC, and GOV branches)
[*]Make sure the EMR knows that department radio has to be answered even if we are 10-9.
[*]Ensure the EMR understands that we always transmit the "MD to" when using department radio. 
[*]Inform the EMR that we have two different methods for communicating over department radio:
[list]
[*][i]Non-Urgent:[/i] "MD to PD/SD, how copy?", then transmit information on their response. Use a few examples for the EMR.
[*][i]Urgent:[/i] After hitting the panic or backup button, immediately use "MD to PD/SD, need units at [call], [brief reason]". You skip the "how copy" for urgency's sake. Provide examples.
[/list]
[*]Inform the EMR that once they are certified, a supervisor(or the highest rank on shift) would usually respond to departmental radio.
[/list]
[*][color=#800000][b]PD/SD Calls[/b][/color][list]
[*]Inform the EMRs that they need to report when they are en-route over our normal radio, department radio and explain why.
[*]Tell the EMR that the first thing to do as they approach the scene is to ask who is injured, who is a 10-15 or 10-16, and if any treatment has been given to the patients before our arrival. (Most PD and SD employees have BLS training)
[list]
[*]If there are no 10-15s, we behave as if it was a normal call.
[*]If there is an injured 10-15, we treat the patient and then we ask PD/SD if we can take the patient to the ambulance and which hospital.[/list]
[*]Explain why:
[list]
[*]Never take 10-15 to the ambulance without PD/SD permission
[*]Never leave a scene without permission from PD/SD
[*]Always ask which hospital PD/SD wants to go
[*]Never drop the patient without asking PD/SD for permission[/list]
[*]Make sure the EMR knows that it's better to ask twice than get IA reported for stealing a 10-15.
[*]Explain why sometimes PD/SD calls can be difficult. (Dealing with SD/PD, finding if the patient is a 10-15 or 10-16, checking which hospital you'll be heading to, and so forth.)[/list]
[*][color=#800000][b]DOC Calls[/b][/color][list]
[*]DOC inmates should not be taken out of prison for treatment.
[*]If DOC calls you in to treat an inmate, bring them to the prison's medical ward and only then treat them. (( Explain that you should then proceed to do regular medical RP alongside a '/stabilize'.[b]There is a '/dropbody' point in the medbay, only drop the inmate thereafter both the medical roleplay and '/stabilize' have been completed. [/b])) 
[*]A Correctional Officer, or any form of Law Enforcement is [b]required[/b] to be with the medic inside the prison grounds at all times. This is for our safety.
[/list]
[*][color=#800000][b]Specialized Calls[/b][/color][list]
[*] There will be times when the assistance of a specialized division is required. Generally speaking, we're thinking of AMU, A&R, and F&R here.
[*] AMU is a division that focuses on advanced medical treatments within hospitals.
[*] A&R (Air & Rescue) is a division that focuses on rescuing from tough-to-reach spots and locations, utilizing helicopters and offroad vehicles.
[*] F&R (Fire & Rescue) is a division that focuses on firefighting and rescuing people from vehicles or objects.
[*] If a situation where the assistance of a specialized unit is required pops up, but none are available, an EMR must know the minimum of what to do.
[*][ooc][b] Inform the EMR that if they feel they need to page for AMU or otherwise, the patient has to be asked if they [i]actually want to do that roleplay[/i] via [c]/b[/c]. Both of these involve more in-depth character specific RP, and as such, the patient needs to have the time and willingness to do this RP! [/b][/ooc]
[*] Steps to take if you encounter someone stuck in a tough-to-reach spot and no A&R trained unit is available:
[list] [*] Get close to the caller with your vehicle, engage the parking brake, and continue on foot.
[*] Make sure you are aware of your surroundings as you attempt to climb up or down to the patient.
[*] Treat them, then carefully get them over to your ambulance.
[/list]
[*][color=#800000][b]Fire Calls[/b][/color][list]
[*]Show the EMR where to retrieve a fire extinguisher. 
[ooc]RP first, then [c]/fl[/c]. It will be [b]INVISIBLE[/b] in the top left slot in the weapon wheel![/ooc]
[*]Then explain the process of extinguishing a fire to the EMR. 
[ooc][c]E[/c] on the floating UI, and [c]/extinguish[/c][/ooc]
[*]Inform the EMR that there can be lingering flames, and that it's best to check the surroundings thoroughly.
[ooc]Additionally, explain that some fires are glitched and are only visible in the UI when physically close to the fire.[/ooc]
[*][ooc]Any unattended fires can be handled by roadworkers after 5 minutes, however this does not mean that fires should be left unattended.[/ooc]
[*]Inform the EMR that these calls do not close themselves, and that it has to be done manually [ooc][c]/closecall ID[/c][/ooc]
[*]Finally, have them return the fire extinguisher.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Ending the Phase - Ride-Along[/b][/color][list]
[*][b]Request Call Priority over radio. Either you, or the EMR may do this request.[/b]
[*]Let the EMR take care of unit management, responding to calls, and closing calls.
[*]Ask the EMR if they want to try doing radio codes [ooc]You'll write them in chat and have them repeat them over the radio[/ooc]
[*]If the EMR doesn't want to do the radio try to encourage them.
[*]Explain to the EMR everything that you do and why.
[*]Make sure to say that you are happy with your EMR's work.
[*]Assign them 1x mandatory ride along, alongside additional mandatories if they require it.
[*][i][b][u]If the EMR performed poorly, be honest and genuine on your report[/u][/b][/i] - not stating they didn't do well is only harming the EMR.
[/list]
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[spoiler=Paperwork]
[code]
[img]https://i.ibb.co/bRbp2f8y/15q-Kt-Ob.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Did the EMR participate in a 10-15 call?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor:[/i][list=none]
INPUT RATING AND FEEDBACK HERE

[/list]
[color=transparent]spacer[/color]
[b]Detailed Notes About Time Spent (Optional but strongly encouraged):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]NOTES FOR NEXT TRAINING SESSION[/lsemssubtitle]
[divbox=white]
[b]Additional Mandatories given:[/b]
[color=transparent]spacer[/color]
[b]Subjects to focus on during next training session: [/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code]
[/spoiler]
[/spoiler]

[spoiler=Phase 2]
[divbox=white]
[lsemssubtitle]PHASE 2 - EMT-I+, 1 Hour 15 Min Minimum/2 Hour 30 Min Maximum[/lsemssubtitle]
[b][center]**THE EMR SHOULD BEGIN TREATMENT OF PATIENTS NEAR THE END OF PHASE 2 AND MANAGING THEIR UNIT**[/b][/center]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list=1][*][color=#800000][b]Volatile Patient List[/b][/color]
[list]
[*]Inform the EMR of the [url=https://gov.eclipse-rp.net/viewtopic.php?p=769876]Volatile Patient List[/url]
[*]Let them know that they should check this list OFTEN as it can be updated frequently.
[*]Emphasize that PD/SD response, OR a 10-70 from MD, is REQUIRED.
[*][u]Emphasize that individuals on this list are to be handled with extreme caution.[/u]
[*]Tell the EMR that they can reach out to anyone from the leadership team if they believe a name should be added.
[*]Elaborate on the previous point, explicitly stating that the list is reserved for those who may pose a direct threat to LSEMS as a whole.
[/list]
[*][color=#800000][b]Hostile Situations[/b][/color][list]
[*]Inform the EMR that our safety comes first on every scene.
[*]If a situation is clearly unfavorable (such as being outnumbered by clearly hostile individuals), avoid calling for law enforcement in front of them. This will give them a reason to attack us, which we would want to avoid at all costs.
[*]Let the EMR know that they need to remember that sometimes patients get upset and they need to be mindful of what they say for their own and all other medics safety.
[*]If possible, return to your vehicle and move about a block away (or 50m+) from the hostile situation.
[*]Once you are a safe distance from the hostile scene, this is when it would be ideal to request for law enforcement over department radio. 
[*](( Also mention using [c]/deplow[/c] instead of [c]/dep[/c] ))
[/list]
[*][color=#800000][b]GSB[/b][/color]
[list]
[*]Let the EMR know that sometimes GSB will reach out and ask if we require any assistance. Let them know that usually whoever is shift lead will decide whether they're needed or not. If that is them, then they have the option to tell them they're unneeded at the moment.
[*]Let them know that GSB is here for our protection and they are NOT to interfere with any patients unless they're a direct threat to the medic's life. Even then PD/SD is to be called immediately.
[/list]
[*][color=#800000][b]Treatment[/b][/color]
[i]Optional: You may use the BLS Classroom for this, provided there is no active BLS Class.[/i]
[list]Ask the EMR how they'd treat the following injuries:
[list]Closed fracture on a patient's leg.
[*]Gunshot wound located on the patient's chest.
[*]1st, 2nd, or 3rd-degree burns.
[*]Stab wounds
[*]Concussion[/list]
[*][b][color=blue](([/b][/color] Explain the process of how to use the stabilize command and explain it is considered powergaming if you stabilize before doing your roleplay to find the injuries on the patient. 
[b]Example[/b]
[c]/stabilize[/c]
[list]
[*]Ongoing /me's and /do's - inspecting and discovering wounds via RP'd response 
[*]Followed by /stabilize - upon knowing what treatment you are going to do or provide
[/list]
[c]/heal[/c]
[list]
[*]Not allowed to use the command without prior RP.
[*]Ongoing /me's and /do's - inspecting and discovering wounds via RP'd response
[*]We use /heal as a reward for good RP. Do not use it if people are asking for a "bandaid" or "icepack" without them actually wanting to do proper RP.
[/list]
[c]/CPR[/c]
[list]
[*]Provided after completing a BLS class or passing their certification
[*]Used off duty or by on-duty SD/PD, as well as other people who have a license.
[*](Ongoing /me's and /do's - inspecting and discovering wounds via RP'd response
[*]Misuse of this command will result in the removal of the medical license[b][color=blue]))[/color][/b]
[/list][/list]
[color=#800000][b]Methadone[/b][/color][list]
[*]Instruct the EMR to open the following section in the Department Manual: [url=https://gov.eclipse-rp.net/viewtopic.php?t=106075#9]7.9 - Methadone[/url]
[*]Make sure to teach them how to properly do the [b]entire procedure[/b], especially the importance of utilizing the Prescription Section to note a prescription down. 
[*]While looking through the Prescription Section, make sure to remind them that if a someone has been prescribed Methadone in the last 7 days then you cannot prescribe them any, and if they've been prescribed 3 times in a single month than you have to be an EMT-I+ to prescribe any further.
[b]This is of extreme importance, as improperly prescribing Methadone can and will lead to disciplinary action if done incorrectly.[/b]
[*]Inform the EMR that before selling methadone they [b]HAVE[/b] to conduct a drug test.
[*]Inform the EMR that anyone requesting methadone can only pay for it in cash, at the price of $500.
[*]Emphasize the importance of educating the patient about the dangers of an overdose of methadone and inform them that AMU or otherwise are there for further assistance if they seem to be abusing methadone.
[*]Make sure they remember that if they're unsure on anything that they can contact a Supervisor, Command+ or other personnel.
[*]Go over the Denied Prescription Format with them in detail.
[*][ooc]Inform the EMR roleplay must be completed before using the command, without any roleplay, you'll be breaking powergaming by forcing roleplay without allowing the other player a chance and abusing faction commands.[/ooc]
[/list]
[*][color=#800000][b]Breathalyser[/b][/color][list]
[*]Explain to the EMR the process of conducting a breathalyzer on a patient and give them an example of how to do it. [ooc]/breathanalyse[/ooc]
[*]Inform the EMR that before conducting a breathalyzer they must have the consent of the patient.
[*][ooc]Inform the EMR roleplay must be completed before using the command, without any roleplay, you'll be breaking powergaming by forcing roleplay without allowing the other player a chance and abusing faction commands.[/ooc]
[/list]
[*][color=#800000][b]Time Management[/b][/color][list]
Explain time management to the EMR which means choosing the closest hospital, treating non-critically injured people, and driving Code 3 even when not required if one or more calls are open with nobody to take them.
[list][ooc]Explain to the EMR when you go more in-depth on treatment in the field.[/ooc]
[*][ooc]Few units, many calls; quick treatment.[/ooc]
[*][ooc]Many units, few calls; slow and in-depth treatment.[/ooc]
[/list]
[*]Explain to the EMR that if we are code 3 to call and we approach injured people on the sidewalk, we have to stop.
[*]Inform the EMR that we must drop response to our previous call [ooc]/setcall -1[/ooc], radio call that we are dropping response from our current call, and ask another unit to take the call.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Ending the Phase - Ride-Along[/b][/color][list]
[*][b]Request Call Priority over radio. Either you, or the EMR may do this request.[/b]
[*]If the EMR can do radio calls, unit management, and treatment by themselves, then don't give them any extra additional mandatory ridealongs.
[*]If you will be 10-8 during your ride-along, take the EMR on a short roam and ask the EMR to do the radio and treatment. 
[*]If the EMR doesn't wish to take any feedback regarding their performance or is struggling on the ridealong, you may assign three to four mandatory ridealongs.
[*]Assign them 1x mandatory ride along, alongside additional mandatories if they require it.
[*][i][b][u]If the EMR performed poorly, be honest and genuine on your report[/u][/b][/i] - not stating they didn't do well is only harming the EMR.
[/list]
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[spoiler=Paperwork]
[code]
[img]https://i.ibb.co/qMNGR7x5/WNwx-LGs.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Did the EMR participate in a 10-15 call?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor:[/i][list=none]
INPUT RATING AND FEEDBACK HERE

[/list]
[color=transparent]spacer[/color]
[b]Detailed Notes About Time Spent (Optional but strongly encouraged):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]NOTES FOR NEXT TRAINING SESSION[/lsemssubtitle]
[divbox=white]
[b]Additional Mandatories given:[/b]
[color=transparent]spacer[/color]
[b]Subjects to focus on during next training session: [/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code]
[/spoiler]
[/spoiler]


[spoiler=Phase 3]
[divbox=white]
[lsemssubtitle]PHASE 3 - EMT-I+, 1 Hour Minimum/2 Hour Maximum[/lsemssubtitle]
[center][b]**THE EMR SHOULD DRIVE, PROVIDE TREATMENT, AND HANDLE UNIT/CALL MANAGEMENT AT THE END OF THE PHASE**[/b][/center]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list=1][*][color=#800000][b]Garage and Ambulance[/b][/color][list]
[*]Show the EMR again how we get a vehicle from Betsy (( Via the vehicle menu, point them to Handbook Section 10.1 ))
[*]There are 25 ambulances for EMRs to use in total. 10 EMT/orange ambulances, 5 Blue ambulances, and 10 large ambulances.
[*]Inform the EMR that all vehicles are fleet vehicles and we must take care of them for those who use it after you. Before you park, repair and refuel the vehicle. Maintenance of vehicles come from LSEMS treasury.
[*]Inform the EMR to always keep their ambulance locked. Double-checking is better than not checking.
[*]Explain to the EMR what the difference between Code 2 and Code 3 is and how to use the lights and sirens.
[ooc][c]E[/c] = lights & [c]Q[/c] = sirens[/ooc]
[*][ooc]Explain to EMRs that only under direct permission from a Command+ member are they allowed to change the colour of their vehicles. If found to have changed the colour of their vehicle without permission this will result in IC reprecussions.[ooc]
[*]Explain to the EMR what Code 4 means in the context of driving (lights and sirens off, driving normally).
[*]Explain to the EMR that they can get a quick blip to [i][b]Lower Pillbox[/b][/i] from their GPS (( /hospital )).
[*]Explain that the GPS system, while functional, may not give the best routing to calls.
[list=none]
[i]Example - Call from Burgershot while stationed at the ambulance bay:[/i]
[spoil][img]https://i.ibb.co/Fkw0kJwt/i5et-N3F.png[/img]
[/spoil]
The GPS routing provided, while functional, is inefficient. Going straight to Legion Square and turning from there instead, is going to be more efficient.
[/list][/list]
[list]
[*]Explain to the EMR how roaming works
[*]If you will be 10-8 during your ride-along, take the EMR on a short roam and ask the EMR to do the radio. 
[*]Explain to the EMR that as they roam they should be in motion, and as they roam they have to be 10-8 and take calls.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Driving Capabilities[/b][/color][list]
Explain to the EMR that this section will consist of 3 different driving tests. 
[list=none]First is a [i]dirt [/i]trail;
Second is a combination of [i]dirt [/i]and [i]asphalt[/i];
The third is on [i]asphalt[/i].
[/list]
[*]Instruct the EMR to drive to The Observatory, specifically get the EMR to use [c]1 East Galileo Ave[/c] on their GPS. [ooc][c]/setgps 1 east galileo ave[/c][/ooc]
[spoiler=Map Location of The Observatory]
[img]https://i.ibb.co/pvQ3YH9y/8Hw38YV.png[/img]
[/spoiler]
[*]Take over, then show the EMR how to drive along the first course, course [b](1)[/b] in the image below. After showing them, have them do a few laps to get a grasp of how the ambulance handles dirt. [i]Encourage them to stay in control of the vehicle.[/i]
[spoiler=Observatory Courses][img]https://i.ibb.co/xSsVtxh6/lcxz-HCq.jpg[/img][/spoiler]
[*]Explain the next course [b](2)[/b] to the EMR, A quick way to explain it is simply "keep turning left". Again, [b]take over[/b], [b]do one lap[/b], then have the EMR do it!
[*]Their first lap will be [b]Code 4[/b] (regular driving). Instruct them to stop at the start, then repeat the lap [b]Code 3[/b].
[*]Then have the EMR do the course two more times, in reverse (as in, turn the ambulance around, don't have them literally driving in reverse). The "keep turning left" now becomes "keep turning right".
[list=none]First reverse lap [b]Code 4[/b]
Second reverse lap [b]Code 3[/b]
[/list]
[*]Finally, have the EMR drive to the Sandy Firestation ([c]27 Panorama Dr[/c]), [b]Code 3[/b].
[spoiler=Map Location of Sandy Firestation][img]https://i.ibb.co/ksfhDpcv/Rm51q-YX.png[/img][/spoiler]
[*]If they need more practice, have them redo any of the courses at the end of the session.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Hospitals and Fire Stations of Los Santos[/b][/color]
[list]
[*]Inform them that they are now at Sandy Fire station and that they can ask Betsy for vehicles here and then direct them to Fire Station 7 and show them where to ask Betsy for vehicles here as well.
[*]Take them to Central and then finally to Mount Zonah and show them how to call Betsy so she can retrieve a vehicle for them.
[*][ooc]Pictures will go in here. I just have to get them from above and mark where the points are on the map with blips.[/ooc]
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][b][color=#800000]Scene Mangement[/color][/b][list]
[*]Instruct the EMR to head to a secluded area. You should use one of the three locations listed below.
[list=1]
[*]Abandoned Cul-de-sac in Mirror Park, opposite house at [c]7 East Mirror Dr[/c] ((/setgps))
[*]Terminal/Harbor ((Credit Store))
[*]Dead-end road close to Clothing Store 4/17
[spoiler=Location of road close to Clothing Store 4/17]
[img]https://i.ibb.co/9HNv0Ncx/UBq8b-RR.png[/img]
[/list][/spoiler]
[*]Inform the EMR of the blockades we have and make sure to explain the correct use for each. 
[ooc][c]arrow, barrier, barrier2, cone, stretcher, backboard, tent, bls[/c][/ooc]
[*]Explain to the EMR that your ambulance is one of your biggest blockades and how to block incoming traffic using it.
[*]Show them how to do some basic scene management and then take it down.
[*]Explain to the EMR the steps of arriving on scene.
[i][b]Steps to follow:[/b][/i]
[list=1][*]Siren OFF [ooc][c]Q[/c][/ooc]
[*]Engine OFF
[*]Emergency Lights ON [ooc][c]E[/c][/ooc]
[*]Step out of ambulance, then [b]ALWAYS[/b] double check if ambulance is locked.
[/list]
[*]Show the EMR how to position the ambulance when arriving on scene, then allow them to attempt it.
[*]Have the EMR show you how they should arrive on scene and perform scene management all at once.
[i]It is not expected for the EMR to get it perfect, however they should at least know how to do it.[/i]
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]JTAC[/b][/color][list]
[*]Explain to the EMR what Jointed Tac (JTAC) is.
[*]Inform the EMR on how it's used.
[*]Explain that the highest rank on shift would be the unit to join JTAC if asked.
[*]Make sure they understand respect and professionalism is [b]utterly[/b] important here.
[ooc]Make sure you explain and they understand [b]JTAC is IC and they have to use IC VOIP[/b] as well when talking on it.
Additionally, explain that using the TS VOIP without using in-game VOIP at the same time can lead to a server punishment[/ooc]
[*][ooc]Inform the EMR that they can bind [c]P[/c] to Push To Talk in Teamspeak. Provided that you are [b]tabbed in[/b] to RageMP, pressing [c]P[/c] will use the "talk on phone" key as JTAC.[/ooc]
[*][ooc]If the EMR does not use VOIP or do not wish to use VOIP, they [b]are not expected to[/b]; however having someone who can use VOIP who is on duty join JTAC with them would be ideal. 
Non-VOIP individuals may use "/dep MD to JTAC-1 [msg]" or "/dep MD to SD/PD [unit]" to communicate with JTAC.[/ooc]
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Ending the Phase - Ride-Along[/b][/color][list]
[*][b]Request Call Priority over radio. Either you, or the EMR may do this request.[/b]
[*]Make sure the EMR can do everything alone, let the EMR take over treatment, radio calls, and driving.
[*]If the EMR seems overwhelmed, allow them to focus on their driving for rest of the session.
[*]Ask the EMR if they have any concerns.
[*]Question the EMR about radio calls and treatment.
[*]Assign them mandatories if they seem like they're having a rough time and remind them that they have the option to do optional ride-alongs.
[*][i][b][u]If the EMR performed poorly, be honest and genuine on your report[/u][/b][/i] - not stating they didn't do well is only harming the EMR as this is their last chance before their Pre-Certitification.
[*]Finally, encourage the EMR to roam during down time in their upcoming ride-alongs.
[/list]
[/list]
[spoiler=Paperwork]
[code]
[img]https://i.imgur.com/JjD9Y74.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Did the EMR participate in a 10-15 call?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor:[/i][list=none]
INPUT RATING AND FEEDBACK HERE

[/list]
[color=transparent]spacer[/color]
[b]Detailed Notes About Time Spent (Optional but strongly encouraged):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]NOTES FOR NEXT TRAINING SESSION[/lsemssubtitle]
[divbox=white]
[b]Additional Mandatories given:[/b]
[color=transparent]spacer[/color]
[b]Subjects to focus on during next training session: [/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code]
[/spoiler]
[/divbox]
[/spoiler]


[spoiler=Pre-Certification]
[divbox=white]
[lsemssubtitle]PRE-CERTIFICATION - EMT-A+, 1 Hour 30 Min Minimum/3 Hour Maximum[/lsemssubtitle]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list=1][*][color=#800000][b]Beginning[/b][/color][list]
[*]Make sure the EMR has handled and transported a 10-15 during their training, and did it correctly. If this is not the case,[b] the EMR cannot pass the Pre-Cert until they treat, handle and transport a 10-15.[/b]
[*]Ask if the EMR has any questions about any of the previous parts of training.
[*]Inform the EMR that during this session, they are on their own unless a crisis occurs or they make a major mistake.
[*]Make sure the EMR creates its own unit and properly does the entire starting shift process without error.
[*]Let the EMR drive an ambulance out of the garage, and inform them that they may station wherever, as well as roam around.[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]During the Pre-Cert[/b][/color][list]
[*][b]Request Call and Department Priority over radio. Either you, or the EMR may do this request.[/b]
[*]Observe the EMR, but do not cause total silence, you can and should communicate with them to relax them.
[*]Write feedback on how what the EMR did incorrectly if anything does go wrong.
[*]If the EMR is still having some troubles, make some notes and give them feedback at the end.
[*]Ensure we watch the driving closely and fail if they are a danger when driving the ambulance. If you see them not following proper emergency vehicle protocol while driving, make note of this.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Ending[/b][/color][list]
[*][b][color=#BF0000]If the EMR has made a mistake large enough, this is a direct Fail, and they are to do mandatory ride-alongs equal to whatever you decide before re-attempting the pre-certification.[/color][/b]
[*]Inform the EMR that they are now able to clock on as EMR-1, EMR-2, and so forth as long as an EMT+I is on duty. If the last EMT+I gets off duty, tell them they should head off as well until someone else clocks on.
[*]Encourage the EMR to do their Certification as soon as possible (within or at around 24 hours after passing Pre-Cert, not required!) while they're able to retain their confidence.
[*]Inform the EMR that they can also be on shift while they are paired up with an EMT-B, under a Zulu callsign.
[*]Hand them an On-Call Program Pager & explain the program. The EMR is not obliged to join, so do inform them of this as well.
[*]Encourage the EMR to reach out to a Jr. Paramedic+ to schedule their Certification.
[*]Complete the paperwork and make sure to edit the top post with "[Pending Certification] {{applicantName}}"
[*][i][b][u]If the EMR performed poorly, be honest and genuine on your report[/u][/b][/i] - not stating they didn't do well is only harming the EMR.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Helpful Questions[/b][/color]
[spoiler=Helpful Questions]
[list]Did the EMR create a unit? 
Did the EMR start service correctly?
Did the EMR park their ambulance correctly in the ambulance bay? 
Did the EMR check if there are any calls to take from the call list? 
Did the EMR respond to calls without you asking to do it?
Did the EMR follow call priority? 
Did the EMR manage to use radio calls properly? 
Did the EMR respond to department radio if there were any department calls? 
Did the EMR handle department radio properly and timely?
Did the EMR handle PD/SD calls properly?
Did the EMR use our MD frequency to radio that they responding to PD/SD calls?
Did the EMR ask if the patient is a 10-15 or 10-16? 
Did the EMR ask if any treatment has been done before? 
Did the EMR ask if they clear to load the patient to an ambulance if the patient was 10-15? 
Did the EMR ask PD/SD where they want to go? 
Did the EMR properly radio transporting a 10-15
Did the EMR ask PD/SD if they clear to drop patients at MD?
Did the EMR keep their ambulance locked at all times?
Did the EMR properly utilize code 2, 3 and 4?
Did the EMR drive properly?
Did the EMR know how to utilize all necessary radio calls and codes throughout?
Did the EMR treat properly and timely?
Did the EMR roam properly and safely?
[/spoiler][/list][/list]
[b]Note:[/b] The EMR should [u]only[/u] be [url=https://pastebin.com/raw/wCL1v4K7]sent[/url] the quiz if they [b][color=red]fail[/color][/b] their Pre-Certification.

[spoiler=Paperwork]
[code]
[img]https://i.imgur.com/p33kyzm.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Did the EMR participate in a 10-15 call?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor:[/i][list=none]
INPUT RATING AND FEEDBACK HERE

[/list]
[color=transparent]spacer[/color]
[b]Detailed Notes About Time Spent (Optional but strongly encouraged):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]NOTES FOR CERTIFICATION[/lsemssubtitle]
[divbox=white]
[color=transparent]spacer[/color]
[b]What should be observed during next session:[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[b]Has the EMR passed the Pre-Certification and is the EMR ready to work alone?[/b][list=none]
YES/NO

[b]If the EMR failed the Pre-Certification, was the EMR sent the quiz?[/b] (Ignore if not relevant)
YES/NO
[/list]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code]
[/spoiler]
[/spoiler]

[spoiler=Certification]
[divbox=white]
[lsemssubtitle]CERTIFICATION - Junior Paramedic+, 1 Hour 30 Min Minimum/3 Hour Maximum[/lsemssubtitle]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list=1][*][color=#800000][b]Beginning[/b][/color][list]
[*][b]Read their student profile. Ensure that you are eligible to do a Certification for the EMR if they failed one before.[/b]
[*][b]Ensure that they did all of the assigned mandatory ride-alongs (a minimum of 2 + however many assigned) if they failed their previous certification attempt.[/b]
[*][b]Ensure they've passed their Pre-Certification.[/b]
[*]Ask if the EMR has any questions before starting.
[*]Inform the EMR that during this phase they are on their own unless a crisis occurs or they make a major error.
[*]Make sure the EMR creates its own unit and follows all shift-starting protocols.
[*]Proceed to observe the EMR [/list]
[*][b]Request Call Priority over radio. Either you, or the EMR may do this request.[/b]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]During the Certification[/b][/color][list]
[*]Observe the EMR.
[*]Pay attention to their treatments, scene management, communication, and radio calls.
[*]If there are no PD calls, question the EMR about PD/SD calls and set up a small scenario. Make sure EMR understands them, especially if they did not have too much experience throughout the training.
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Ending the Certification[/b][/color][list]
[*]Give the EMR the certification result and feedback on their work.
[*]Bofore handing the EMR their new badge, have them swear the [b]Hippocratic Oath[/b] (found below)
[*]Begin going down the following checklist:
[list=1][*]Let the EMR, now EMT-B, pick their callsign. Tell them they can check which one is available on the [url=https://gov.eclipse-rp.net/viewtopic.php?p=126127#p126127]LSEMS Staff Roster[/url]. [i][color=red]Reminder that callsigns go from ECHO-11 to ECHO-99, and that ECHO-69 may not be assigned.[/color][/i]
[*]Give them their medical license. (( /givemedical ))
[*]Tell the EMR about Duty Reports, and mention that they are not mandatory but are encouraged to be filled out at least once a pay period.
[*]Inform the EMR that the leadership team may take them aside for an [b]informal[/b] 1 on 1 session around every 3 months. These are just a casual conversation to allow them the opportunity to communicate with the Leadership Team.
[*]Inform the EMR that since they are now an EMT-B they can join divisions.
[*]Ask them if they have a pager. If not, ask them if they want one. Explain what a pager is and make sure they know how to properly use it! (( Make sure they understand they have to RP pressing it with a simple /me, and check the discord if they have the 'On Call Program' role either way. ))
[*] (( F4 rank adjustment, Discord, Teamspeak - reference [url=https://gov.eclipse-rp.net/viewtopic.php?t=74487]Section 5 of the Supervisor Handbook[/url] for detailed guidance for TeamSpeak while the person is offline. ))
[*]Post the certification paperwork in the EMR Student Profile, and fill it out.
[*]Archive the EMR Student Profile.
[*] Update the [url=https://gov.eclipse-rp.net/viewtopic.php?t=9497]Staff Roster[/url] - You only need to adjust the Staff Roster (second post), copy the EMR entry into the appropriate numerical slot in the EMT section, edit the rank from "EMR" to "EMT-B"
[*]Post the EMT-B promotion format into their personnel file - Post format can be [url=https://gov.eclipse-rp.net/viewtopic.php?t=216104#PROMOTIONS]found here.[/url] (Section 9.14)
[*]Edit the personnel file top post - Title, rank, callsign, and edit the Promotions section, linking to the promotion post.
[*]Move the personnel file to EMT Personnel Files
[*]Create the EMR a divisional file
[*]Update the Dashboard, ensuring the EMR is promoted to EMT-B
[*]Send them the Promotion Email for EMT-B found ( [url=https://gov.eclipse-rp.net/viewtopic.php?t=216104#PROMOTIONS]here [/url]) ((copy the appropriate link to your address bar and you’ll get the proper email format to send from there))
[*]Remove them from the EMR usergroup, and add them to the EMT usergroup, making it their primary group (unless they are employed elsewhere and prefer that one)
[*]Employee Adjustment post - [url=https://gov.eclipse-rp.net/viewtopic.php?p=445130#RANK-ADJUSTMENT]Format here[/url] (Section 9.12), and [url=https://gov.eclipse-rp.net/viewforum.php?f=573]here[/url] is the location to post it.
Make sure to fill out the format properly;
The title should read  ->  Rank Adjustment | {{applicantName}}
[*] (( Request an acp rank change in discord ))[/list]
[/list]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Processing a Passed Certification[/b][/color][list]
[*][b][u]Follow the certification checklist[/u], found in [url=https://gov.eclipse-rp.net/viewtopic.php?t=74485]Supervisor Handbook Section 4[/url].[/b] 

[*]Send the EMT-B email ([url=https://pastebin.com/raw/prBNU1wB][b]found here[/b][/url]) to the fresh EMT-B. 
[*]Edit the top post with the certification date.
[*]Post the 'passed' format (found below).
[*]Archive the student profile.
[*]Post your FT Session Report.
[/list]

[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[*][color=#800000][b]Processing a Failed Certification[/b][/color][list]
[*]Minimum of [b]2 Mandatory Ride-alongs[/b] must be assigned, in addition to:[list]
[*]Additional ride-alongs if you deemed necessary 
[/list]
[*]Update the EMR Profile title with the assigned ride-alongs
[*]Post your FT Session Report
[*]Reach out to the Head of Field Training about the failed certification, email preferably.
[ooc]Tagging [i]@Head of Field Training[/i] in [b]discord #notifications[/b], linking to the paperwork (once completed), is also acceptable! [/ooc]
[/list]

[/list]
[color=transparent]spacer[/color]

[hr][/hr]

[color=transparent]spacer[/color]
[spoiler=Hippocratic Oath][center][img]https://i.imgur.com/GReHLvT.png[/img]
[i][b][size=115]I, {{applicantName}}, swear to fulfill, to the best of my ability and judgment, this covenant:[/size][/b][/center]

[size=105]
I will respect the hard-won scientific gains of those who walked the steps I walk now, and gladly share such knowledge as is mine with those who are to follow.

I will apply, for the benefit of the sick, all measures which are required to better their condition.

I will remember that there is an art to medicine as well as science, and that warmth, sympathy, and understanding may outweigh the surgeon's knife or the chemist's drug.

I will never be ashamed to say "I know not," nor will I fail to call in my colleagues when the skills of another are needed for a patient's recovery.

I will respect the privacy of my patients, for their problems are not disclosed to me that the world may know.

I will remember that I do not treat a chart or simulation, but a sick or injured human being, whose illness may affect the person's family and economic stability. 

I will prevent disease whenever I can, for prevention is preferable to cure.

I will remember that I remain a member of society, with special obligations to all my fellow human beings, those sound of mind and body as well as the infirm.

If I do not violate this oath, may I enjoy life, respected while I live and remembered with affection thereafter.

If I do not violate this oath, may I long experience the joy of healing those who seek my help.[/size][/i]

[center][img]https://i.imgur.com/7aQSsNs.png[/img][/center]
[/spoiler]

[spoiler=Certification Passed Paperwork]
[code]
[img]https://i.imgur.com/huDCbJP.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Did the EMR participate in a 10-15 call?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor:[/i][list=none]
INPUT RATING AND FEEDBACK HERE

[/list]
[b]Certification Notes:[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[b][lsemssubtitle]PASSED CERTIFICATION NOTES:[/lsemssubtitle][/b]
[divbox=white]
[b] Call sign given: [/b] ECHO-X

[b] Medical license given? [/b] YES/NO

[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code]
[/spoiler]

[spoiler=Certification Failed Paperwork]
[code]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Did the EMR participate in a 10-15 call?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor:[/i][list=none]
INPUT RATING AND FEEDBACK HERE

[/list]
[b]Certification Notes:[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]

[b][lsemssubtitle]CERTIFICATION FAILED NOTES:[/lsemssubtitle][/b]
[divbox=white]
[b]Reason for failure:[/b][list=none]
INPUT DETAILED FEEDBACK HERE

[/list]
[b]Mandatory Ride-Alongs Assigned (DEFAULT 2 + FREE TO ADD MORE): [/b] 

[b]Subjects to focus on during next training session: [/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code][/spoiler]


[spoiler=Personnel File Post][code][center][img]https://i.imgur.com/GReHLvT.pngp[/img][/center]
[divbox=white]
[color=transparent]spacer[/color]
[center][img]https://i.imgur.com/GkqftMR.png[/img][/center]

[color=transparent]spacer[/color]
[center][b][size=150]{{applicantName}} has been promoted to EMT-Basic![/size][/b][/center]
[color=transparent]spacer[/color]
[center][b][u][size=110]DD/MMM/2023[/size][/u][/b][/center]
[center][b][size=110]Promoted by: Fullrank {{supervisorName}}[/size][/b][/center]
[color=transparent]spacer[/color]
[/divbox]
[center][img]https://i.imgur.com/7aQSsNs.png[/img][/center][/code][/spoiler]
[/spoiler]


[spoiler=Ride Along Paperwork]
[code]
[img]https://i.imgur.com/fV26BWG.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Ride-along Type:[/b] MANDATORY / OPTIONAL

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Were there any department calls?[/b] YES/NO

[b]Did the EMR transport or participate in a call with a 10-15?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor[/i][list=none]
INPUT RATING AND FEEDBACK HERE

[/list]
[b]Ride-along Notes (as detailed as possible):[/b][list=none]
INPUT HERE
[/list]

[b]Additional Mandatories assigned (if any): [/b]
[color=transparent]spacer[/color]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [cb] [i](Please add a 'cbc' in the box if completed.)[/i]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
[img]SIGNATURE[/img]
[i]{{applicantName}}[/i]
Rank
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[lsemsfooter][/lsemsfooter][/code]
[/spoiler]

[lsemsfooter][/lsemsfooter]`
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
          label:"Personnel file BBCode",
          "description":"Copy the personnel file BBCode.",
          copyText:`[img]https://i.imgur.com/nh3xp60.png[/img]
[lsemssubtitle]EMPLOYEE DETAILS[/lsemssubtitle]
[divbox=white]
[b]Full Name:[/b] {{applicantName}}
[b]Phone:[/b] {{phone}}
[b]Badge Number:[/b] XXXXXX
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
      id: "rec-application",
      title: "Close & Archive the Application",
      description:
        "Use the Application Processed (Accepted) format to close the application, then move it into the Accepted Applications archive.",
      actions: [
        {
          label: "Open Accepted Format",
          internal: { href: "/red-formats", label: "RED Formats" },
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
      id: "ooc-rec-1",
      label:
        "On TeamSpeak, set the user's name to IC format and assign both 'Emergency Medical Services' and '[LSEMS] EMR' server groups.",
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
