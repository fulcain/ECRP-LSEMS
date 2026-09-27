import { toast } from "react-toastify";
import {
  forumPostToast,
  handOffAndOpenForumPost,
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
  // Both calls go before the first await: a click's permission to open a tab
  // does not survive the clipboard write on every browser. The post's own target
  // wins - a button can open a listing while the post belongs on the topic the
  // member filled in.
  const handedOff = handOffAndOpenForumPost(
    { ...post, url: post?.url ?? url },
    bbCodeText,
  );
  window.open(url, "_blank");
  try {
    await navigator.clipboard.writeText(bbCodeText);
    toast.success(forumPostToast(handedOff, "BBCode copied to clipboard!", true));
  } catch {
    toast.error("Failed to copy!");
  }
};
