/** Client-side image downscale + re-encode before upload. */

export const MAX_EDGE = 1920;
export const QUALITY = 0.85;
export const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25MB

export type ProcessedImage = {
  blob: Blob;
  width: number;
  height: number;
  ext: string;
  mime: string;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be read. Try a JPG, PNG or WebP."));
    };
    img.src = url;
  });
}

export async function processImage(file: File): Promise<ProcessedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn’t an image. Please choose a JPG, PNG or WebP photo.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(
      `That photo is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is 25MB. Please pick a smaller one.`,
    );
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn’t process this image. Try another browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Prefer WebP where supported, fall back to JPEG.
  const preferWebp = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  const mime = preferWebp ? "image/webp" : "image/jpeg";
  const ext = preferWebp ? "webp" : "jpg";

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mime, QUALITY));
  if (!blob) throw new Error("Could not encode that image. Please try a different photo.");

  return { blob, width, height, ext, mime };
}
