# Deliverables Checklist

Everything requested in the brief, and where to find it.

## The 8 Excel templates
| # | File | Columns | Dropdowns | Examples | Bilingual | SEO | Images | Status |
|---|------|:------:|:---------:|:--------:|:---------:|:---:|:------:|:------:|
| 1 | `templates-xlsx/01_Areas.xlsx` | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| 2 | `templates-xlsx/02_Developers.xlsx` | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| 3 | `templates-xlsx/03_Projects.xlsx` | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| 4 | `templates-xlsx/04_Unit_Types.xlsx` | ✔ | ✔ | ✔ | ✔ | – | ✔ | ✔ |
| 5 | `templates-xlsx/05_Units.xlsx` | ✔ | ✔ | ✔ | – | – | ✔ | ✔ |
| 6 | `templates-xlsx/06_Project_Amenities.xlsx` | ✔ | ✔ | ✔ | ✔ | – | – | – |
| 7 | `templates-xlsx/07_Payment_Plans.xlsx` | ✔ | ✔ | ✔ | ✔ | – | – | ✔ |
| 8 | `templates-xlsx/08_Developers_Projects_Mapping.xlsx` | ✔ | ✔ | ✔ | ✔ | – | – | – |
| ★ | `templates-xlsx/00_MASTER_Read-me_and_Lookups.xlsx` | Read-Me · Lookups · All-Fields index |

Every template has 3 tabs — **Template** (data entry) · **Example (filled)** (locked sample) ·
**Field Guide** (locked per-field reference) — plus a hidden, protected list source that powers the
drop-downs, colour-coded headers, `*` required markers, and a help note on every column.

## The 18 supporting deliverables
| # | Deliverable | Location |
|---|-------------|----------|
| 1 | Professionally designed XLSX (colour headers, validation, samples, locked reference tabs) | `templates-xlsx/` |
| 2 | README (PDF) | `docs/README.pdf` |
| 3 | Data Dictionary (PDF, EN+AR) | `docs/Data Dictionary.pdf` |
| 4 | ER Diagram | `docs/ER_Diagram.png` · `.svg` · `.mmd` |
| 5 | SQL schema (PostgreSQL) | `schema/schema.sql` |
| 6 | JSON Schema | `schema/schema.json` |
| 7 | CSV versions of every sheet | `templates-csv/*.csv` |
| 8 | Import validation rules | `schema/validation_rules.json` + README §"How your data is checked" |
| 9 | Import error-report format | `templates-csv/_import_error_report_TEMPLATE.csv` + README |
| 10 | Unique-ID generation strategy | `docs/ID_Strategy.md` + README |
| 11 | Naming conventions | `docs/Naming_Conventions.md` |
| 12 | Folder structure for assets | `docs/ASSETS_STRUCTURE.md` + `assets-structure/` |
| 13 | Scalable to 100,000+ units | ID padding + DB indexes; see README §"Built to scale" |
| 14 | Connecting IDs between sheets (FKs) | every sheet + ER diagram + `schema.sql` |
| 15 | Required vs optional fields | `*` markers + Field Guide + Data Dictionary |
| 16 | Bilingual EN/AR throughout | labels, lookups, PDFs |
| 17 | SEO fields (slug, meta title/description) | Areas, Developers, Projects sheets |
| 18 | Status + availability fields | Areas/Developers/Projects/Units/Types/Plans |

## Import order (parents first)
`areas → developers → projects → unit_types → payment_plans → units → project_amenities → developer_project_map`
