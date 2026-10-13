import { REDTemplateDefinition } from "./types";

export const walkInWelcomeEmailTemplate: REDTemplateDefinition = {
  value: "walk-in-welcome-email",
  label: "Walk-In Welcome Email",
  accent: "from-rose-500/25 via-red-500/15 to-transparent",
  border: "border-rose-300/30 dark:border-rose-400/30",
  badge: "bg-rose-100 dark:bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/40",
  renderBody: ({ applicant }) => {
    const name = (applicant || "Applicant Name")
      .trim()
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\[/g, "&#91;")
      .replace(/\]/g, "&#93;");
    const appLink = "https://lsems-formats.vercel.app/";
    const discordLink = "https://discord.gg/3nysTssuMw";
    const applicationMarkup = "[url=" + appLink + "][b]here[/b][/url]";

    return [
      "[mdheader2",
      'title="October 4th, 2026"',
      'location="Recruitment And Employment"',
      'date=""',
      'logo="https://i.vgy.me/lybSum.png"',
      'department="One Team, One Mission, Saving Lives"',
      "][/mdheader2]",
      "",
      "[divbox4=eeeeee]",
      "",
      "[list=none]",
      "Greetings " + name + ",",
      "",
      "Welcome to the first step on the journey on becoming an EMT with the Los Santos Emergency Services. Before we can conduct your interview we first need you to fill in the following form, found " + applicationMarkup + ".",
      "",
      "You cannot move on to the next stage of the process until you've completed this step in it's entirety. Please reach out to member of RED or LSEMS if you need help with your application.",
      "",
      "Good luck!",
      "",
      "[ooc]You're required to join the LSEMS Discord for an OOC interview and while employed with the department. Please join [url=" + discordLink + "][b]HERE[/b][/url] and rename yourself with your IC name.[/ooc]",
      "",
      "[/list][hr][/hr][list=none]",
      "",
      "Sincerely,",
      "Recruitment And Employment Division",
      "Los Santos Emergency Medical Services",
      "[/list]",
      "",
      "[/divbox4]",
    ].join("\n");
  },
};
