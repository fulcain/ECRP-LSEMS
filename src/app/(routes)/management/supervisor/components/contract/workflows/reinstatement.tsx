import { RefreshCcw } from "lucide-react";
import type { ContractWorkflow } from "../types";
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
          copyText: `[img]https://i.ibb.co/0xLYT0g/up3t-Iuh.png[/img]
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
[img]https://i.ibb.co/cXr7XYkS/HNP4ks-W.png[/img]
[divbox=white]
[img]https://i.ibb.co/TMRZzNYb/9u-Gi-Pq-F.png[/img][aligntable=right,0,0,0,0,0,0][right][font=Arial][b]
[size=150]Los Santos Emergency Medical Services[/size][/b]
[size=95]"One Team, One Mission, Saving Lives"[/size][/font]
[size=115]Subject[/size]
[size=95]DD/MMM/2024[/size]
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
        {
          label: "Copy Reinstatement Profile",
          description:
            "Copy the full reinstatement training profile BBCode and open the posting page.",
          requiresName: true,
          url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=601",
          copyText: `[img]https://i.ibb.co/6cq7Dhpd/Do3CJ9e.png[/img]
[lsemssubtitle]REINSTATEE INFORMATION[/lsemssubtitle]
[divbox=white]
[b]Reinstatee Name:[/b] {{applicantName}}
[b]Reinstated by:[/b] {{supervisorName}}
[b]Date reinstated:[/b] DD/MMM/YYYY
[b]Rank to be reinstated to:[/b] Rank
[/divbox]
[lsemssubtitle]REINSTATEMENT SESSION DETAILS[/lsemssubtitle]

