## Photo placements

Three uploaded photos get wired in. All CEVONS branding in the photos stays visible (no crop/overlay over logos).

### 1. Careers hero — front‑office training photo
- File: `src/routes/careers.tsx`, hero `<img src={heroCareers}>`.
- Replace `src/assets/hero-careers-crew.jpg` import with a new Lovable asset created from `user-uploads://front-office-training-1600.webp`.
- Use `object-position: 70% 30%` so the two smiling staff sit on the right, leaving the left column clear for the headline and CTAs. Keep the existing left‑weighted scrim, orange glow, `heroDrift` animation, and all copy untouched.
- Alt: "CEVONS front‑office team training at the customer service desk."

### 2. Residential — orange wheelie bin at the driveway
Used in two places:

a. **Homepage "Core services" pillar card** (`src/components/home/ServicesCardsSection.tsx`, the `residential` entry, currently `img: "/services/svc-residential.webp"`).
- Replace the string path with an imported Lovable asset created from `user-uploads://residential-wheelie-bin-1448.webp`.
- The CEVONS logo printed on the bin remains fully visible — no overlay changes.

b. **General Trash Collection page** (`src/routes/services.general-trash-collection.tsx`) — first right‑side image in the `split-right` section ("Waste solutions tailored to you"), currently `/services/detail/residential-collection-3.webp`.
- Replace that single `images[0].src` with the same wheelie‑bin asset URL.
- Update alt to: "Branded CEVONS wheelie bin set out at a Guyana residential driveway."
- Leave the four gallery photos in the second detail section untouched.

### 3. Portable Toilet page — truck carrying tanker + red portable toilet
- `src/routes/services.portable-toilet.tsx`, first right‑side image in the `split-right` section ("Portable toilets that were built to an international specification"), currently `/services/detail/toilet-servicing-1.webp`.
- Replace with a new Lovable asset created from `user-uploads://image-44.png`.
- Alt: "CEVONS service truck transporting a sealed vacuum tank and red portable toilet unit."
- No changes to hero, headings, copy, or other detail sections.

## Technical details

- Create three asset pointers via `lovable-assets create --file /mnt/user-uploads/<name> --filename <name> > src/assets/<name>.asset.json`, then `import x from "@/assets/<name>.asset.json"` and use `x.url`.
- No changes to layouts, section structure, tokens, animations, or CRM. No copy edits beyond the three alt strings above.
- Verify: typecheck, load `/careers`, `/`, `/services/general-trash-collection`, `/services/portable-toilet`; confirm images render at natural aspect with no layout shift and the wheelie‑bin's CEVONS logo is fully visible in both placements.
