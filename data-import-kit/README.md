# The Village Investment — Real-Estate Data Import Kit

**Version 1.0 · 2026-07-13**

A complete, staff-friendly system for collecting every piece of real-estate data
behind the website — normalised into **8 connected entities** and delivered as
professional Excel templates plus a full technical spec (SQL, JSON Schema,
validation rules, ER diagram and PDFs). Built on primary-sale Egyptian-market
practice (à la Nawy / Property Finder / Bayut) — original schema, no copied data.

> **Start here:** open `templates-xlsx/00_MASTER_Read-me_and_Lookups.xlsx`, read the
> *Read Me* tab, then fill sheets **01 → 08 in order**. Full walkthrough in
> `docs/README.pdf`.

## Folder map
```
data-import-kit/
├── README.md                     ← this file
├── DELIVERABLES.md               ← checklist of everything included
├── templates-xlsx/               ← the 8 Excel templates (+ master)
│   ├── 00_MASTER_Read-me_and_Lookups.xlsx
│   ├── 01_Areas.xlsx   02_Developers.xlsx   03_Projects.xlsx
│   ├── 04_Unit_Types.xlsx   05_Units.xlsx   06_Project_Amenities.xlsx
│   └── 07_Payment_Plans.xlsx   08_Developers_Projects_Mapping.xlsx
├── templates-csv/                ← CSV twin of every sheet (+ examples, + error-report template)
├── schema/
│   ├── schema.sql                ← PostgreSQL tables (keys, links, checks, indexes)
│   ├── schema.json               ← JSON Schema (per entity) for programmatic validation
│   └── validation_rules.json     ← machine-readable import rules + error codes
├── docs/
│   ├── README.pdf                ← the human guide (EN + AR)
│   ├── Data Dictionary.pdf       ← every field of every sheet, explained (EN + AR)
│   ├── ER_Diagram.(png|svg|mmd)  ← the data model, visually
│   ├── ID_Strategy.md            ← unique-ID generation strategy
│   ├── Naming_Conventions.md     ← slugs, dates, numbers, images
│   └── ASSETS_STRUCTURE.md       ← where image/PDF files live
└── assets-structure/             ← ready-made asset folders (drop your files in)
```

## The 8 entities
| # | Sheet | Purpose | Links to |
|---|-------|---------|----------|
| 1 | Areas | Geographic zones | — |
| 2 | Developers | Development companies | — |
| 3 | Projects | Master developments (primary sale) | Developers, Areas |
| 4 | Unit Types | Repeatable unit models in a project | Projects |
| 5 | Units | Individual sellable units (inventory) | Projects, Unit Types, Payment Plans |
| 6 | Project Amenities | One row per amenity a project offers | Projects |
| 7 | Payment Plans | Down-payment + tenor structures | Projects |
| 8 | Developers & Projects Mapping | Joint-venture / co-developer links | Developers, Projects |

## Every requirement, covered
Bilingual EN/AR · required vs optional fields · drop-down validation · connecting IDs ·
SEO fields (slug, meta title/description) · image/asset path fields · status fields ·
worked examples on every sheet · unique-ID strategy · naming conventions · asset folder
structure · import validation rules + error-report format · **scalable to 100,000+ units.**

*Prices and commercial figures in the examples are illustrative and must be confirmed with
the developer/advisor. The Village markets primary sale only.*
