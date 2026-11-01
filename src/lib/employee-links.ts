export function toPersonnelFileEditUrl(
  personnelFileUrl: string | undefined,
): string | undefined {
  if (!personnelFileUrl) return undefined;
  try {
    const source = new URL(personnelFileUrl);
    if (
      source.hostname !== "gov.eclipse-rp.net" ||
      source.pathname !== "/viewtopic.php"
    ) {
      return undefined;
    }

    const queryPostId = source.searchParams.get("p");
    const hashPostId = source.hash.match(/^#p(\d+)$/)?.[1];
    const postId =
      queryPostId && /^\d+$/.test(queryPostId) ? queryPostId : hashPostId;
    if (!postId) return undefined;

    const editUrl = new URL("https://gov.eclipse-rp.net/posting.php");
    editUrl.searchParams.set("mode", "edit");
    editUrl.searchParams.set("p", postId);
    return editUrl.toString();
  } catch {
    return undefined;
  }
}
