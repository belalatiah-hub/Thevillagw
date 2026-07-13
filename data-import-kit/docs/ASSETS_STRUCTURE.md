# Asset Folder Structure

All images and files referenced by the sheets live under a single `assets/` root.
The **path you type in a sheet is the path inside `assets/`.**

```
assets/
├── areas/
│   └── <area-slug>/
│       └── hero.jpg
├── developers/
│   └── <developer-slug>/
│       ├── logo.png
│       └── cover.jpg
└── projects/
    └── <project-slug>/
        ├── hero.jpg
        ├── master-plan.jpg
        ├── brochure.pdf
        ├── gallery/
        │   ├── g1.jpg
        │   └── g2.jpg
        ├── types/
        │   └── type-a.jpg
        └── units/
            └── unit-000001.jpg
```

### Examples (sheet value → file on disk)
| Sheet & field | Value typed | File expected |
|---|---|---|
| Areas · hero_image | `areas/new-cairo/hero.jpg` | `assets/areas/new-cairo/hero.jpg` |
| Developers · logo_image | `developers/palm-hills/logo.png` | `assets/developers/palm-hills/logo.png` |
| Projects · gallery_images | `projects/badya/gallery/g1.jpg | .../g2.jpg` | two files under `assets/projects/badya/gallery/` |
| Units · floor_plan_image | `projects/badya/units/unit-000001.jpg` | `assets/projects/badya/units/unit-000001.jpg` |

### Rules
- Folder names use the entity **slug** (so they stay stable and readable).
- One folder per project keeps thousands of units tidy and fast to sync.
- Never move/rename an asset without updating the sheet value (or you get a broken link).
