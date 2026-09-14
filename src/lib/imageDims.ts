/**
 * Measured natural dimensions of static public/ images used on the homepage.
 *
 * Rendering <img> with explicit width/height lets the browser reserve the
 * right box before the bytes arrive, which removes layout shift (CLS) and
 * helps the LCP pass. Values here are the MEASURED file dimensions — never
 * guessed — so the intrinsic aspect ratio stays truthful.
 */
export const IMAGE_DIMS: Record<string, readonly [number, number]> = {
  // Partner logos
  "/partners/saipem.webp": [300, 300],
  "/partners/ramps-logistics.webp": [300, 300],
  "/partners/gysbi.webp": [300, 300],
  "/partners/baker-hughes.webp": [300, 300],
  "/partners/edison-chouest-offshore.webp": [300, 300],
  "/partners/g-mining.webp": [600, 600],
  "/partners/halliburton.jpg": [800, 59],
  "/partners/agm-inc.jpg": [121, 122],
  "/partners/gtt.jpg": [484, 488],
  "/partners/british-high-commission.jpg": [121, 121],
  "/partners/us-embassy.jpg": [121, 121],
  "/partners/united-nations.jpg": [121, 122],
  "/partners/caricom.jpg": [800, 780],
  "/partners/pegasus-hotel-guyana.jpg": [121, 122],
  "/partners/marriott.jpg": [121, 122],
  "/partners/kfc.jpg": [121, 122],
  "/partners/churchs-chicken.jpg": [121, 122],

  // Certification logos
  "/certifications/epa.webp": [857, 857],
  "/certifications/gcci.webp": [406, 420],
  "/certifications/iso.webp": [612, 612],
  "/certifications/psc.webp": [190, 265],

  // Social proof
  "/assets/social-proof/gcci-logo.webp": [800, 400],
  "/assets/social-proof/psc-logo.webp": [190, 265],
  "/assets/social-proof/suriname-guyana-chamber.webp": [600, 600],
  "/assets/social-proof/epa-logo.webp": [800, 400],
  "/assets/social-proof/iso-logo.webp": [800, 400],
  "/assets/social-proof/market-leader-trophy.webp": [800, 400],

  // Service tiles
  "/services/svc-residential.webp": [2048, 2048],
  "/services/svc-commercial.webp": [1024, 1024],
  "/services/svc-industrial.webp": [1024, 1024],
  "/services/svc-recycling.webp": [1024, 1024],

  // Brand
  "/assets/brand/cevons-logo-correct.webp": [100, 73],
};

/** Spreadable width/height props for a known static image (empty when unknown). */
export function imgDims(src: string): { width?: number; height?: number } {
  const d = IMAGE_DIMS[src];
  return d ? { width: d[0], height: d[1] } : {};
}
