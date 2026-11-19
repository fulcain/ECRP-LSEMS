/**
 * The BBCode blocks the Paperwork Maker offers to insert.
 *
 * They are the shapes the division paperwork in this app is already written in -
 * a title, a section heading, a white box, a list - kept as data so the forum's
 * spelling lives in one place. A snippet may use the built-in placeholders; it
 * never names a field, because the maker has no field yet when it is inserted.
 */

export type PaperworkSnippet = {
  id: string;
  label: string;
  /** One line for the tooltip: what the block is for. */
  description: string;
  bbcode: string;
};

export const PAPERWORK_SNIPPETS: readonly PaperworkSnippet[] = [
  {
    id: "title",
    label: "Centered title",
    description: "A large bold title, centred.",
    bbcode: "[center][b][size=150]TITLE[/size][/b][/center]",
  },
  {
    id: "subtitle",
    label: "Section heading",
    description: "The maroon section heading the division paperwork uses.",
    bbcode: "[lsemssubtitle]SECTION TITLE[/lsemssubtitle]",
  },
  {
    id: "box",
    label: "White box",
    description: "A white box to write a section inside.",
    bbcode: "[divbox=white]\n\n[/divbox]",
  },
  {
    id: "list",
    label: "Bullet list",
    description: "A list with one bullet per line.",
    bbcode: "[list]\n[*]First item\n[*]Second item\n[/list]",
  },
  {
    id: "numbered-list",
    label: "Numbered list",
    description: "A list that numbers its own items.",
    bbcode: "[list=1]\n[*]First step\n[*]Second step\n[/list]",
  },
  {
    id: "spoiler",
    label: "Collapsible section",
    description: "A spoiler with its own title.",
    bbcode: "[spoiler=Title]\n\n[/spoiler]",
  },
  {
    id: "ooc",
    label: "OOC note",
    description: "An out-of-character aside.",
    bbcode: "[ooc]Out of character note[/ooc]",
  },
  {
    id: "spacer",
    label: "Spacer",
    description: "A blank line that only takes up space.",
    bbcode: "[color=transparent]spacer[/color]",
  },
  {
    id: "signature",
    label: "Signature block",
    description: "Signature image, name and rank from the Staff Page.",
    bbcode:
      "[divbox=white]\n[img]{{staff.signature}}[/img]\n[i]{{staff.name}}[/i]\n{{staff.rank}}\n[b]Los Santos Emergency Medical Services[/b]\n[/divbox]",
  },
  {
    id: "footer",
    label: "LSEMS footer",
    description: "The LSEMS footer image.",
    bbcode: "[lsemsfooter][/lsemsfooter]",
  },
  {
    id: "code",
    label: "Code block",
    description: "Text kept as code, so BBCode inside it is shown as written.",
    bbcode: "[code]\n\n[/code]",
  },
];
