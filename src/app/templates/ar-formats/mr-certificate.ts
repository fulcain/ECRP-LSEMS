import type { MRCertificateContext } from "./types";

/**
 * The divisional-file post that goes in the new Mountain Rescuer's profile once
 * the certification has been passed - the same shape the pilot certificate
 * writes, so both certifications end in the same kind of post.
 */
export const mrCertificateTemplate = {
  value: "mr-certificate",
  label: "Mountain Rescue Certificate",
  renderBody: ({
    studentName,
    completionDate,
    certifiedBy,
  }: MRCertificateContext): string => `[lsemsfooter][divbox=white][center][img]https://i.ibb.co/xKHjB3bM/image.png[/img]

[size=125]${studentName} has been certified as a Mountain Rescuer![/size]

[size=115]
[b]Date:[/b] ${completionDate}
[b]Certified by:[/b] ${certifiedBy}
[/size][/center][/divbox]
[lsemsfooter]`,
};
