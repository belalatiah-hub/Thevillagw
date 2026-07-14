# -*- coding: utf-8 -*-
"""Entity-Relationship diagram: Mermaid source (.mmd) + a polished SVG."""
import os
import kit_schema as S

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data-import-kit"))
os.makedirs(os.path.join(OUT, "docs"), exist_ok=True)

REL = [  # (parent, child, parent_key, cardinality_note)
    ("areas", "projects", "area_id", "1..*"),
    ("developers", "projects", "developer_id", "1..*"),
    ("projects", "unit_types", "project_id", "1..*"),
    ("projects", "units", "project_id", "1..*"),
    ("unit_types", "units", "unit_type_id", "0..*"),
    ("projects", "project_amenities", "project_id", "1..*"),
    ("projects", "payment_plans", "project_id", "1..*"),
    ("payment_plans", "units", "payment_plan_id", "0..*"),
    ("developers", "developer_project_map", "developer_id", "1..*"),
    ("projects", "developer_project_map", "project_id", "1..*"),
]

# ---------------- Mermaid ----------------
def build_mermaid():
    L = ["erDiagram",
         "  %% The Village Investment — real-estate data model (8 entities)"]
    tmap = {e["key"]: e["table"].upper() for e in S.ENTITIES}
    for e in S.ENTITIES:
        L.append(f'  {e["table"].upper()} {{')
        for f in e["fields"]:
            tag = "PK" if f["pk"] else ("FK" if f["fk"] else "")
            typ = f["type"]
            L.append(f'    {typ} {f["name"]} {tag}'.rstrip())
        L.append("  }")
    for parent, child, key, card in REL:
        verb = "has"
        L.append(f'  {tmap[parent]} ||--o{{ {tmap[child]} : "{verb}"')
    open(os.path.join(OUT, "docs", "ER_Diagram.mmd"), "w", encoding="utf-8").write("\n".join(L))

# ---------------- SVG ----------------
POS = {
    "areas":              (40,  70, 250),
    "developers":         (1110,70, 250),
    "developer_project_map":(590,70,300),
    "projects":           (590, 330, 300),
    "unit_types":         (40,  360, 250),
    "payment_plans":      (1110,360, 250),
    "project_amenities":  (1110,660, 250),
    "units":              (590, 680, 300),
}
ROWH = 20
HEADH = 34

def key_fields(e):
    out = []
    for f in e["fields"]:
        if f["pk"] or f["fk"]:
            out.append((f["name"], "PK" if f["pk"] else "FK"))
    # add up to 3 descriptive fields
    extra = [f for f in e["fields"] if not f["pk"] and not f["fk"]
             and f["type"] in ("text","enum","decimal","slug")][:3]
    for f in extra:
        out.append((f["name"], ""))
    return out

def box_geom(e):
    x, y, w = POS[e["key"]]
    rows = key_fields(e)
    h = HEADH + ROWH * len(rows) + 8
    return x, y, w, h, rows

def anchors(e):
    x, y, w, h, rows = box_geom(e)
    return {
        "L": (x, y + h/2), "R": (x + w, y + h/2),
        "T": (x + w/2, y), "B": (x + w/2, y + h),
        "TL": (x + w*0.28, y), "TR": (x + w*0.72, y),
        "BL": (x + w*0.28, y + h), "BR": (x + w*0.72, y + h),
        "box": (x, y, w, h, rows),
    }

