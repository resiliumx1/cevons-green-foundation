import type { ImgHTMLAttributes } from "react";
import { useSiteImage } from "@/lib/siteImages";

/**
 * A photo that staff can swap from the on-page editor.
 *
 * It behaves exactly like a plain <img>: the caller keeps owning the box
 * (className, width, height, loading), and the component only decides WHICH
 * picture goes inside it. With no override in `site_images` it renders the
 * `src`/`alt` passed in, so the public site is byte-identical to before.
 */
export function SlotImage({
  slot,
  src,
  alt,
  ...rest
}: { slot: string; src: string; alt: string } & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
>) {
  const img = useSiteImage(slot, src, alt);
  return <img src={img.src} alt={img.alt} {...img.editorProps} {...rest} />;
}
