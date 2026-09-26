/**
 * Paste-friendly, first-person narration of the Phase III notes.
 * Backticked spans render as click-to-copy command chips in Script mode;
 * "## " paragraphs render as section headings. Copying strips both.
 */
export const PHASE3_SPOKEN = [
  "Welcome to Phase III - 1 hour minimum, 2 hours maximum. This is where you drive, treat, and run the whole show.",

  "## Garage and ambulance",

  "Let's grab an ambulance from Betsy. You can choose whatever is labled ar EMR and EMT.",

  "(( You see whatever your rank allows you to see, make sure to check the description before using it. It might be for a division only. ))",

  "These are fleet vehicles - repair and refuel before you park, every time. Maintenance comes out of the LSEMS treasury, so take care of them for the next medic.",

  "Lock your ambulance, always. Double-checking is better than not checking.",

  "Seatbelts for both medics and patients whenever possible - make sure the patient is properly secured before beginning transport. On a stretcher, use the stretcher straps. (( You RP securing them, and they press B on their keyboard. ))",

  "Never park the ambulance on train tracks.",

  "Code 2 vs Code 3, and how to run the lights and sirens. Toggles lights using this button on the dashboard `/E` ,This button toggles sirens on dashboard. `/Q`. Code 4 is lights and sirens off, driving normally.",

  "(( Only a Command+ member can authorize changing your vehicle's colour - otherwise it's IC repercussions. ))",

  "Quick blip to Lower Pillbox from the GPS is this button on dashboard. `/hospital`.",

  "The GPS is functional but not always smart about routing - a call from Burgershot while you're at the ambulance bay is the classic example. Trust your map knowledge. Ill send you a photo of what I mean",
 
  "{{ /me airdrops a image to EMR through the tablet. }}",
  "{{ /do https://i.ibb.co/YxGLLsQ/i5et-N3F.png }}",

  "Roaming - stay in motion, stay 10-8, and take calls as they come.",

  "## Driving capabilities",

"Two driving tests today - first a dirt trail, then a combination of dirt and asphalt.",

"Head to Senora Road - set your GPS to 2 Senora Rd. (( `/setgps 2 senora rd` )) I'll show you the map spot.",

"{{/me takes out the tablet and airdrops a link to the EMR.}}",
"{{/do https://i.ibb.co/DDdzBxkP/dirt-phase-3.png}}",

"I'll take over and start driving around the Redwood Tracks area. It doesn't need to be a perfect route, but I'll try to cover as much of the area as possible so you can see what to expect.",

"Once I've shown you the area, you can practice around the Redwood Tracks as much as you want. Go as fast as you feel comfortable with, but make sure you stay in control of the ambulance.",

"{{/me takes out the tablet and airdrops a link to the EMR.}}",
"{{/do https://i.ibb.co/7tV3WjRD/phase-3.png}}",

"Course two is a mix of dirt and asphalt trails with a good amount of turns. It can be a little challenging, but it's definitely useful practice. I'll take over and show you the route first, then you can complete it yourself.",

"Once you've completed the course, do it one more time. Your first lap will be Code 4, then your second lap will be Code 3.",

"Finale - drive to Sandy Firestation at 27 Panorama Dr `/setgps 27 Panorama Dr`, Code 3.",

"Need more practice? We'll redo any of the courses at the end of the session.",

"## Hospitals and fire stations of Los Santos",

"Alright, you're at Sandy now - Betsy can serve you here as well, so go ahead and ask her for a vehicle. From there we'll head to Fire Station 7 and I'll show you where to ask Betsy for a vehicle there too.",

"(( Sandy Fire Station pictures - blip and location map. )) (( Fire Station 7 pictures - blip and location map. ))",

"Next stop - Central. From there we go to Mount Zonah, and finally we'll hit Boat Dock. At each of these I'll show you how to call Betsy so she can retrieve a vehicle for you.",

"(( Central MD pictures - blip and location map. )) (( Mount Zonah pictures - blip and location map. )) (( Boat Dock pictures - blip and location map. ))",

  "## Scene management",

  "|| Pick a secluded spot to practice - the abandoned cul-de-sac in Mirror Park opposite. `/setgps 7 East Mirror Dr` ||",

  "(( Our blockades - `arrow`, `barrier`, `barrier2`, `cone`, `stretcher`, `backboard`, `tent`, `bls`. ))",
  "(( You can place them by /blockade [name] for example: /blockade arrow ))",
  "(( You can also see the full list by doing `/blockade a` ))",

  "Your ambulance is one of your biggest blockades - here's how to angle it to block incoming traffic.",

  "Arriving on scene, in order - siren OFF, engine OFF, emergency lights ON, step out of the ambulance, then ALWAYS double-check the rig is locked.",
  "In the case that the patient is in the middle of the road, move the patient onto the sidewalk immediately when possible while making sure you are NOT causing the patient any harm.",
  "The ambulance should be parked safely out of the way so it does not block the street, cause any unnecessary obstruction, or create a traffic jam.",

  "Watch me position once, then you try it. Then show me the whole arrival + scene management routine all at once.",

  "## JTAC",

  "Jointed Tac - JTAC - I'll explain what it is and how it's used. The highest rank on shift is the unit that joins JTAC if asked.",

  "Respect and professionalism are UTTERLY important here. (( JTAC is IC, so it's in-game VOIP. ))",

  "The JTAC frequencies are 910.1 to 910.5 - five channels in total.",

  "(( No VOIP? That's fine - not expected. But having someone on duty who can VOIP join JTAC with you is ideal. Otherwise - `/dep MD to JTAC-1 [msg]` or `/dep MD to SD/PD [unit]`. ))",

  "## Ending the phase - ride-along",

  "|| Make sure they can do everything alone - let the EMR take over treatment, radio calls, and driving. ||",

  "|| Overwhelmed? Let them focus on their driving for the rest of the session. ||",

  "|| Assign mandatories if they're having a rough time, and remind them optional ride-alongs are always an option. And encourage roaming during downtime in their upcoming ride-alongs. ||",

  "|| Report honestly - if they performed poorly, say so. This is their last chance before Pre-Certification, and generic praise only hurts them. ||",
].join("\n\n");