def esc(s): return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def build_svg():
    W, H = 1420, 1010
    A = {e["key"]: anchors(e) for e in S.ENTITIES}
    teal = "#073D52"; teal2 = "#115F7D"; bone = "#F3EFE6"; ink = "#1B2B31"
    line = "#9db4bb"; keyc = "#0E5A3C"
    P = []
    P.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="Segoe UI, Arial, sans-serif">')
    P.append(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')
    P.append(f'<text x="40" y="42" font-size="26" font-weight="700" fill="{teal}">The Village Investment — Data Model (ER Diagram)</text>')
    P.append(f'<text x="40" y="64" font-size="13" fill="{ink}">8 connected entities · one-to-many shown as 1 ──&#8734; · dashed = optional link · v{S.BRAND["version"]} {S.BRAND["date"]}</text>')

    # connectors first (under boxes)
    routes = {
        ("areas","projects"): ("R","L"),
        ("developers","projects"): ("L","R"),
        ("developers","developer_project_map"): ("L","R"),
        ("projects","developer_project_map"): ("T","B"),
        ("projects","unit_types"): ("L","R"),
        ("projects","units"): ("B","T"),
        ("unit_types","units"): ("B","L"),
        ("projects","payment_plans"): ("R","L"),
        ("projects","project_amenities"): ("R","TR"),
        ("payment_plans","units"): ("B","R"),
    }
    optional = {("unit_types","units"), ("payment_plans","units")}
    for (parent, child, key, card) in REL:
        pa, ca = routes[(parent, child)]
        x1, y1 = A[parent][pa]; x2, y2 = A[child][ca]
        mx = (x1 + x2) / 2
        dash = ' stroke-dasharray="6 5"' if (parent, child) in optional else ''
        # orthogonal-ish elbow
        d = f'M {x1:.0f} {y1:.0f} L {mx:.0f} {y1:.0f} L {mx:.0f} {y2:.0f} L {x2:.0f} {y2:.0f}'
        P.append(f'<path d="{d}" fill="none" stroke="{line}" stroke-width="2"{dash}/>')
        # cardinality marks
        P.append(f'<text x="{x1:.0f}" y="{y1-6:.0f}" font-size="12" fill="{teal2}" text-anchor="middle">1</text>')
        P.append(f'<text x="{x2:.0f}" y="{y2-6:.0f}" font-size="13" fill="{teal2}" text-anchor="middle">&#8734;</text>')
        P.append(f'<circle cx="{x2:.0f}" cy="{y2:.0f}" r="3.5" fill="{teal2}"/>')

    # boxes on top
    for e in S.ENTITIES:
        x, y, w, h, rows = A[e["key"]]["box"]
        P.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#ffffff" stroke="{teal}" stroke-width="1.6"/>')
        P.append(f'<path d="M {x} {y+HEADH} L {x} {y+10} Q {x} {y} {x+10} {y} L {x+w-10} {y} Q {x+w} {y} {x+w} {y+10} L {x+w} {y+HEADH} Z" fill="{teal}"/>')
        P.append(f'<text x="{x+14}" y="{y+22}" font-size="14" font-weight="700" fill="#fff">{esc(e["table"])}</text>')
        if len(e["table"]) <= 18:   # skip AR subtitle for very long table names to avoid overlap
            P.append(f'<text x="{x+w-12}" y="{y+22}" font-size="11" fill="#bfe0e8" text-anchor="end">{esc(e["title_ar"])}</text>')
        for i, (name, tag) in enumerate(rows):
            ry = y + HEADH + 15 + i * ROWH
            if i % 2 == 0:
                P.append(f'<rect x="{x+1}" y="{ry-13:.0f}" width="{w-2}" height="{ROWH}" fill="{bone}" opacity="0.5"/>')
            col = keyc if tag else ink
            weight = "700" if tag else "400"
            P.append(f'<text x="{x+14}" y="{ry:.0f}" font-size="12" fill="{col}" font-weight="{weight}">{esc(name)}</text>')
            if tag:
                P.append(f'<text x="{x+w-12}" y="{ry:.0f}" font-size="10" fill="{keyc}" text-anchor="end" font-weight="700">{tag}</text>')

    # legend
    lx, ly = 40, H-70
    P.append(f'<rect x="{lx}" y="{ly}" width="520" height="52" rx="8" fill="{bone}" stroke="{line}"/>')
    P.append(f'<text x="{lx+14}" y="{ly+20}" font-size="12" fill="{ink}"><tspan font-weight="700">PK</tspan> primary key   ·   <tspan font-weight="700">FK</tspan> foreign key (link)   ·   1 ──&#8734; one-to-many</text>')
    P.append(f'<text x="{lx+14}" y="{ly+40}" font-size="12" fill="{ink}">Solid line = required link   ·   Dashed line = optional link   ·   Fill sheets top-to-bottom (parents first)</text>')
    P.append('</svg>')
    open(os.path.join(OUT, "docs", "ER_Diagram.svg"), "w", encoding="utf-8").write("\n".join(P))

if __name__ == "__main__":
    build_mermaid()
    build_svg()
    print("ER diagram written: docs/ER_Diagram.mmd, docs/ER_Diagram.svg")
