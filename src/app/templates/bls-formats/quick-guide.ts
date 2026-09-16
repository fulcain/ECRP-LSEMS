import { BLSTemplateDefinition } from "./types";

/**
 * The BLS Quick Guide reference post graduates receive after completing their
 * course. It is a static BBCode document - rendered as-is, no inputs needed.
 */
export const quickGuideTemplate: BLSTemplateDefinition = {
  value: "quick-guide",
  label: "BLS Quick Guide",
  accent: "from-rose-500/25 via-orange-500/15 to-transparent",
  border: "border-rose-400/30",
  badge: "bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/40",
  renderBody: () => `[img]https://i.ibb.co/N6Sx6TX0/BLS-Quick-Guide.png[/img]
[divbox=white]
[color=transparent]UwU[/color]
[center][size=150][color=#BF0000][u]This guide is for those that have completed our BLS course.[/u][/color][/size]
[color=transparent]UwU[/color]
We highly recommend attending one of our classes before attempting any of the treatments below. LSEMS do not stand responsible if this guide is used without a proper medical license. This guide is intended as a quick reminder from what is covered on the courses.[center]
[color=transparent]UwU[/color]
[/divbox]
[lsemssubtitle]1.0 Table Of Content:[/lsemssubtitle]
[divbox=white]
[list]
[*] [goto=EQUIP]2. Equipment[/goto]
[*] [goto=TREAT] 3. Treatment Guide[/goto]
[*] [goto=OOC][ooc] 4. OOC information[/ooc][/goto]
[*] [goto=USE]5. Useful Information[/goto]
[/list]
[color=transparent]UwU[/color]
[/divbox]
[anchor]EQUIP[/anchor]
[lsemssubtitle]2. Equipment:[/lsemssubtitle]
[divbox=white]
When you have completed your course, you will receive a bag full of essentials to assist you with your new license. This can always be refilled by our receptionist at upper pillbox if needed.
[list]
[*] Quick Guide
[*] Sterile Gloves
[*] Medical Tape
[*] Gauze, Gauze Pads and Bandages
[*] Dressings, multiple sizes and types
[*] Icepacks, both prewrapped and not
[*] Splints in various sizes
[*] Arm sling
[*] Sterile saline bottle
[*] Sterile wipes
[*] Trauma shears and scissors
[*] CPR mouth pieces and oxygen mask
[*] Tweezers
[*] Tourniquet with a pen
[*] Neck bracelet that can be adjustable
[*] Shock blanket
[*] Plastic bags
[*] Light pen
[/list]
[/divbox]
[anchor]TREAT[/anchor]
[lsemssubtitle]3. Treatment:[/lsemssubtitle]
[divbox=white]
[color=transparent]UwU[/color]
[lsemssubtitle]3.1 Broken bones:[/lsemssubtitle]
[divbox=white]
Equipment required:
[list]
[*] Splints / Arm sling
[*] Gauze
[*] Icepack
[/list]
Always check if it is an open or closed fracture, [b]do not attempt to move the bone.[/b] Immobilize the fracture and use the icepack to relieve pain.
[/divbox]
[lsemssubtitle]3.2 Bruises:[/lsemssubtitle]
[divbox=white]
Equipment required:
[list]
[*]Ice pack
[*]Towel
[*]Bandage
[/list]

Apply ice pack wrapped in towel to bruised area. Secure with bandage if needed.
[/divbox]

[lsemssubtitle]3.3 Burns:[/lsemssubtitle]
[divbox=white]
Equipment required:
[list]
[*]Sterile water
[*]Gauze
[*]Burn dressing
[/list]

Cool burn with sterile water. Cover with gauze then apply burn dressing. Don't remove stuck clothing.
[/divbox]

[lsemssubtitle]3.4 Sprains:[/lsemssubtitle]
[divbox=white]
Equipment required:
[list]
[*]Bandage
[*]Sling (for arm)
[*]Ice pack
[/list]

Wrap injured area with bandage. Use sling for arm injuries. Apply ice pack to reduce swelling.
[/divbox]

[lsemssubtitle]3.5 Cuts:[/lsemssubtitle]
[divbox=white]
Equipment required:
[list]
[*]Clean water
[*]Gauze
[*]Bandage
[*]Tourniquet (for severe bleeding)
[/list]

Clean wound with water. Press gauze on cut until bleeding stops. Use tourniquet if bleeding won't stop.
[/divbox]

[lsemssubtitle]3.6 Gunshot Wounds:[/lsemssubtitle]
[divbox=white]
Equipment required:
[list]
[*]Gauze
[*]Bandage
[*]Tourniquet
[/list]

Check for exit wound. Press gauze firmly on wound. Use tourniquet if won't stop bleeding. Don't apply pressure on vital areas.
[/divbox]

[lsemssubtitle]3.7 Severe Allergic Reaction:[/lsemssubtitle]
[divbox=white]
Equipment required:
[list]
[*]EpiPen
[/list]

Lay person flat. Use EpiPen on outer thigh. Hold for 10 seconds. Call ambulance.
[/divbox]
[/divbox]
[anchor]OOC[/anchor]
[lsemssubtitle][ooc]4. OOC Information:[/ooc][/lsemssubtitle]
[divbox=white]
The command for BLS is /cpr ID and should be used [u]after[/u] RP has been concluded.

Please read the following examples:

[spoiler=Acceptable examples of RP]
[divbox=white]
[color=#00FF00]John Doe (1)[/color]: /me checks Jane for injuries.
[color=#00FF00]John Doe (1)[/color]: /do what would he see?
[color=#FFBF00]Jane Doe (2)[/color]: /me have a twisted ankle.
[color=#00FF00]John Doe (1)[/color]: /me takes out some bandage, and wraps it around the twisted ankle.
[color=#00FF00]John Doe (1)[/color]: /me takes out an icepack, activates it and wraps it in cloth, then secures it to the twisted ankle.
[color=#00FF00]John Doe (1)[/color]: /do does this help?
[color=#FFBF00]Jane Doe (2)[/color]: /do yes!
[color=#00FF00]John Doe (1)[/color]: /cpr 2
[/divbox]

[divbox=white]
[color=#00FF00]John Doe (1)[/color]: /me looks over Jane for injuries
[color=#00FF00]John Doe (1)[/color]: /do what would he see?
[color=#FFBF00]Jane Doe (2)[/color]: /do would have a cut on the left arm
[color=#00FF00]John Doe (1)[/color]: /me takes out a sterilized gauze pad and places it on the cut and applies enough pressure to stop the bleeding
[color=#00FF00]John Doe (1)[/color]: /do would the bleeding be stopped?
[color=#FFBF00]Jane Doe (2)[/color]: /do yes it would
[color=#00FF00]John Doe (1)[/color]: /cpr 2
[/divbox]

[divbox=white]
[color=#00FF00]John Doe (1)[/color]: /me looks over Jane for injuries
[color=#00FF00]John Doe (1)[/color]: /do what would he see?
[color=#FFBF00]Jane Doe (2)[/color]: /do would see a 1st degree burn
[color=#00FF00]John Doe (1)[/color]: /me takes out a gauze pad and soaks it in some saline the places it on the burn site
[color=#00FF00]John Doe (1)[/color]: /me after it has cool down replaces the gauze pad with a fresh one
[color=#00FF00]John Doe (1)[/color]: /do would this help the burn?
[color=#FFBF00]Jane Doe (2)[/color]: /do yes it would
[color=#00FF00]John Doe (1)[/color]: /cpr 2

[/divbox]
[/spoiler]

[spoiler=Not acceptable examples of RP]
[divbox=white]
[color=#00FF00]John Doe (1)[/color]: Omg Jane what happened to you?
[color=#FFBF00]Jane Doe (2)[/color]: Oh my leg is broken I think!
[color=#00FF00]John Doe (1)[/color]: Don't worry I got you!
[color=#00FF00]John Doe (1)[/color]: /me looks intensely into the fracture making it go back in place without even touching it
[color=#00FF00]John Doe (1)[/color]: /do would this help?
[color=#FFBF00]Jane Doe (2)[/color]: /do yes it would
[color=#00FF00]John Doe (1)[/color]: /cpr 2

[b][color=red]NOTE: reasons this is not acceptable[/color][/b]
[list]
[*] Not identifying the injury throw /me's and /do's
[*] Unrealistic treatment RP
[/list]
[/divbox]

[divbox=white]
[color=#FFBF00]Jane Doe (2)[/color]: HELP ME IM DYING
[color=#00FF00]John Doe (1)[/color]: /cpr 2
[color=#00FF00]John Doe (1)[/color]: /me fixes Jane

[b][color=red]NOTE: reasons this is not acceptable[/color][/b]
[list]
[*] Not identifying the injury throw /me's and /do's
[*] Not doing any treatment RP
[*] Using /cpr command before the RP
[/list]
[/divbox]

[divbox=white]
[color=#00FF00]John Doe (1)[/color]: /me looks over Jane for injuries
[color=#00FF00]John Doe (1)[/color]: /do what do I see?
[color=#FFBF00]Jane Doe (2)[/color]: /do GSW to the arm
[color=#00FF00]John Doe (1)[/color]: /me takes an icepack and places it on the GSW
[color=#00FF00]John Doe (1)[/color]: /do would this help?
[color=#FFBF00]Jane Doe (2)[/color]: /do yes it would
[color=#00FF00]John Doe (1)[/color]: /cpr 2

[b][color=red]NOTE: reasons this is not acceptable[/color][/b]
[list]
[*] Unrealistic treatment RP
[/list]
[/divbox]
[/spoiler]
[color=transparent]UwU[/color]
Its important to note that the cooldown is not linked to the person issuing the command, but is linked to the ID that received it. If you gonna use the command again on the same person, you will need to RP treat another injury.
While it sucks sometimes, the command [u]cannot[/u] be used before the RP is done. Even if the person is mere seconds from death.
Failing to following this breaches the power gaming rule, and staff will act accordingly. This can result in a rule break punishment and your characters medical license to be revoked.
[/divbox]
[anchor]USE[/anchor]
[lsemssubtitle]5. Useful information[/lsemssubtitle]
[divbox=white]
[list]
[*] If you feel rusty, you are always welcome to apply for a free course after receiving your license.
[*] You are always welcome to reach out to a instructor if you have any questions, even after the course is done.
[*] If you want to commend your instructors, feel free to do it [url=https://gov.eclipse-rp.net/viewforum.php?f=580]here.[/url]
[*] If you have any complaints, please reach out to the Head of BLS and/or Assistant head of BLS. [url=https://gov.eclipse-rp.net/viewtopic.php?t=55728]Roster found here.[/url]
[*] You get a free refill of the equipment from Henry in our lobby. [ooc]Just RP it![/ooc]
[/list]
[/divbox]`,
};
