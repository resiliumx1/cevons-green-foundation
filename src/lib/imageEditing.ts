import { createContext, useContext } from "react";

/**
 * Tiny standalone context so `useSiteImage` can tell whether it is rendering
 * inside a verified staff preview session WITHOUT importing the content
 * editor (which would create an import cycle: siteImages → Editable →
 * ContentEditorOverlay → siteImages).
 *
 * `ContentProvider` is the only writer.
 */
export type ImageEditState = {
  preview: boolean;
  canPublish: boolean;
};

export const IMAGE_EDIT_OFF: ImageEditState = { preview: false, canPublish: false };

export const ImageEditContext = createContext<ImageEditState>(IMAGE_EDIT_OFF);

export function useImageEditing(): ImageEditState {
  return useContext(ImageEditContext);
}
