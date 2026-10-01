/**
 * Paste-friendly, first-person narration of the Phase II notes.
 * Backticked spans render as click-to-copy command chips in Script mode;
 * "## " paragraphs render as section headings. Copying strips both.
 * (( ... )) marks OOC (copies as /b); {{ ... }} marks RP lines (copied
 * to normal chat without /b).
 */
export const PHASE2_SPOKEN = [
  "Welcome to Phase II - 1 hour 15 minutes minimum, 2 hours 30 minutes maximum. You'll start treating patients near the end of this phase, and you keep managing your unit.",

  "## Volatile patient list",

  "Let's talk about the Volatile Patient List. I'll send you the link. Check it OFTEN - it gets updated frequently.",

  "{{ /me opens the gov website on the tablet and takes the link, airdroping it to the EMR. }}",
  "{{ /do https://gov.eclipse-rp.net/viewtopic.php?p=769876 }}",

  "Two hard rules - PD/SD response, or a 10-70 from MD, is REQUIRED before you engage. And everyone on that list is handled with extreme caution.",

  "If you think a name belongs on the list, reach out to anyone on the leadership team. It's reserved for people who may pose a direct threat to LSEMS as a whole.",

  "## Hostile situations",

  "Our safety comes first on every scene. If a situation is clearly unfavorable - outnumbered by clearly hostile individuals -",
   "don't call for law enforcement in front of them. That just gives them a reason to attack us.",

  "Patients get upset sometimes. Watch what you say, for your own safety and every medic on scene.",

  "If you can, get back to your vehicle and move about a block away - 50m or more - and only then request law enforcement over department radio. (( And consider `/deplow` instead of `/dep` if it's sensitive. ))",

  "## GSB",

  "GSB will sometimes check in and ask if we need assistance. Usually whoever is shift lead decides.",

  "GSB is here for our protection. They do NOT interfere with patients unless someone is a direct threat to a medic's life - and even then, PD/SD is called immediately.",

  "## Treatment",

  "|| Optional - we can use the BLS Classroom for this, provided there's no active BLS class. ||", 
  "Tell me how you'd treat these - a closed fracture on a patient's leg.", 
  "A gunshot wound to the chest.", 
  "1st, 2nd and 3rd degree burns.", 
  "Stab wounds.", 
  "A concussion.",

  "(( The golden rule for every medical command - roleplay FIRST. Stabilizing before you've RP'd finding the injuries is powergaming. `/stabilize` comes after your `/me`s and `/do`s reveal the wounds. ))", 
  "((`/heal` is a reward for good RP - not for people asking for a 'bandaid' with no effort behind it. ))", 
  "((`/CPR` is only available after a BLS class or certification, and misusing it costs you the medical license. ))",

  "## Methadone",

  "Open Section 7.9 of the Department Manual - Methadone. I'll send the link.", 
  "{{ /me opens the Methadone secton on the gov website and airdops the link to the EMR. }}",
  "{{ /do https://gov.eclipse-rp.net/viewtopic.php?t=106075#9 }}",

  "We're going through the ENTIRE procedure, especially logging the prescription in the Prescription Section.",

  "This is important - improperly prescribing methadone can and will lead to disciplinary action. Someone prescribed in the last 7 days? You can't prescribe again.",
  "Three times in a single month? Only an EMT-I+ can prescribe further.",

  "Drug test BEFORE every sale. Cash only, $500.",

  "Warn the patient about the dangers of an overdose, and if someone seems to be abusing it, AMU or leadership can step in.",

  "Unsure on anything? Contact a Supervisor, Command+, or other personnel. We'll also go over the Denied Prescription Format in detail.",

  "(( And again - full RP before the command, always - otherwise you're powergaming and abusing faction commands. ))",

  "## Breathalyser",

  "Before a breathalyzer - consent of the patient, always. (( `/breathanalyse` )) If they refuse and it's tied to a potential criminal charge, tell them they can be charged with Failure to Comply or Tampering with Evidence.",

  "0.08% blood alcohol and above is legally intoxicated, per the San Andreas Penal Code.",

  "We can offer intoxicated patients water, food, or a safe ride home - taxi or a friend, depending on the situation. If they try to drive anyway after a test, contact PD/SD over department radio - it's a risk to them and everyone else. (( And RP before the command, always. ))",

  "## Time management",

  "Time management - choose the closest hospital, treat the non-critical first, and drive Code 3 even when not strictly required if calls are stacking up with nobody to take them.",

  "(( Few units, many calls = quick treatment. Many units, few calls = slow, in-depth treatment. ))",

  "Code 3 to a call? You still stop for injured people on the sidewalk.",

  "Switching calls - `/setcall -1` radio that you're dropping response from the current call, and ask another unit to take it.",

  "## Ending the phase - ride-along",

  "Ride-along time. You've got this one - radio, unit management, treatment.",

  "|| If they can run all of it by themselves, no extra mandatories. If they won't take feedback or they're struggling on the ride-along, assign appropiate amounts. ||",

  "|| Assign 1x mandatory ride-along minimum if encountered issues, plus additional mandatories if required. ||",

  "|| Report honestly - if they performed poorly, say so. Generic praise only hurts the EMR. ||",
].join("\n\n");
