/**
 * Paste-friendly, first-person narration of the Introduction phase notes.
 * Backticked spans render as click-to-copy command chips in Script mode;
 * "## " paragraphs render as section headings. Copying strips both.
 */
export const INTRODUCTION_SPOKEN = [
  "Welcome to LSEMS. I'm going to walk you through everything you need to know before your first shift. Follow along, ask questions whenever something isn't clear.",

  "## Uniform and on duty",

  "First rule - you cannot be on duty without a trainer, ever. Make sure you understand that. If you can't find a trainer on the radio, head to the Student area and add your availability.",

  "(( Reach out in `/r` for an FTO first. If that gets you nothing, ping the MD discord in `#fto-availability` with the copy-paste message they provide. ))",

  "I'll take you to the locker room now - that's where your locker, uniform, bodycam and ALS bag live. Everything gets stowed here at the start of shift.",

  "Bodycam must be running the whole time you're on duty, every shift, no exceptions. I'll demonstrate how to put it on and record, and then you show me. (( its all just RP )) (( you can pull equipment out with `/FL` and put it back the same way. ))",

  "(( Also - the uniform menu shows more than you're actually allowed to wear. You can only wear what you ICly have access to - don't grab things you don't rate yet. ))",

  "One more thing on identity - if you change your name for any reason, you MUST notify Command and High Command. No exceptions.",

  "Critical one, if you are ever detained or arrested, you notify Command and High Command immediately, including what you were charged with.",

  "If you get IA'd for any reason, you cannot talk to anyone about it. Only the people handling the report, and only when they ask you directly. (( And that goes both ways - no discussing any IA, IC or OOC. ))",

  "Social media policy - no livestreaming and no donating to livestreams while on duty. And if your phone is distracting you, don't use it on duty.",

  "## Unit management",

  "Now let's get you set up with a unit. You'll be the one creating it from here on out, so watch closely",

  "(( `/createunit [name]` creates it )), (( `/renameunit [name]` renames it )), (( `/disbandunit` disbands it )) (( To join someone else's unit use `/joinunit [name]`, and `/leaveunit` steps you out of one)).",

  "Remember, maximum of 2 medics per unit - FTP callsigns and High Command are exempt.",

  "## Callsigns",

  "Quick rundown on our rank system and what the callsigns mean. The highest-ranked medic on a scene is the scene leader - they call the shots.",

  "Zulu is training units - like `Z-11`, `D-1Z`, `O-1Z`, `C-1Z`, `B-1Z`, `A-1Z`.",  
  
  "Echo is EMTs. Delta is Master EMT. Oscar is supervisors-in-training. Charlie is supervisors. Bravo is Command. Alpha is High Command.",

  "EMT callsigns run `E-11` through `E-99`; Delta and Charlie run 1 to 10, or as needed.",

  "Never leave a scene without permission from whoever is scene leader.",

  "We also have divisional callsigns you'll hear on the radio",

   "`AMU` is the Advanced Medical Unit, `BLS` is Basic Life Support, `PR` is Public Relations, `RED` is Recruitment and Employment",
   
   "`ENG` is the fire engine, `FIRE` is a fire unit, `EVAC` is the air unit, `RSC` is the Kamacho unit, `LFG` is lifeguard, and `FOR` is forensics.",

  "## Radio",

  "You stay on MD frequency the whole time you're on duty. We respect each other on the radio - if someone is speaking, don't interrupt. If two people talk at once, back off and let them finish.",

  "## On duty equipment",

  "Your service equipment is issued, not personal. Any abuse of it is punishable - serious cases can end in dismissal from the department.",

  "Personal weapons or tools stay at home or in your personal vehicle.",

  "Kevlar becomes available after your Certification. It stays in your vehicle at all times and is only worn in potential hostile or life-threatening situations - the most senior on shift can request it.",

  "## Pillbox hospital tour",

  "Let's tour Pillbox. Ward D has the vending machines - first door on the right. Anything you get from them is LSEMS staff only.",

  "The Morgue stays LOCKED at all times. No exceptions.",

  "Employee parking - I'll show you how to lock and unlock the gates. On-duty staff only - off-duty vehicles left here get towed and secured impounded if leadership deems it necessary.",
  
  "And don't leave valuables in your car there, it's a lockpick magnet - Legion Parking is the safer spot.",

  "All doors accessible to the public stay locked at all times.",

  "## Hospitals",

  "Drop-offs. Upper Pillbox first, then Lower Pillbox. Then we roam to Paleto MD - you go in the right side entrance, drive around, and exit on the left. I'll show you exactly how it's done.",

  "Inside Paleto MD you can clock on, and the plastic surgeon is in there too. If you're clocking on at Paleto, park at Paleto Parking - it's not safe to park at the MD itself.",

  "## TeamSpeak (OOC)",

  "(( Jump into TeamSpeak 3 and make sure your IC name is correct. Put your unit tag before your name, like `[Z-11] John Doe`. ))",

  "(( Two hard rules - you may NOT be on the TeamSpeak server while playing a criminal character - that leads to server punishments. And remember - on VOIP we say 'Zulu', in chat we type `Z`. ))",

  "## OOC corruption and faction commands (OOC)",

  "(( LSEMS has an OOC corruption ruling - we don't require IC evidence to terminate for any illegal activities. ))",

  "(( Faction commands are a privilege, not a toy. You can't use them without doing the applicable roleplay first - abuse leads to faction repercussions and/or server punishments. ))", 
  
  "(( Faction equipment and vehicles carry exactly the same weight. ))",

  "(( If you receive an admin punishment, you MUST tell High Command within 48 hours. Send them the report link, and update them when it's concluded along with the result. ))",

  "(( And if you can't post an LOA for OOC reasons, reach out to someone from Command or High Command and let them know. ))",

  "## Ending the introduction",

  "Use the radio to try to reach a certified Field Training Officer - Something like 'EMR Smith to dispatch, are there any available FTOs?' (( NO VOIP RADIO - type it! ))",

  "You have a mandatory 30 minute break between the Introduction and Phase I. Use it to go over your introduction email once more until it all clicks.",

  "Duty reports aren't required, but filling one out once a week really helps supervisors see the work you're doing.",

  "If you want, I can take you on a ride-along now, or find someone who can, so you can see how it all works.",

  "|| Trainer - before you finish, make sure the EMR received the Introduction email - the 'Copy email' button lives in the Guide view of these notes. ||",
].join("\n\n");
