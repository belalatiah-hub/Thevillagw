# -*- coding: utf-8 -*-
"""Markdown guides, the assets folder skeleton, and the two branded PDFs
(README.pdf + Data Dictionary.pdf) with proper Arabic shaping."""
import os
import kit_schema as S
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, Image, HRFlowable, KeepTogether)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data-import-kit"))
def p(*a): return os.path.join(OUT, *a)
for d in ["docs", "assets-structure"]:
    os.makedirs(p(d), exist_ok=True)

# ---- fonts (DejaVu covers Latin + Arabic) ----------------------------------
DEJA = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
DEJAB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
pdfmetrics.registerFont(TTFont("DV", DEJA))
pdfmetrics.registerFont(TTFont("DVB", DEJAB))

TEAL = colors.HexColor("#073D52"); TEAL2 = colors.HexColor("#115F7D")
BONE = colors.HexColor("#F3EFE6"); BONE2 = colors.HexColor("#FBF9F4")
INK = colors.HexColor("#1B2B31"); GREEN = colors.HexColor("#0E5A3C")
AMBER = colors.HexColor("#FFF3D6"); LINE = colors.HexColor("#DDE5E4")
GREY = colors.HexColor("#6B7A80")

def ar(t):
    """Shape + bidi-order Arabic so it renders correctly in the PDF."""
    if not t:
        return t
    return get_display(arabic_reshaper.reshape(t))

# ---------------------------------------------------------------------------
# 1) MARKDOWN GUIDES
# ---------------------------------------------------------------------------
ID_STRATEGY = f"""# Unique-ID Generation Strategy

Every entity has a **stable, human-readable primary key** with a fixed prefix.

| Entity | Prefix | Format | Example | Capacity |
|---|---|---|---|---|
""" + "\n".join(
    f'| {e["title_en"]} | `{e["id_prefix"]}` | `{e["id_prefix"]}-'
    + ("0"*(4 if e["id_prefix"] in ("AREA","DEV","UTYP","PLAN") else (5 if e["id_prefix"] in ("PRJ","DPM") else 6)))
    + f'` | `{e["fields"][0]["example"]}` | '
    + ("10,000+" if e["id_prefix"] in ("AREA","DEV","UTYP","PLAN") else ("100,000+" if e["id_prefix"]=="PRJ" else "1,000,000+"))
    + " |"
    for e in S.ENTITIES) + f"""

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
"""

NAMING = """# Naming Conventions

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
"""

ASSETS_STRUCT = """# Asset Folder Structure

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
"""

def write_markdown():
    open(p("docs", "ID_Strategy.md"), "w", encoding="utf-8").write(ID_STRATEGY)
    open(p("docs", "Naming_Conventions.md"), "w", encoding="utf-8").write(NAMING)
    open(p("docs", "ASSETS_STRUCTURE.md"), "w", encoding="utf-8").write(ASSETS_STRUCT)

def write_assets_skeleton():
    tree = [
        "assets/areas/new-cairo", "assets/areas/north-coast",
        "assets/developers/palm-hills", "assets/developers/mountain-view",
        "assets/projects/badya/gallery", "assets/projects/badya/types", "assets/projects/badya/units",
        "assets/projects/kingsway/gallery", "assets/projects/kingsway/types", "assets/projects/kingsway/units",
    ]
    for t in tree:
        d = p("assets-structure", t)
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, ".gitkeep"), "w").write("")
    open(p("assets-structure", "README.txt"), "w", encoding="utf-8").write(
        "Drop the real image/PDF files into these folders using the slug of each "
        "area/developer/project. The path you type in a sheet is the path inside 'assets/'.\n"
        "See docs/ASSETS_STRUCTURE.md for the full rules.\n")

# ---------------------------------------------------------------------------
# 2) PDF STYLES
# ---------------------------------------------------------------------------
ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontName="DVB", fontSize=20, textColor=TEAL, spaceAfter=6, leading=24)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontName="DVB", fontSize=13.5, textColor=GREEN, spaceBefore=12, spaceAfter=5, leading=17)
H3 = ParagraphStyle("H3", parent=ss["Heading3"], fontName="DVB", fontSize=11.5, textColor=TEAL2, spaceBefore=8, spaceAfter=3)
BODY = ParagraphStyle("BODY", parent=ss["BodyText"], fontName="DV", fontSize=9.6, textColor=INK, leading=14, spaceAfter=4)
SMALL = ParagraphStyle("SMALL", parent=BODY, fontSize=8.2, textColor=GREY, leading=11)
CELL = ParagraphStyle("CELL", parent=BODY, fontSize=7.8, leading=10, spaceAfter=0)
CELLB = ParagraphStyle("CELLB", parent=CELL, fontName="DVB")
CELLH = ParagraphStyle("CELLH", parent=CELL, fontName="DVB", textColor=colors.white)
LEAD = ParagraphStyle("LEAD", parent=BODY, fontSize=10.5, leading=15, textColor=INK)

