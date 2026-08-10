import { useEffect, useState } from "react";
import { getMediaUrl } from "@/lib/mediaUrl";

/** Resolves a `media` storage path to a displayable URL (signed, cached). */
export function useMediaSrc(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setUrl(null);
    if (!path) return;
    void getMediaUrl(path).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [path]);
  return url;
}