[spoiler=REINSTATEMENT - Phase I]
[divbox=white]
[lsemssubtitle]Reinstatement Phase I - Requirement: EMT-I+, 1:30h minimum / 3h maximum [/lsemssubtitle]
[center][b]**THE REINSTATEE SHOULD DO TREATMENT & HANDLE UNIT/CALL MANAGEMENT TOWARDS THE END OF THE PHASE**[/b][/center]
[color=transparent].[/color]
[color=transparent].[/color]
[list=1]
[*][color=#800000][b]Hospitals[/b][/color]
[list][*]Explain to the reinstatee the hospitals we've opened. (Make sure to let them know that we no longer have Zonah, Central and Sandy dropoffs, but have garages at Sandy, Zonah and Fire Station 7; reference the general handbook Section 1)
[*]Review where we can drop of patients at Paleto and Pillbox. 
[*]Review the location of the garage in every hospital, as well as the 3 garage-only locations. 
[/list]

[*][color=#800000][b]Call list[/b][/color]
[list][*]Go over the dispatch system with the reinstatee' [ooc]/calls[/ooc], explaining that we see calls oldest to newest, description, location and which unit is currently responding to it.
[*]Go over how to respond to calls, how to close them, and how to check the location. [ooc]/resp, /closecall & /setcall[/ooc]
[*]Explain call priority
[list=1][*]Injured medics on duty
[*]PD and SD
[*]DOC and GOV
[*]Civilians calls from oldest to the newest [/list]
[/list]

[*][color=#800000][b]Radio Codes[/b][/color]
[list][*]Review the radio codes with the reinstatee and quiz them on radio codes.
[*]Ask the reinstatee what would you respond with if someone asks for a 10-3, 10-21, and 10-37.
[*]Ask the reinstatee the difference between code 2 & code 3.
[*]Ask the reinstatee what they would radio in when approaching a scene.
[*]Make up a call number, location, patient count, injury, and quiz them if it's a code 2 or code 3 and which hospital. (Time management is important for location)
[*]Ask the reinstatee what they'd say once they've delivered the patient to the hospital?
[/list]

[*][color=#800000][b]Backup/Panic Alarms[/b][/color]
[list][*]Explain to the reinstatee the difference between a panic alarm and a backup call. 
[*]Inform the reinstatee that if they require a backup alarm they'll need to provide a brief description as to the situation. [ooc]/backup [text][/ooc]
[*]Inform them that our backups/panics now go to all other departments.
[*]Ask the reinstatee if they would do a backup or panic based on the following scenarios:

[list]
[*] They flip their ambulance.
[*] Armed assailants are standing over their patient and screaming threats.
[*] They are involved in an accident and break a few ribs.
[*] They run out of fuel in their ambulance.
[/list]
[/list]

[*][color=#800000][b]Treatment[/b][/color]
[list][*]Ask the reinstatee how they'd treat the following injuries:
[list]
[*] Broken arm or leg
[*] 1st and 3rd-degree burns 
[*] Stomach gunshot wound
[*] Arm/leg gunshot wound
[/list]
[/list]

[*][color=#800000][b]Fire Calls[/b][/color][list]
[*]Show the EMR where to retrieve a fire extinguisher. 
[ooc]RP, then [c]/fl[/c]. Remind them that It'll be [b]INVISIBLE[/b] in the top left slot in the weapon wheel![/ooc]
[*]Then explain the process of extinguishing a fire to the EMR. 
[ooc][c]E[/c] on the floating UI, and [c]/extinguish[/c][/ooc]
[*]Inform the EMR that there can be lingering flames, and that it's best to check the surroundings thoroughly.
[ooc]Additionally, explain that some fires are glitched and are only visible in the UI when physically close to the fire.[/ooc]
[/list]
[*][color=#800000][b]Methadone[/b][/color][list]
[*]Explain to the EMR the proper procedure of distribution of methadone and give them an example of when you can supply it to a patient. [b]Make sure they understand [color=#800000]WELL[/color].[/b]
[*][b]Make sure to teach them how to properly do the entire procedure, especially the importance of utilizing the Prescription Section to note a prescription down. This is of extreme importance, as improperly prescribing Methadone can and will lead to disciplinary action if done incorrectly.[/b]
[*]Inform the EMR that before selling methadone they [b]HAVE[/b] to conduct a drug test.
[*]Inform the EMR that anyone requesting methadone can only pay for it in cash, at the price of $500.
[*][ooc]Inform the EMR roleplay must be completed before using the command, without any roleplay, you'll be breaking powergaming by forcing roleplay without allowing the other player a chance and abusing faction commands.[/ooc]
[/list]

[*][color=#800000][b]Breathalyser[/b][/color][list]
[*]Explain to the EMR the process of conducting a breathalyzer on a patient and give them an example of how to do it. [ooc]/breathanalyse[/ooc]
[*]Inform the EMR that before conducting a breathalyzer they must have the consent of the patient. Explain that if consent is not given, and this is linked to a potential criminal charge, they are required to notify the patient that separate charges can be levied for 'Failure to Comply' or potentially 'Tampering with Evidence'.
[*]Inform the EMR that if a patient's blood alcohol percentage is 0.08% and above, they are legally considered intoxicated as per the San Andreas Penal Code. 
[*]Remind the EMR that we can offer intoxicated patients water, food, and/or a safe ride home by requesting a taxi or calling a friend depending on the situation. If they witness an intoxicated patient attempting to operate a vehicle following a breathalyzer test, that PD/SD should be contacted via department radio as it poses a risk to their safety and the safety of others.
[*][ooc]Inform the EMR roleplay must be completed before using the command, without any roleplay, you'll be breaking powergaming by forcing roleplay without allowing the other player a chance and abusing faction commands.[/ooc]
[/list]

[*][color=#800000][b]Scene Management[/b][/color]
[list][*]Inform the reinstatee what blockades we have [ooc] [c]barrier[/c], [c]barrier2[/c], [c]cone[/c] and [c]arrow[/c][/ooc].
[*][ooc] Additionally inform them of the three extra "blockades" they can use for improving their RP - [c]bls[/c], [c]stretcher[/c] and [c]backboard[/c]. [/ooc]
[*]Explain to the reinstatee the value of blockades and show them that they do save lives.
[*]Explain to them that we can also build a tent with supplies found in our vehicles, but that it should only be used for Code 1 situations or when otherwise specified. (( /blockade tent ))
[*]Show the reinstatee how to block incoming traffic using the ambulance.
[*]Remind the reinstatee that they should never park the ambulance on train tracks.
[*]Remind the reinstatee that medics and patients should wear seatbelts in the ambulance whenever possible. Make sure patients are properly secured before transport. If they are on a stretcher, use the stretcher straps.
[*][ooc]Remind them to RP securing the patient and have the other player press [c]B[/c].[/ooc]
[*]Take the reinstatee on a public road, park the ambulance, and have them practice doing scene management.
[/list]

[*][color=#800000][b]Department Radio[/b][/color]
[list]
[*]Go over the department radio and who uses it. (MD, PD, SD, DOC & GOV) [ooc]/dep[/ooc]
[*]Question the reinstatee about call priority.
[*]Make sure the reinstatee knows that department radio has to be answered even if we are 10-9.
[*]Tell the reinstatee to always say MD before calling over department radio.
[*]Explain the difference between [i]Urgent[/i] (skipping "how copy") and [i]Non Urgent[/i] (using "how copy" then waiting for response)
[*]Inform the reinstatee that once they are certified, the highest ranking unit on shift would usually respond to departmental radio, unless a shift lead is appointed or a training unit has prio (teach them to ask if they are unsure if anyone does have prio)
[/list]

[*][color=#800000][b]PD/SD Calls[/b][/color]
[list]
[*]Explain to the reinstatee how to communicate with PD/SD over department radio.
[*]Inform the reinstatee that they need to report when they are en-route over our normal radio and department radio.
[*]Tell the reinstatee that the first thing to do as they approach the scene is to ask who is injured and who is 10-15/10-16 and if any treatment has been given to the patients before our arrival (Most of PD and SD employees have BLS training).
[list]
[*]If there are no 10-15s, we behave as if it was a normal call.
[*]If there is an injured 10-15, we treat the patient and then we ask PD/SD if we can take the patient to the ambulance.
[/list]
[*]Explain why:
[list]
[*]Never take 10-15 to an ambulance without PD/SD permission.
[*]Never leave a scene without PD/SD permission.
[*]Always ask which hospital PD/SD wishes to go to.
[*]Never drop the patient without asking PD/SD for permission.
[/list]
[*]Make sure the reinstatee knows that it's better to ask twice than get IA reported for stealing a 10-15.[/list]
[*][color=#800000][b]((Teamspeak))[/b][/color]
[list][*][ooc] Ask them to join TeamSpeak 3, make sure they are in Zulu unit
[i]TS info - IP: ts.eclipse-rp.net ; Password: ecrpsagov[/i][/ooc].
[*][ooc] Explain to them how to set up the unit tag before their name, for example, [Z-11] [/ooc].
[*][ooc] Explain that if we use VOIP we say Zulu, if we use chat we type Z [/ooc].
[/list]
[*][color=#800000][b]Jointed Tac[/b][/color]
[list]
[*]Explain to the reinstatee what Jointed Tac (JTAC) is.
[*]Inform the reinstatee on how it's used.
[ooc]Make sure you explain and they understand JTAC is IC and they have to use IC VOIP as well when talking on it. Additionally, explain that using the TS VOIP without using in game VOIP at the same time can lead to a server punishment.[/ooc]
[*]Make sure they understand respect and professionalism is [b]utterly[/b] important here.[/list]
[*][color=#800000][b]On-Call Pager Program[/b][/color]
[list]
[*]Hand them an On-Call Program Pager (stored in the locker room) & explain the program. The EMR is not obliged to join, so do inform them of this as well. (( [b]Make sure you give them the discord role![/b] ))
[/list]

[*][color=#800000][b]Re-Introduction Email[/b][/color]
[list]
[*]Last but not least, send [url=https://pastebin.com/raw/Dq7vYC7s]this email[/url] to the Reinstatee! It contains useful things they may or may not need during the reinstatement training and/or employment.
[/list]
[/list]
[spoiler=Paperwork]
[code]
[img]https://i.ibb.co/JwWCQ0wm/9gkzvd5.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]
[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Were there any department calls?[/b] YES/NO

[b]Did the reinstatee transport a 10-15?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor[/i][list=none]
INPUT FEEDBACK HERE
[/list]
[b][ooc] How did they do Roleplay-wise? Note anything negative and positive:[/ooc][/b][list=none]
[ooc]INPUT FEEDBACK HERE[/ooc]

[/list]
[b]Reinstatement Phase I Notes (25 Word Minimum):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]CONCLUDING NOTES:[/lsemssubtitle]
[divbox=white]
[b]Mandatory Ride-Alongs given:[/b] X

[b]Any subjects that require additional attention in their next session:[/b][list=none]
INPUT FEEDBACK HERE

[b]Was the Reinstatee sent the Re-Introduction Email?[/b]
YES/NO

[/list]
[b]Did the Reinstatee pass Phase I:[/b] YES/NO
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [c] [ ] tick with an X if complete.[/c]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
SIGNATURE
RANK
[/divbox]
[img]https://i.ibb.co/d0W3RK4j/r-LIJt-NZ.png[/img]
[/code][/spoiler]

[/spoiler]

[spoiler=REINSTATEMENT - Phase II]
[divbox=white]
[lsemssubtitle]Reinstatement Phase II - Requirement: EMT-A+, 1:30h minimum / 3h maximum [/lsemssubtitle]
[center][b]**THE REINSTATEE SHOULD HANDLE EVERYTHING**[/b][/center]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list]
[*]The Reinstatement Phase II is something similar to a regular Pre-Certification within the Field Training Program.
[*] You are allowed to answer questions that the reinstatee may have, and you should be asking the reinstatee random things throughout the Phase to ensure they have retained their knowledge during their absence.
[spoiler=What to look out for:]
Did the EMR create a unit? 
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
[/spoiler]
[*] The Reinstatement Phase II must be flawless. Any major mistakes are eliminatory and will result in a failed Phase, and will have to be attempted again.
[*] After the Phase is completed, the EMR can go on duty as an EMR unit, exactly the same as after passing the FTP Pre-Certification.
  
[/list]
[spoiler=Paperwork]
[code]
[img]https://i.ibb.co/BV0RhbYY/Wv5756l.png[/img]
[lsemssubtitle]SESSION DETAILS:[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Were there any department calls?[/b] YES/NO

[b]Did the reinstatee transport a 10-15?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor[/i][list=none]
INPUT FEEDBACK HERE

[/list]
[b]Reinstatement Phase Two Notes (25 Word Minimum):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[b][ooc] How did they do Roleplay-wise? Note anything negative and positive:[/ooc][/b][list=none]
[ooc] INPUT FEEDBACK HERE [/ooc]

[/list]
[/divbox]
[lsemssubtitle]CONCLUDING NOTES:[/lsemssubtitle]
[divbox=white]
[b]Mandatory Ride-Alongs given:[/b] X

[b]Any subjects that require additional attention in their next session:[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[b]Did the reinstatee pass Reinstatement Phase II? [/b] YES/NO

[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [c] [ ] tick with an X if complete.[/c]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
SIGNATURE
RANK
[/divbox]
[img]https://i.ibb.co/d0W3RK4j/r-LIJt-NZ.png[/img]
[/code]
[/spoiler]
[/spoiler]

[spoiler=REINSTATEMENT - Certification]
[divbox=white]
[lsemssubtitle]Certification - Requirement: Junior Paramedic+, 1:30h minimum / 3h maximum[/lsemssubtitle]
[center][b]**THE REINSTATEE SHOULD HANDLE EVERYTHING**[/b][/center]
[color=transparent]spacer[/color]
[color=transparent]spacer[/color]
[list=1][color=#800000][b]Beginning[/b][/color]
[list][*]Make sure the reinstatee knows how to handle and transport a 10-15 if they have not handled one during the reinstatement program. If necessary, create a mock-up scenario.
[*]Inform the reinstatee' that during this certification they are on their own.
[*]Ensure the reinstatee creates the unit for the certification. (D-6Z, C-2Z, B-2Z, A-1Z etc...)

[/list][*][color=#800000][b]During examination[/b][/color]
[list][*]Pay attention to their communication, locking their ambulance, radio calls, scene management, and treatment.
[*]Ensure the reinstatee' attends a department radio call and is able to communicate and efficiently deal with the hectic situation it can become. 
[/list]

[*][color=#800000][b]Ending certification[/b][/color]
[list][*]Give the reinstatee' their certification result and the feedback you gathered whilst supervising them.
[*]Make sure they have a medical license, and offer them a Pager (optional to take it) (( Don't forget the discord role! ))
[*]Inform the reinstatee' regarding duty reports being optional but are encouraged to fill one out.
[*]Infrom the reinstatee' regarding the divisions we have and that they're eligible to join, and encourage them to join a few.
[*]Complete certification paperwork alongside handing the reinstatee' their new rank and callsign (let them pick) within LSEMS. (The rank is predetermined and is stated in the top post)
[*]Post the EMR/REINSTATEE Promotion Checklist on their personnel profile
[/list]

[*][color=#800000][b]Useful Links[/b][/color]
[list][*][url=https://gov.eclipse-rp.net/viewtopic.php?f=597&t=9497]Staff Roster[/url]
[*][url=https://gov.eclipse-rp.net/ucp.php?i=ucp_groups&mode=manage]Groups[/url]
[*][url=https://gov.eclipse-rp.net/viewforum.php?f=605]Personnel Files[/url]
[*][url=https://gov.eclipse-rp.net/viewtopic.php?t=74487]Promotion Checklist (Supervisor Handbook Section 5[/url]
[/list]
[spoiler=Paperwork Passed]
[code]
[img]https://i.ibb.co/v0YqW3f/36xcqas.png[/img]
[lsemssubtitle]SESSION DETAILS[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Were there any department calls?[/b] YES/NO

[b]Did the Reinstatee transport a 10-15?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor[/i][list=none]
INPUT FEEDBACK HERE

[/list]
[b][ooc] How did they do Roleplay-wise? Note anything negative and positive: [/ooc][/b][list=none]
[ooc] INPUT FEEDBACK HERE [/ooc]

[/list]
[b]Reinstatement Certification Notes (50 Word Minimum):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]CERTIFICATION PASSED NOTES:[/lsemssubtitle]
[divbox=white]
[b] Call sign given: [/b] ECHO-X

[b] Medical license present/given? [/b] YES/NO

[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [c] tick with an X if complete.[/c]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
SIGNATURE
RANK
[/divbox]
[img]https://i.ibb.co/d0W3RK4j/r-LIJt-NZ.png[/img]
[/code][/spoiler]
[spoiler=Hippocratic Oath]
Before handing the EMR their EMT badge, have them swear the Hippocratic Oath found below.
[spoiler][center][img]https://i.ibb.co/21ZM4LYs/GRe-HLv-T.png[/img]
[i][b][size=115]I, FName LName, swear to fulfill, to the best of my ability and judgment, this covenant:[/size][/b][/center]

[size=105]
I will respect the hard-won scientific gains of those who walked the steps I walk now, and gladly share such knowledge as is mine with those who are to follow.

I will apply, for the benefit of the sick, all measures which are required to better their condition.

I will remember that there is art to medicine as well as science, and that warmth, sympathy, and understanding may outweigh the surgeon's knife or the chemist's drug.

I will never be ashamed to say "I know not," nor will I fail to call in my colleagues when the skills of another are needed for a patient's recovery.

I will respect the privacy of my patients, for their problems are not disclosed to me that the world may know.

I will remember that I do not treat a chart or simulation, but a sick or injured human being, whose illness may affect the person's family and economic stability. 

I will prevent disease whenever I can, for prevention is preferable to cure.

I will remember that I remain a member of society, with special obligations to all my fellow human beings, those sound of mind and body as well as the infirm.

If I do not violate this oath, may I enjoy life, respected while I live and remembered with affection thereafter.

If I do not violate this oath, may I long experience the joy of healing those who seek my help.[/size][/i]


[center][img]https://i.ibb.co/QjDCvmBp/7a-QSs-Ns.png[/img][/center][/spoiler]
[/spoiler]
[spoiler=EMT E-mails]
[url=https://pastebin.com/raw/EjBDfT9X]Here you'll find a list for each EMT e-mail.[/url] Use the correct one!
[/spoiler]
[spoiler=Diploma Passed]
[url=https://gov.eclipse-rp.net/viewtopic.php?p=445130#p445130]Formats found here - Promotion Posts[/url][/spoiler]

[spoiler=Paperwork Failed]
[code]
[img]https://i.ibb.co/1fP6H9CF/mwt-GIRR.png[/img]
[lsemssubtitle]SESSION DETAILS[/lsemssubtitle]
[divbox=white]

[b]Time Started:[/b] 

[b]Time Ended:[/b] 

[b]Were there any department calls?[/b] YES/NO

[b]Did the Reinstatee transport a 10-15?[/b] YES/NO
[i]If Yes, rate their performance (1-5). Explain any issues if performance was poor[/i][list=none]
INPUT FEEDBACK HERE

[/list]
[b][ooc] How did they do Roleplay-wise? Note anything negative and positive:[/ooc][/b][list=none]
[ooc] INPUT FEEDBACK HERE [/ooc]

[/list]
[b]Reinstatement Certification Notes (50 Word Minimum):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]

[lsemssubtitle]CERTIFICATION FAILED NOTES:[/lsemssubtitle]
[divbox=white]
[b]Reason(s):[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[b]Number of mandatory ridealongs (Minimum 2 + any you deem necessary):[/b] X

[b]Any subjects that require additional attention in their next session:[/b][list=none]
INPUT FEEDBACK HERE

[/list]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [c] [ ] tick with an X if complete.[/c]
[/divbox][lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
SIGNATURE
RANK
[/divbox]
[img]https://i.ibb.co/d0W3RK4j/r-LIJt-NZ.png[/img]
[/code][/spoiler][/spoiler]

[spoiler=Reinstatee Ride-Along]
[code]
[img]https://i.ibb.co/6cn4xtM9/f-V26BWG.png[/img]
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
[b]Ride-along Notes (as detailed as possible, minimum 20 words):[/b][list=none]
INPUT HERE
[/list]

[b]Additional Mandatories assigned (if any): [/b]
[i]Reminder: Only assign if there is no pending mandatories.[/i]
[color=transparent]spacer[/color]
[/divbox]
[lsemssubtitle]Field Training Session Report[/lsemssubtitle]
[divbox=white]
[b]Click [url=https://forms.gle/BJ6iLg5Fkf9Ug6fE6]here[/url] to submit your Field Training Session Report.[/b] [c] [ ] tick with an X if complete.[/c]
[/divbox]
[lsemssubtitle]SIGNATURE[/lsemssubtitle]
[divbox=white]
SIGNATURE
RANK
[/divbox]
[lsemsfooter][/lsemsfooter]
[/code]
[/spoiler]
[lsemsfooter][/lsemsfooter]`,
        },
        {
          label: "Copy Profile Title",
          description: "Copy the reinstatement profile title.",
          requiresName: true,
          copyText: "Reinstatee Profile | {{applicantName}}",
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
          requiresMetadata: ["employeeProfileLink", "personnelFileLink"],
          copyText:
            "[b]X[/b] - [url={{employeeProfileLink}}]#{{personnelFileNumber}}[/url] - [b]EMR[/b] - [url={{personnelFileLink}}]{{applicantName}}[/url]",
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
