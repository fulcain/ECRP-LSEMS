import { toast } from "react-toastify";

type CopyBBCodeAndOpenType = {
  bbCodeText: string;
  url: string;
};

export const copyBBCodeAndOpen = async ({
  bbCodeText,
  url,
}: CopyBBCodeAndOpenType) => {
  if (!bbCodeText) {
    toast.error("Invalid BBCode, try filling all the fields");
    return;
  }
  try {
    await navigator.clipboard.writeText(bbCodeText);
    toast.success("BBCode copied to clipboard!");
    window.open(url, "_blank");
  } catch {
    toast.error("Failed to copy!");
  }
};
