import { toast } from "react-toastify";
import {
  forumPostToast,
  handOffForumPost,
  type ForumPost,
} from "@/app/helpers/forumHandoff";

type CopyBBCodeAndOpenType = {
  bbCodeText: string;
  url: string;
  /**
   * Title, target and any extra details the browser extension needs to fill the
   * post. Its own `url` wins over the one being opened: a button can open a
   * listing while the post belongs on the topic the member filled in.
   */
  post?: ForumPost;
};

export const copyBBCodeAndOpen = async ({
  bbCodeText,
  url,
  post,
}: CopyBBCodeAndOpenType) => {
  if (!bbCodeText) {
    toast.error("Invalid BBCode, try filling all the fields");
    return;
  }
  // Open before the await: a click's permission to open a tab does not survive
  // the clipboard write on every browser, and opening the page is the point of
  // this button. The handoff below lands milliseconds later, well before the new
  // tab's content script reads it.
  window.open(url, "_blank");
  try {
    await navigator.clipboard.writeText(bbCodeText);
    // The post's own target wins: a button can open a listing while the post
    // itself belongs on the topic the member filled in.
    const handedOff = handOffForumPost(
      { ...post, url: post?.url ?? url },
      bbCodeText,
    );
    toast.success(forumPostToast(handedOff, "BBCode copied to clipboard!"));
  } catch {
    toast.error("Failed to copy!");
  }
};
