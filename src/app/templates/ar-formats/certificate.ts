import type { ARCertificateContext } from "./types";

/**
 * The divisional-file post that goes in the new Medevac Pilot's profile once
 * the certification has been passed - the same shape the FTI page writes for a
 * fresh FTO, and the reason the builder links to the divisional profiles
 * rather than asking where the post lives.
 */
export const arCertificateTemplate = {
  value: "certificate",
  label: "Certificate",
  renderBody: ({
    studentName,
    completionDate,
    certifiedBy,
  }: ARCertificateContext): string => `[lsemsfooter][center][img]https://i.imgur.com/eCAmFX9.png[/img]

[size=125]${studentName} has been certified as a Medevac Pilot![/size]

[size=115]
[b]Date:[/b] ${completionDate}
[b]Certified by:[/b] ${certifiedBy}
[/size][/center]
[lsemsfooter]`,
};
