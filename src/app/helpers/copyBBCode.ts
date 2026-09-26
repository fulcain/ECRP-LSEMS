import { toast } from "react-toastify";
import {
  forumPostToast,
  handOffForumPost,
  type ForumPost,
} from "@/app/helpers/forumHandoff";

type CopyBBCodeType = {
  bbCodeText: string;
  /**
   * Pass this when the text is a post for GOV: the browser extension fills the
   * posting page with it, and the toast says so. Copying a signature or a link
   * leaves it out, so it can never be posted by accident.
   */
  post?: ForumPost;
};

export const copyBBCode = async ({ bbCodeText, post }: CopyBBCodeType) => {
  if (!bbCodeText) {
    toast.error("Invalid BBCode, try filling all the fields");
    return;
  }
  try {
    await navigator.clipboard.writeText(bbCodeText);
    const handedOff = post ? handOffForumPost(post, bbCodeText) : false;
    toast.success(forumPostToast(handedOff, "BBCode copied to clipboard!"));
  } catch {
    toast.error("Failed to copy!");
  }
};
