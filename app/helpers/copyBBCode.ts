import { toast } from "react-toastify";

type CopyBBCodeType = {
  bbCodeText: string;
};

export const copyBBCode = async ({ bbCodeText }: CopyBBCodeType) => {
  if (!bbCodeText) {
    toast.error("Invalid BBCode, try filling all the fields");
    return;
  }
  try {
    await navigator.clipboard.writeText(bbCodeText);
    toast.success("BBCode copied to clipboard!");
  } catch {
    toast.error("Failed to copy!");
  }
};
