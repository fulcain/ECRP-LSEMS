/**
 * Paste-friendly, first-person narration of the Phase I notes.
 * Backticked spans render as click-to-copy command chips in Script mode;
 * "## " paragraphs render as section headings. Copying strips both.
 */
export const PHASE1_SPOKEN = [
  "Welcome to Phase I - 1 hour minimum, 2 hours maximum. Heads up - today you're not driving or treating anyone. What you ARE doing is running your unit, start to finish.",

  "## Radio codes",

  "Let's go through the radio codes we use and what each one means. Open Section 14.7 of the General Handbook and follow along.",

"Ten codes - 10-1 is roll call.",
"10-3 is stop transmitting.",
"10-4 is affirmative.",
"10-5 is repeat last transmission.",
"10-6 is disregard last transmission.",
"10-8 is available.",
"10-9 is unavailable.",
"10-15 is injured suspect.",
"10-16 is injured patient.",
"10-20 is location.",
"10-21 is report status.",
"10-37 is unit identify. like C-3Z is Dmitry Petrov and Jon Snow. ",
"10-70 is backup request.",
"10-99 is concluded situation.",

"Status codes - `Code 0` is fell asleep (( game crash )).",
"`Code 1` is urgent assistance required - ALL UNITS.",
"`Code 2` is non-emergency.",
"`Code 3` is emergency.",
"`Code 4` is no further assistance required.",
"`Code 6` is on scene.",

  "## Radio calls",

  "Now the radio calls - Section 14.2 of the handbook. These are the exact lines you type on the MD frequency -",

  "Starting service under someone - 'EMR Lastname is starting services under Callsign.'",

  "Forming your own unit - 'EMR Lastname is forming Callsign and is 10-8 from Pillbox/Paleto.'",

  "Ending services under someone - 'EMR Lastname is leaving Callsign and is 10-9 ending services.'",

  "Disbanding - 'EMR Lastname is disbanding Callsign and is `10-9` ending services.'",

  "Arriving on scene - 'Callsign is Code 6 on last call.' you can say the exact number, but it's not mandatory",

  "Leaving a scene - 'Callsign is Code 2/Code 3 to Pillbox/Paleto with X 10-15/10-16(s) from last call.'",

  "Roaming - 'Callsign is 10-8 roaming Location/To Location.'",

  "Requesting backup - 'Callsign to any 10-8 units, requesting a 10-70 on Call ID/Location.'",

  "Sidewalk patient - Callsign is 10-9 with a sidewalk patient at Location.",

  "Dropping response - Callsign is dropping response from last Call as blank. For example patient was self transported, patient not on scene, it's code-4, Patient was DOA, Dead on accident -",

   "Died During treatment, and is 10-8 roaming back to pillbox",

   "So as an example, C3-Z is dropping response from last call as patient died during treatment and is 10-8 roaming bac to pillbox.",

  "Have a go at a few of these now - I'll throw scenarios at you and you radio back.",

  "## Calls list",

  "Open the dispatch call system `/calls` - you can see the location, call number, description, and whether the call is already taken. You can interact with the calls inside of the call list.",

  "(( Respond with `/resp`, close with `/closecall`, and `/setcall` pins the call you're working. Use `/setcall -1` to clear your GPS when it gets stuck on an old call. ))",

  "I can drop a backup call `/backup` so you can practice responding, dropping response, and closing a call.",

  "Call priority - injured medics on duty first, then PD and SD, then DOC and GOV, then civilian calls oldest to newest, then walk-in patients.",

  "You can close a call if it's older than one hour. (( phone time )).",

  "Calls don't close themselves - if the caller wasn't injured, it stays open. That's also why we close duplicate calls, so the list stays clean.",

  "The caller's number shows up in the log and if something's off, it can help to call them back.",

  "## Panic button and backup calls",

  "The panic button and a backup call are different things - let's get the difference straight. A backup call needs a brief summary of the situation, and whether it's MD only. `/backup [text]`",

  "If you ask for backup, stay put - backups are tied to your cruiser.",

  "Your panic button is tied to your radio's location, and you can't add a reason when you create one. `CTRL + E`.",

  "Our panics and backups show up in PD/SD dispatch now. If you make one that doesn't need them, use the department radio to tell those departments to disregard it. `/dep`",

  "If you DO need PD or SD, use the department radio and give them the backup/panic call number.",

  "Scenario time - would you back up or panic? You flip the ambulance.",
  "Armed people are standing over your patient making threats. (( Remember FearRP - no panics while under it! ))",
  "You run out of fuel.", 
  "You're badly injured after a severe accident. (( And if you're scriptly injured, call 911 in addition to the panic! ))",

  "## Department radio",

  "Department radio is `/dep` and `/deplow`. MD, PD, SD, DOC and GOV are all on it.",

  "It has to be answered even when we're `10-9`. Always open with 'MD to'.",

  "Non-urgent - 'MD to PD/SD, how copy?', then transmit your info once they respond.",

  "Urgent - after a panic or backup, skip the 'how copy' - straight to 'MD to PD/SD, need units at [call], [brief reason].'",

  "Once you're certified, a supervisor - or the highest rank on shift - usually answers departmental radio.",

  "## PD/SD calls",

  "Always report en-route on both our normal radio and department radio, and here's why it matters.",

  "First thing when you roll up - who's injured, who's a 10-15 or 10-16, and has anyone treated them yet. Most PD and SD employees have BLS training.",

  "No 10-15s? Treat it like a normal call. Injured 10-15? Treat the patient, then ask PD/SD if you can take them to the ambulance, and which hospital.",

  "The rules - never take a 10-15 to the ambulance without PD/SD permission. Never leave a scene without permission. Always ask which hospital they want. Never drop the patient without asking.",

  "Better to ask twice than get IA reported for stealing a 10-15.",

  "These calls can be slow - SD/PD coordination, figuring out 10-15 vs 10-16, which hospital you're heading to. Patience.",

  "## DOC calls",

  "DOC inmates never leave the prison for treatment.",

  "If DOC calls you in, treat the inmate in the prison's medical ward. (( Do the full medical RP there - then `/stabilize` - and only drop the inmate at the `/dropbody` point once all of that is done. ))",

  "A Correctional Officer, or any form of law enforcement, is REQUIRED to be with the medic inside the prison grounds at all times. That's for our safety.",

  "## Specialized calls",

  "Sometimes a call needs a specialized division. AMU handles advanced medical treatments inside hospitals. A&R - Air & Rescue - does tough-to-reach rescues with helicopters and offroad vehicles.", 
  "F&R - Fire & Rescue - handles firefighting and pulling people from vehicles or objects.",

  "If a specialized unit is needed but none are available, you need to know the minimum.", 
  "get close with your vehicle, handbrake on, continue on foot, watch your surroundings as you climb, treat them, then carefully get them back to the ambulance.",

  "(( Before paging AMU or otherwise, the patient has to actually want that roleplay - ask via `/b`. It's deep character-specific RP and they need the time and willingness for it. ))",

  "## Fire calls",

  "I'll show you where the fire extinguishers live. (( RP pulling it out first, then `/fl`. Heads up - it's INVISIBLE in the top-left weapon wheel slot! ))",

  "To extinguish just take the pin out and shoot straight into the fire (( press `E` on the floating UI, then `/extinguish` )).",

  "Watch for lingering flames - check the surroundings thoroughly. (( Some fires are glitched and only show in the UI when you're physically close. ))",

  "(( Unattended fires get handled by roadworkers after 5 minutes - that doesn't mean you leave a fire unattended. ))",

  "Fire calls don't close themselves. `/closecall ID`.",

  "And put the extinguisher back when you're done.",

  "## Ending the phase - ride-along",

  "You take unit management, responding to calls, and closing calls.",

  "Want to try the radio codes? (( I'll type them in chat, you repeat them over the radio. ))",
  "|| If they don't want to, nudge them gently - it's good practice. ||",

  "|| Explain everything you do as you do it, and make sure to tell them you're happy with their work. Assign 1x mandatory ride-along, plus additional mandatories if they need them. Report honestly - if they performed poorly, say so. Generic praise only hurts the EMR. ||",
].join("\n\n");
