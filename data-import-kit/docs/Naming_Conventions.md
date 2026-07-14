# Naming Conventions

## Slugs (URL names)
- Lowercase English letters, numbers and single dashes only: `new-cairo`, `palm-hills`, `badya`.
- No spaces, Arabic, accents, `_`, or trailing/leading dashes. Pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- A slug is **unique** within its sheet and is permanent (changing it breaks links & SEO).

## Dates & numbers
- Dates: `YYYY-MM-DD` (e.g. `2030-06-30`).
- Numbers: digits and a dot only — **no** thousands commas, no `EGP`, no `m²` (`6450000`, `172.5`).
- Percentages: the number only (`10` means 10%).
- Yes/No fields: exactly `Yes` or `No`.

## Multi-value cells
- Where a field holds several values (e.g. `gallery_images`, `highlights_en`), separate them
  with a **pipe** `|`:  `projects/badya/g1.jpg | projects/badya/g2.jpg`.

## Images & files
- Sheets store a **path**, never a pasted picture. Paths are relative to the `assets/` root.
- File names: lowercase, dashes, no spaces:  `hero.jpg`, `master-plan.jpg`, `type-a.jpg`.
- Recommended: JPG/WebP for photos, PNG for logos/plans, PDF for brochures.
- Recommended sizes: hero/cover ≥ 1600px wide; logos on transparent PNG; plans ≥ 2000px.

## Arabic text
- Type Arabic normally in the `*_ar` columns; it is stored as-is (UTF-8).
- Keep numbers and IDs in **English/Latin digits** even inside Arabic sentences.
- Only display logos/photos you are licensed to use.
