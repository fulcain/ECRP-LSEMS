export type CourseReportType = "joint" | "normal" | "ots";

export type CourseReportContext = {
  type: CourseReportType;
  /** "11/JUL/2026" */
  date?: string;
  /** 24-hour "14:00" */
  time?: string;
  /** "RANK NAME" entries, one line each */
  instructors?: string[];
  /** "Pillbox MD" | "Paleto MD" (joint/normal only) */
  location?: string;
  /** Graduate names, rendered as a numbered list (joint/normal only) */
  graduates?: string[];
  guideEmailSent?: boolean;
  /** Already comma-formatted, e.g. "10,000" */
  fundsObtained?: string;
  /** Money given to the Government? */
  moneyGivenToGovernment?: boolean;
  /** Receipt (funds) attachment URL, placed in [url=…] */
  receiptUrl?: string;
  /** OTS only — officer(s) name entries, one line each */
  officers?: string[];
  /** OTS only — students (with company), rendered as a bullet list */
  students?: string[];
  /** OTS only — Weazel receipt attachment URL */
  receiptWeazelUrl?: string;
  /** OTS only — signature block auto-fill */
  medicName?: string;
  medicRank?: string;
  medicSignature?: string;
};

const JOINT_HEADER_IMG = "https://i.postimg.cc/q7qqnwN2/BLS-Course-Report.png";
const JOINT_FOOTER_IMG = "https://i.postimg.cc/WzBgYKkF/BLS-Footer.png";

const NORMAL_HEADER_IMG = "https://i.ibb.co/LdWPwcK0/BLS-Course-Report.png";
const OTS_HEADER_IMG = "https://i.ibb.co/vxVmQxCX/BLS-OTS-Report.png";
const BLS_FOOTER_IMG = "https://i.ibb.co/hJjNvPWz/BLS-Footer.png";

/** Shared "RANK NAME" instructor lines for the standard joint/normal reports. */
function buildInstructorLines(instructors: string[]): string {
  const lines = instructors
    .filter((entry) => entry.trim())
    .map((entry) => `[b][u]Instructor:[/u][/b] ${entry.trim()}`)
    .join("\n");
  return lines || "[b][u]Instructor:[/u][/b] RANK NAME";
}

function renderStandardCourseReport({
  type,
  date,
  time,
  instructors = [],
  location = "Pillbox MD",
  graduates = [],
  guideEmailSent = false,
  fundsObtained,
  moneyGivenToGovernment = false,
  receiptUrl,
}: CourseReportContext): string {
  const headerImg = type === "normal" ? NORMAL_HEADER_IMG : JOINT_HEADER_IMG;
  const footerImg = type === "normal" ? BLS_FOOTER_IMG : JOINT_FOOTER_IMG;

  const dateLine = `${date || "DATE"} at ${time || "TIME"} [ooc]UTC[/ooc]`;

  const instructorBlock = buildInstructorLines(instructors);

  const graduateLines = graduates
    .filter((entry) => entry.trim())
    .map((entry) => `[*] ${entry.trim()}`)
    .join("\n");
  const graduatePlaceholder =
    type === "normal"
      ? "[*] Firstname Lastname - Company"
      : "[*] Firstname Lastname";
  const graduateBlock = graduateLines || graduatePlaceholder;

  const guideTick = guideEmailSent ? "✓" : " ";

  const confirmationSection =
    type === "normal"
      ? `[b]Funds Obtained: [/b] $${fundsObtained || "HERE"}\n[i]Place a tick (✓) in the box[/i]\n[b]Money given to the Government?[/b] [${
          moneyGivenToGovernment ? "✓" : " "
        }] \n[b]BLS Guide email sent?[/b] [${guideTick}] \n[b]Receipt:[/b] [url=${
          receiptUrl || ""
        }]*Attachment*[/url]`
      : `[i]Place a tick (✓) in the box[/i]\n[b]BLS Guide email sent?[/b] [${guideTick}] `;

  return `[img]${headerImg}[/img]
[divbox=white]

${dateLine} 

${instructorBlock}
[b][u]Location:[/u][/b] ${location}

[color=#FF0000][b][u]Course Graduates:[/u][/b][/color]
[list=1]
${graduateBlock}
[/list]

${confirmationSection}
[/divbox]
[img]${footerImg}[/img]`;
}

function renderOtsCourseReport({
  date,
  time,
  instructors = [],
  officers = [],
  students = [],
  fundsObtained,
  moneyGivenToGovernment = false,
  receiptUrl,
  receiptWeazelUrl,
  medicName,
  medicRank,
  medicSignature,
}: CourseReportContext): string {
  const dateLine = `${date || "DATE"} at ${time || "TIME"} [ooc]UTC[/ooc]`;

  const instructorLines = instructors
    .filter((entry) => entry.trim())
    .map((entry) => `[b]Instructors name:[/b] ${entry.trim()}`)
    .join("\n");
  const instructorBlock =
    instructorLines || "[b]Instructors name:[/b] ANSWER";

  const officerLines = officers
    .filter((entry) => entry.trim())
    .map((entry) => `[b]Officer(s) name:[/b] ${entry.trim()}`)
    .join("\n");
  const officerBlock = officerLines || "[b]Officer(s) name:[/b] ANSWER";

  const studentLines = students
    .filter((entry) => entry.trim())
    .map((entry) => `[*] ${entry.trim()}`)
    .join("\n");
  const studentBlock = studentLines || "[*] Fname Lname - Company";

  const signatureImg = medicSignature
    ? `[img]${medicSignature}[/img]`
    : `[b]Signature[/b]: [Add your saved signature in Staff Page]`;
  const nameLine = medicName || "Fname Lname";
  const rankLine = medicRank || "EMS Rank | BLS Rank";

  return `[img]${OTS_HEADER_IMG}[/img]
[divbox=white]
${instructorBlock}
[b]Date and time:[/b] ${dateLine}
${officerBlock}
[b]Students:[/b]
[list] 
${studentBlock}
[/list]

[b]Funds Obtained: [/b] $${fundsObtained || "HERE"}
[i]Place a tick (✓) in the box[/i]
[b]Money given to the Government?[/b] [${moneyGivenToGovernment ? "✓" : " "}] 
[b]Receipt (funds):[/b] [url=${receiptUrl || ""}]*Attachment*[/url]
[b]Receipt (Weazel):[/b] [url=${receiptWeazelUrl || ""}]*Attachment*[/url]

${signatureImg}
[i]${nameLine}[/i]
${rankLine}
[b]Los Santos Emergency Medical Services[/b]
[/divbox]
[img]${BLS_FOOTER_IMG}[/img]`;
}

export function renderCourseReport(context: CourseReportContext): string {
  if (context.type === "ots") {
    return renderOtsCourseReport(context);
  }
  return renderStandardCourseReport(context);
}
