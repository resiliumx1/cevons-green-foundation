/**
 * Client-side image downscale + re-encode before upload.
 *
 * Goals, in order:
 *   1. Keep the photo looking good — high-quality resampling, EXIF orientation
 *      respected, no upscaling of small photos.
 *   2. Make it small enough to upload quickly and render reliably (long edge
 *      capped, modern codec, adaptive quality against a byte budget).
 *   3. Never make things worse — if the re-encode is bigger than the original
 *      and no resize was needed, the original file is kept as-is.
 */

export const MAX_EDGE = 2048;
export const QUALITY = 0.86;
/** Quality floor when trimming down to the byte budget. */
export const MIN_QUALITY = 0.62;
/** Aim for uploads under this size; quality steps down until we get there. */
export const TARGET_BYTES = 900 * 1024;
export const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25MB

export type ProcessedImage = {
  blob: Blob;
  width: number;
  height: number;
  ext: string;
  mime: string;
  /** Size of the file the user picked, in bytes. */
  originalBytes: number;
  /** True when the original file was uploaded untouched. */
  passthrough: boolean;
};

type Source = {
  draw: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

async function loadSource(file: File): Promise<Source> {
  // createImageBitmap applies EXIF orientation and decodes off the main thread.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { draw: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      /* fall through to <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({
        draw: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be read. Try a JPG, PNG or WebP."));
    };
    img.src = url;
  });
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn’t process this image. Try another browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/**
 * Halving steps before the final draw. Browsers resample poorly in one big
 * jump; stepping down keeps fine detail (text on bins, logos) crisp.
 */
function resample(src: Source, width: number, height: number): HTMLCanvasElement {
  let curW = src.width;
  let curH = src.height;
  let current: CanvasImageSource = src.draw;

  while (curW / 2 >= width && curH / 2 >= height && curW > 2 && curH > 2) {
    const nextW = Math.max(width, Math.round(curW / 2));
    const nextH = Math.max(height, Math.round(curH / 2));
    const step = makeCanvas(nextW, nextH);
    step.ctx.drawImage(current, 0, 0, nextW, nextH);
    current = step.canvas;
    curW = nextW;
    curH = nextH;
  }

  const out = makeCanvas(width, height);
  out.ctx.drawImage(current, 0, 0, width, height);
  return out.canvas;
}

function encode(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((res) => canvas.toBlob(res, mime, quality));
}

function supportsWebp(canvas: HTMLCanvasElement) {
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
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

  // Animated GIFs would lose their animation on a canvas round-trip; SVG is
  // already tiny and lossless. Leave both alone.
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return {
      blob: file,
      width: 0,
      height: 0,
      ext: file.type === "image/gif" ? "gif" : "svg",
      mime: file.type,
      originalBytes: file.size,
      passthrough: true,
    };
  }

  const src = await loadSource(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(src.width, src.height));
    const width = Math.max(1, Math.round(src.width * scale));
    const height = Math.max(1, Math.round(src.height * scale));
    const resized = scale < 1;

    const canvas = resample(src, width, height);
    const webp = supportsWebp(canvas);
    const mime = webp ? "image/webp" : "image/jpeg";
    const ext = webp ? "webp" : "jpg";

    let quality = QUALITY;
    let blob = await encode(canvas, mime, quality);
    // Step quality down only while we are over the budget — visually lossless
    // photos stay at full quality.
    while (blob && blob.size > TARGET_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.08);
      blob = await encode(canvas, mime, quality);
    }
    if (!blob) throw new Error("Could not encode that image. Please try a different photo.");

    // Re-encoding a small, already-efficient photo can inflate it. Keep the
    // original in that case.
    if (!resized && blob.size >= file.size) {
      return {
        blob: file,
        width,
        height,
        ext: (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg",
        mime: file.type,
        originalBytes: file.size,
        passthrough: true,
      };
    }

    return { blob, width, height, ext, mime, originalBytes: file.size, passthrough: false };
  } finally {
    src.close();
  }
}

/** "4.2 MB → 780 KB" style summary for the editor UI. */
export function compressionSummary(p: ProcessedImage): string | null {
  if (p.passthrough || p.blob.size >= p.originalBytes) return null;
  const fmt = (b: number) => (b >= 1024 * 1024 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
  const saved = Math.round((1 - p.blob.size / p.originalBytes) * 100);
  return `${fmt(p.originalBytes)} → ${fmt(p.blob.size)} (${saved}% smaller)`;
}