def bullet(txt, style=BODY):
    return Paragraph("• " + txt, style)

def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("DV", 7.5); canvas.setFillColor(GREY)
    canvas.drawString(20*mm, 12*mm, f'The Village Investment · Data Import Kit v{S.BRAND["version"]}')
    canvas.drawRightString(A4[0]-20*mm, 12*mm, f'Page {doc.page}')
    canvas.setStrokeColor(LINE); canvas.line(20*mm, 15*mm, A4[0]-20*mm, 15*mm)
    canvas.restoreState()

def brand_header(story, title, subtitle):
    story.append(Paragraph(S.BRAND["name"].upper(), ParagraphStyle("brand", fontName="DVB", fontSize=10, textColor=TEAL2)))
    story.append(HRFlowable(width="100%", thickness=2, color=TEAL, spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(title, H1))
    story.append(Paragraph(subtitle, SMALL))
    story.append(Spacer(1, 8))

# ---------------------------------------------------------------------------
# 3) README.pdf
# ---------------------------------------------------------------------------
def build_readme_pdf():
    fn = p("docs", "README.pdf")
    doc = SimpleDocTemplate(fn, pagesize=A4, topMargin=18*mm, bottomMargin=20*mm,
                            leftMargin=20*mm, rightMargin=20*mm,
                            title="The Village — Data Import Kit — README", author=S.BRAND["name"])
    st = []
    brand_header(st, "Real-Estate Data Import Kit — Guide",
                 f'Version {S.BRAND["version"]} · {S.BRAND["date"]} · {S.BRAND["site"]}')
    st.append(Paragraph("A set of 8 connected spreadsheets your team fills in to describe every "
        "area, developer, project, unit type, unit, amenity and payment plan. Fill the sheets, "
        "hand them back, and they import cleanly into the database that powers the website. "
        "This guide explains how to use them. No technical background needed.", LEAD))
    st.append(Spacer(1, 6))
    st.append(Paragraph("Arabic — عربي", H3))
    st.append(Paragraph(ar("مجموعة من 8 جداول مترابطة يملؤها فريقك لوصف كل منطقة ومطوّر ومشروع "
        "ونوع وحدة ووحدة ومرفق ونظام سداد. املأ الجداول ثم أعدها، وسيتم استيرادها بسهولة إلى قاعدة "
        "البيانات التي تُشغّل الموقع. هذا الدليل يشرح طريقة الاستخدام — بدون أي خبرة تقنية."),
        ParagraphStyle("arbody", parent=BODY, alignment=TA_LEFT)))
    st.append(Spacer(1, 6))

    st.append(Paragraph("What's in the box", H2))
    box = [["File / folder", "What it is"]]
    rows = [
        ("templates-xlsx/00_MASTER…", "Read-Me + all drop-down lists + a full field index (start here)."),
        ("templates-xlsx/01…08…", "One Excel file per entity — the sheets your team fills in."),
        ("templates-csv/", "Plain-CSV twins of every sheet (for direct/bulk import)."),
        ("schema/schema.sql", "Database tables (PostgreSQL) with keys, links and checks."),
        ("schema/schema.json", "JSON-Schema for programmatic validation."),
        ("schema/validation_rules.json", "Machine-readable rules the importer enforces."),
        ("docs/Data Dictionary.pdf", "Every field of every sheet, explained (EN + AR)."),
        ("docs/ER_Diagram.(png/svg/mmd)", "Picture of how the 8 entities connect."),
        ("docs/ID_Strategy / Naming / ASSETS", "How IDs, names and image folders work."),
        ("assets-structure/", "Ready-made folders to drop your images/brochures into."),
    ]
    for a, b in rows:
        box.append([Paragraph(a, CELLB), Paragraph(b, CELL)])
    t = Table(box, colWidths=[58*mm, 104*mm])
    t.setStyle(_tbl_style(len(box)))
    st.append(t)

    st.append(Paragraph("Fill the sheets in this order", H2))
    st.append(Paragraph("Always enter a “parent” before the rows that point to it — a Project needs "
                        "its Developer and Area to exist first.", BODY))
    order = [["#", "Sheet", "Depends on", "One line"]]
    dep = {"areas": "—", "developers": "—", "projects": "Developers, Areas",
           "unit_types": "Projects", "units": "Projects (+ Unit Types, Plans)",
           "project_amenities": "Projects", "payment_plans": "Projects",
           "developer_project_map": "Developers, Projects"}
    for e in S.ENTITIES:
        order.append([str(e["num"]), Paragraph(e["title_en"], CELLB),
                      Paragraph(dep[e["key"]], CELL), Paragraph(e["desc_en"], CELL)])
    t = Table(order, colWidths=[8*mm, 40*mm, 44*mm, 70*mm]); t.setStyle(_tbl_style(len(order)))
    st.append(t)

    st.append(PageBreak())
    st.append(Paragraph("The 10 golden rules", H2))
    rules = [
        "Each Excel file has 3 tabs: <b>Template</b> (type here) · <b>Example (filled)</b> (a sample) · <b>Field Guide</b> (every field explained).",
        "Columns marked <b>*</b> are required. Hover a header (red triangle) to read its full help note.",
        "Leave ID columns blank to auto-generate them, or keep the exact format shown (e.g. PRJ-00001) and never reuse a code.",
        "To link rows, copy an ID exactly: a Project’s developer_id must match a real Developer’s developer_id.",
        "Drop-down cells only accept a value from the list — pick, don’t type.",
        "Prices are illustrative and must be confirmed with the developer/advisor. We market PRIMARY sale only.",
        "Dates are YYYY-MM-DD. Numbers have no commas or currency signs. Percent is the number only.",
        "Images are entered as a file <b>path</b> (projects/badya/hero.jpg), never pasted pictures.",
        "Separate multiple values with a pipe | (galleries, highlights).",
        "Never rename tabs, delete the header row, or reorder columns.",
    ]
    for i, r in enumerate(rules, 1):
        st.append(Paragraph(f'<b>{i}.</b> {r}', BODY))
    st.append(Spacer(1, 6))

    st.append(Paragraph("How your data is checked (and error reports)", H2))
    st.append(Paragraph("On import, every row is validated. Anything wrong is returned in an "
        "error report (CSV) so you can fix and re-submit — nothing half-imports.", BODY))
    ec = [["Error code", "Meaning"]]
    for code, msg in [("REQUIRED_MISSING","A required field is empty."),
                      ("FK_NOT_FOUND","A linked ID doesn’t exist in its parent sheet."),
                      ("NOT_IN_LIST","Value isn’t one of the allowed drop-down options."),
                      ("DUPLICATE_ID","This ID/slug already exists."),
                      ("SLUG_FORMAT","Slug must be lowercase-with-dashes."),
                      ("BAD_NUMBER","Field must be a number (no commas/text)."),
                      ("BAD_DATE","Date must be YYYY-MM-DD.")]:
        ec.append([Paragraph(code, CELLB), Paragraph(msg, CELL)])
    t = Table(ec, colWidths=[45*mm, 117*mm]); t.setStyle(_tbl_style(len(ec)))
    st.append(t)
    st.append(Paragraph("The error report has columns: row_number, sheet, column, field, "
        "offending_value, severity, error_code, message. A ready template is in "
        "templates-csv/_import_error_report_TEMPLATE.csv.", SMALL))

    st.append(Paragraph("IDs, names & images — quick reference", H2))
    st.append(bullet("<b>IDs</b>: fixed prefixes (AREA-, DEV-, PRJ-, UTYP-, UNIT-, PAMN-, PLAN-, DPM-), "
                     "zero-padded, permanent, unique. Blank = auto-generated. Full rules: docs/ID_Strategy.md."))
    st.append(bullet("<b>Slugs</b>: lowercase-with-dashes, unique, permanent. Full rules: docs/Naming_Conventions.md."))
    st.append(bullet("<b>Images</b>: a path inside assets/ (e.g. projects/badya/hero.jpg). Folders ready in "
                     "assets-structure/. Full rules: docs/ASSETS_STRUCTURE.md."))
    st.append(Paragraph("Built to scale", H2))
    st.append(Paragraph("The ID padding and database indexes are sized for <b>100,000+ units</b> and "
        "millions of inventory rows without any format change. Import is done per sheet in the order "
        "above; large files can be split and imported in batches safely because links are by ID.", BODY))

    doc.build(st, onFirstPage=page_footer, onLaterPages=page_footer)
    return fn

def _tbl_style(nrows, header=True):
    cmds = [
        ("FONTNAME", (0,0), (-1,-1), "DV"),
        ("FONTSIZE", (0,0), (-1,-1), 7.8),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("BACKGROUND", (0,0), (-1,0), TEAL),
        ("FONTNAME", (0,0), (-1,0), "DVB"),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("GRID", (0,0), (-1,-1), 0.5, LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 5), ("RIGHTPADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 3), ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, BONE2]),
    ]
    return TableStyle(cmds)

# ---------------------------------------------------------------------------
# 4) Data Dictionary.pdf  (landscape, table per entity)
# ---------------------------------------------------------------------------
def allowed_txt(f):
    if f["enum"]:
        return " · ".join(S.L(f["enum"]))
    return {"int":"number ≥ 0","decimal":"number ≥ 0","date":"YYYY-MM-DD",
            "slug":"lowercase-with-dashes","image":"asset path","images":"asset path(s), | separated",
            "url":"https://…","email":"email","phone":"+20…","geo":"decimal degrees"}.get(f["type"],"free text")

def build_dictionary_pdf():
    fn = p("docs", "Data Dictionary.pdf")
    doc = SimpleDocTemplate(fn, pagesize=landscape(A4), topMargin=16*mm, bottomMargin=18*mm,
                            leftMargin=14*mm, rightMargin=14*mm,
                            title="The Village — Data Dictionary", author=S.BRAND["name"])
    st = []
    brand_header(st, "Data Dictionary — all 8 sheets",
                 f'Version {S.BRAND["version"]} · {S.BRAND["date"]} · every field, its rules and an example')
    st.append(Paragraph("Legend:  <b>*</b> = required · <b>PK</b> primary key · <b>FK→</b> links to another sheet · "
                        "‘Allowed’ lists the only accepted values for drop-downs.", SMALL))
    st.append(Spacer(1, 4))

    heads = ["Field (system)", "Label EN", "Label AR", "Req", "Type", "Allowed / format", "Example", "Key"]
    colw = [46*mm, 40*mm, 40*mm, 14*mm, 20*mm, 60*mm, 40*mm, 22*mm]
    for e in S.ENTITIES:
        block = []
        block.append(Paragraph(f'{e["num"]}. {e["title_en"]} — {ar(e["title_ar"])}', H2))
        block.append(Paragraph(f'Table <font face="DVB">{e["table"]}</font> · {e["desc_en"]}', SMALL))
        data = [[Paragraph(h, CELLH) for h in heads]]
        for f in e["fields"]:
            key = "PK" if f["pk"] else ("FK→" + f["fk"].split(".")[0] if f["fk"] else ("unique" if f["unique"] else ""))
            data.append([
                Paragraph(f["name"] + (" *" if f["required"] else ""), CELLB),
                Paragraph(f["label_en"], CELL),
                Paragraph(ar(f["label_ar"]), CELL),
                Paragraph("Yes" if f["required"] else "—", CELL),
                Paragraph(f["type"], CELL),
                Paragraph(allowed_txt(f), CELL),
                Paragraph(str(f["example"]), CELL),
                Paragraph(key, CELL),
            ])
        t = Table(data, colWidths=colw, repeatRows=1)
        t.setStyle(_tbl_style(len(data)))
        block.append(t)
        block.append(Spacer(1, 8))
        st.append(KeepTogether(block) if len(e["fields"]) <= 12 else block[0])
        if len(e["fields"]) > 12:
            for fl in block[1:]:
                st.append(fl)
        st.append(Spacer(1, 4))

    # Lookups appendix
    st.append(PageBreak())
    st.append(Paragraph("Appendix — Controlled lists (drop-down values)", H2))
    st.append(Paragraph("English is stored in the database; Arabic is the on-screen helper.", SMALL))
    lk = [[Paragraph(x, CELLH) for x in ["List", "Allowed values (EN)", "القيم (AR)"]]]
    for key, pairs in S.LOOKUPS.items():
        lk.append([Paragraph(key, CELLB),
                   Paragraph(" · ".join(en for en, arv in pairs), CELL),
                   Paragraph(" · ".join(ar(arv) for en, arv in pairs), CELL)])
    t = Table(lk, colWidths=[38*mm, 118*mm, 110*mm], repeatRows=1)
    t.setStyle(_tbl_style(len(lk)))
    st.append(t)

    doc.build(st, onFirstPage=page_footer, onLaterPages=page_footer)
    return fn

if __name__ == "__main__":
    write_markdown()
    write_assets_skeleton()
    r = build_readme_pdf()
    d = build_dictionary_pdf()
    print("docs written: ID_Strategy.md, Naming_Conventions.md, ASSETS_STRUCTURE.md")
    print("assets-structure/ skeleton created")
    print("PDF:", os.path.relpath(r, OUT), "|", os.path.relpath(d, OUT))
