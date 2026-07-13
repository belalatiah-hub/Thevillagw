# Unique-ID Generation Strategy

Every entity has a **stable, human-readable primary key** with a fixed prefix.

| Entity | Prefix | Format | Example | Capacity |
|---|---|---|---|---|
| Areas | `AREA` | `AREA-0000` | `AREA-0001` | 10,000+ |
| Developers | `DEV` | `DEV-0000` | `DEV-0001` | 10,000+ |
| Projects | `PRJ` | `PRJ-00000` | `PRJ-00001` | 100,000+ |
| Unit Types | `UTYP` | `UTYP-0000` | `UTYP-0001` | 10,000+ |
| Units | `UNIT` | `UNIT-000000` | `UNIT-000001` | 1,000,000+ |
| Project Amenities | `PAMN` | `PAMN-000000` | `PAMN-000001` | 1,000,000+ |
| Payment Plans | `PLAN` | `PLAN-0000` | `PLAN-0001` | 10,000+ |
| Developers & Projects Mapping | `DPM` | `DPM-00000` | `DPM-00001` | 1,000,000+ |

## Rules
1. **Leave the ID blank** in the template and the importer generates the next free code
   (`prefix + zero-padded number`, taking `MAX(existing)+1` per prefix). This is the safest option for staff.
2. If you *do* type an ID, keep the exact format and **never reuse or recycle** a code — even
   after a row is archived. IDs are permanent.
3. IDs are **globally unique within their entity** and are the values other sheets point to
   (e.g. a Unit's `project_id` must equal a real Project's `project_id`).
4. Padding widths are deliberately generous so the scheme scales to **100,000+ units** and
   **1,000,000+ inventory rows** without ever changing format.
5. IDs are **case-insensitive on import** but stored upper-case (`prj-1` → `PRJ-00001`... the
   importer normalises, but staff should type upper-case to avoid confusion).

## How the importer assigns IDs (pseudocode)
```
for each row without an id:
    n = max(numeric part of existing ids with this prefix) + 1
    id = prefix + "-" + zero_pad(n, width)
```
