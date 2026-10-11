#!/usr/bin/env python3
"""Three Palm Hills kits: 97 Hills, Village de la Capitale and Jirian.

All three cards already existed, built from the client sheet alone — figures,
a payment plan and a handful of units, and no picture of the projects at all.
These are their own documents: 97 Hills' 35-page brochure with an image
archive, Village de la Capitale's 34-slide sales orientation with an image
archive, and Palm Hills' 64-page Jirian sales kit, which came with no archive
and needs none, because every page of it is a render or a plan.

WHAT THE DOCUMENTS SETTLE

97 Hills: ninety-seven feddans, three hundred and twenty-five buildings
holding just over six hundred homes, on the Middle Ring Road. Five products —
Villa A, Villa B, Villa C, Town House (corner and middle) and Family Home —
each with its land area, built-up area, penthouse, roof and semi-covered roof
printed on its own title page, and ground, first and penthouse plans after it.
The brochure says twice, on p04 and p14, that every home is DELIVERED FULLY
FINISHED. The card said "Core & shell / fully finished"; the brochure does not
offer core and shell, and the card is corrected against it.

Village de la Capitale: 290 feddans, phase one 88, Palm Hills' first
residential project in the New Capital, master planned with SWA. Its product
brief table gives every type at once — Villa A/5B 292 m² on 371, Villa B/4B
257 on 300, Villa C/3B 185 on 282, Town House corner and middle both 196 on
186, and apartments at 60, 91 and 141 m² — and three apartment buildings of
32, 48 and 64 units.

Jirian: Palm Hills' half of the Nile-front development, branded PALM HILLS |
JIRIAN on every page. Six products — Nile Front Twenty (A/B/C at 1100, 840 and
705 m² of land), Maison Du Nil (four sizes down to 268), Nile Town, Nile Pair
Twin, the Nile Horizon buildings A/B/C/E and the nineteen-storey Nile Rise —
with a floor-by-floor unit matrix for the last two. This kit belongs to the
PALM HILLS card, not to Mountain View's separate Jirian in October.

WHAT IS LEFT OUT

Village de la Capitale p05 prints MONORAIL 10 MINS, GREEN RIVER 5 MINS, ICONIC
TOWER 15 MINS, CENTRAL PARK 5 MINS, PALM HILLS NEW CAIRO 25 MINS, CITY OF ARTS
& CULTURE 20 MINS and GOVERNMENTAL DISTRICT 25 MINS. Its p06 is a second
location map of the same site with no time on it, and that is the one that
ships. Its p07 is four photographs of the Dubai Opera District, the Burj
Khalifa, a JW Marriott in North Carolina and a river plan in China — SWA's
other work, not this project, and nothing on a project's own page should show
another continent.

97 Hills p07 and p08 are photographs, not renders: a glass clubhouse over a
lawn with a tennis court, and palms over a lake. The project delivers in 2029
and is not built, so whatever they are, they are not 97 Hills. Its p09 puts a
woman with a coffee where the commercial promenade should be, and p03 and p05
are stock portraits. Their words are on the cards; the pictures are not.

The rest is covers, dividers with no picture of their own, and the contact
page, which this site never publishes.

    python3 tools/pull_palmhills_three.py
"""
import glob
import os
import subprocess
import tempfile

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UP = '/root/.claude/uploads/c9c8c82a-00eb-5d87-a89f-ba9e63e19221/'

WIDE = 2000          # a brochure page or deck slide, published whole
UNIT = 1400          # a render or a plan out of an archive

# ---------------------------------------------------------------- 97 Hills
H97_PAGES = [6] + list(range(10, 35))
H97_OUT = {
    1: 'the cover — the project name over an abstract texture',
    2: 'THE HIGHEST FORM OF LIVING IN CAIRO — the line over the same texture',
    3: 'ABOUT THE PROJECT — a stock portrait; the ninety-seven feddans, the '
       '325 buildings and the six hundred homes are on the card',
    4: 'THE ESSENCE OF 97 HILLS — text on a green field, no picture, and all '
       'of it is on the card',
    5: 'THE PALM HILLS SIGNATURE — a stock portrait',
    7: 'AMENITIES — a photograph of a glass clubhouse over a lawn and a tennis '
       'court. 97 Hills delivers in 2029 and is not built, so this is not it',
    8: 'WATER FEATURES — a photograph of palms over a lake, the same problem',
    9: 'THE COMMERCIAL PROMENADE — a stock photograph of a woman with a coffee '
       'standing in for the retail; its two sentences are on the card',
    35: 'the contact page — this site publishes no phone number or address',
}

# ------------------------------------------ Village de la Capitale (slides)
VDC_PAGES = [4, 6, 8, 9, 10] + list(range(12, 34))
VDC_OUT = {
    1: 'the cover',
    2: 'Concept Story — text only; SWA and the topography are on the card',
    3: 'Facilities & Amenities — a bulleted list with no picture; the eight '
       'lines are on the card',
    5: 'Location Map & Key Landmarks — MONORAIL 10 MINS, GREEN RIVER 5 MINS, '
       'ICONIC TOWER 15 MINS, CENTRAL PARK 5 MINS, PALM HILLS NEW CAIRO 25 '
       'MINS, CITY OF ARTS & CULTURE 20 MINS, GOVERNMENTAL DISTRICT 25 MINS. '
       'p06 is the same site drawn again with no time on it and ships instead',
    7: 'four photographs of the Dubai Opera District, the Burj Khalifa, a JW '
       'Marriott in North Carolina and a river plan in China — the landscape '
       'architect\'s other work, on three other continents',
    11: 'Residential Offering — three bullet points, no picture',
    34: 'Thank You',
}

# ------------------------------------------------------- Jirian (sales kit)
JIR_PAGES = [2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 22, 23,
             24] + list(range(26, 48)) + [49, 50] + list(range(52, 64))
JIR_OUT = {
    1: 'the title card — PALM HILLS | JIRIAN SALES KIT on black',
    5: 'the Nile Mansion section title, text on black',
    12: 'the Maison Du Nil section title, text on black',
    18: 'the Nile Town section title, text on black',
    21: 'the Nile Pair Twin section title, text on black',
    25: 'the Nile Horizon Look & Feel title, text on black',
    48: 'the Nile Rise Look & Feel title, text on black',
    51: 'the Nile Rise plans title, text on black',
    64: 'Thank You',
}

# (archive file, published name). Nothing is dropped from either archive.
# (archive file, published name). Both archives were checked against their own
# document page by page with a perceptual hash before any of this was written,
# and the result changed the plan: most of what they hold is a lower-resolution
# CROP of a page that is already published, and the filenames do not say which
# page. fp-tw-97.png is named for a twin house and is the brochure's TOWN HOUSE
# ground floor (p28, hamming 14); fp-to1-01/02 are named for a town house and
# are the FAMILY HOME first floor (p33, 15 and 16); fp-villa3-01 is Villa B's
# penthouse (p22, 17) and fp-villa4-01 is Villa A's first floor (p17, 19).
# Publishing those under their filenames would have labelled four plans with
# the wrong home. They are dropped, named in H97_DUP, and the brochure's own
# labelled pages carry the plans instead.
#
# What is kept is what the brochure does not already hold at better quality:
# sixteen renders that match no page (hamming 59 and up), and the master plan
# and location map, which are different drawings from the brochure's p11 and
# p06. The master plan's legend also settles something the brochure leaves
# out — it keys six types, Villa A, B and C, Town House, TWIN HOUSE and Family
# Home, and the brochure draws only five. The twin house exists; its pages
# just are not in this book.
H97_ARCH = [
    ('villa1-97-0.png', 'renders/villa1-0'), ('villa1-97-01.png', 'renders/villa1-1'),
    ('villa1-97-02.png', 'renders/villa1-2'), ('villa1-97-03.png', 'renders/villa1-3'),
    ('villa3-97-0.png', 'renders/villa3-0'), ('villa3-97-01.png', 'renders/villa3-1'),
    ('villa3-97-02.png', 'renders/villa3-2'),
    ('villa4-97-0.png', 'renders/villa4-0'), ('villa4-97-01.png', 'renders/villa4-1'),
    ('to1-97-0.png', 'renders/to1-0'), ('to1-97-01.png', 'renders/to1-1'),
    ('tw1-97-0.png', 'renders/tw1-0'), ('tw1-97-01.png', 'renders/tw1-1'),
    ('ap1-97-0.png', 'renders/ap1-0'), ('ap1-97-01.png', 'renders/ap1-1'),
    ('ap2-97-0.png', 'renders/ap2-0'),
    ('mp-97.PNG', 'masterplan'), ('location 97.PNG', 'location'),
]
H97_DUP = {
    'villa2-97-0.png':  "Villa A's title page and its area table — brochure p15",
    'villa2-97-01.png': "Villa A's first floor — brochure p17, hamming 24",
    'villa2-97-02.png': "Villa A's penthouse — brochure p18, hamming 25",
    'villa2-97-03.png': "Villa A's penthouse again — brochure p18, hamming 33",
    'fp-villa3-97-0.png':  'a plan crop of the Villa B section',
    'fp-villa3-97-01.png': "Villa B's penthouse — brochure p22, hamming 17",
    'fp-villa3-97-02.png': "Villa B's penthouse again — brochure p22, hamming 27",
    'fp-villa3-97-03.png': "Villa B's penthouse again — brochure p22, hamming 27",
    'fp-villa4-97-0.png':  'a plan crop of the Villa A section',
    'fp-villa4-97-01.png': "Villa A's first floor — brochure p17, hamming 19",
    'fp-villa4-97-02.png': 'a plan crop of the Villa C section — brochure p25, hamming 31',
    'fp-villa4-97-03.png': "Villa A's penthouse — brochure p18, hamming 24",
    'fp-to1-0.png':  'a plan crop of the Town House section',
    'fp-to1-01.png': "the FAMILY HOME first floor — brochure p33, hamming 15, "
                     "despite the town-house filename",
    'fp-to1-02.png': 'the Family Home first floor again — brochure p33, hamming 16',
    'fp-tw-97.png':  "the TOWN HOUSE ground floor — brochure p28, hamming 14, "
                     "despite the twin-house filename",
    'fp-ap1.png': 'an unlabelled apartment plan crop, too small to read and '
                  'matching no page this book draws',
    'fp-ap2-0.png': 'a second unlabelled apartment plan crop',
}
# Village de la Capitale's archive splits the other way: its nine renders match
# no slide (hamming 87 and up) and are genuinely additional, while its six
# plan files are crops of slides that are already published — fp-villa-vdl is
# VILLA C (p21, hamming 4) and fp-villa2-vdl is VILLA A (p17, 5), so their
# filenames point at the wrong villa, and fp-vdl-01 is Building C (p33, 3).
VDC_ARCH = [
    ('villa1-vdl-0.png', 'renders/villa1-0'), ('villa1-vdl-01.png', 'renders/villa1-1'),
    ('villa1-vdl-02.png', 'renders/villa1-2'),
    ('villa2-vdl-0.png', 'renders/villa2-0'), ('villa2-vdl-01.png', 'renders/villa2-1'),
    ('villa2-vdl-02.png', 'renders/villa2-2'),
    ('ap1-vdl-0.png', 'renders/ap1-0'), ('ap1-vdl-01.png', 'renders/ap1-1'),
    ('ap1-vdl-02.png', 'renders/ap1-2'),
    ('mp-vdl.PNG', 'masterplan'), ('loc-vdl.PNG', 'location'),
]
VDC_DUP = {
    'fp-villa-vdl.png':  'VILLA C ground and first floor — slide p21, hamming 4, '
                         'despite a filename that names no type',
    'fp-villa2-vdl.png': 'VILLA A ground, first and penthouse — slide p17, '
                         'hamming 5, despite the "villa2" filename',
    'fp-vdl-0.png':  'an apartment plan crop',
    'fp-vdl-01.png': 'Building C ground and typical floor — slide p33, hamming 3',
    'fp-vdl-02.png': 'Building B ground and typical floor — slide p32, hamming 45',
    'fp-vdl-03.png': 'a fourth apartment plan crop',
}

JOBS = [
    ('97-hills', '6347a21b-97_Hills_Final_Brochure_.pdf', 35,
     H97_PAGES, H97_OUT, '9d111149-97_hills.rar', H97_ARCH, H97_DUP),
    ('village-de-la-capitale',
     '117753ad-VILLAGE_DE_LA_CAPITALE_Capitale_Sales_Orientation_.pdf', 34,
     VDC_PAGES, VDC_OUT, '758304f7-Village_de_la_Capitale.rar', VDC_ARCH, VDC_DUP),
    ('jirian-zayed', '47b664b7-Jirian_Sales_Kit.pdf', 64,
     JIR_PAGES, JIR_OUT, None, [], {}),
]


def flatten(im):
    if im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert('RGB')


def save(im, out, rel, width):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(out, rel + '.webp')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=86, method=6)
    return path


def main():
    total = []
    for slug, pdf, count, pages, withheld, rar, arch, dup in JOBS:
        out = os.path.join(ROOT, 'project-media', 'palmhills', slug)
        hits = glob.glob(UP + pdf)
        if not hits:
            raise SystemExit('%s: the document is not where this expects it' % slug)
        doc = pymupdf.open(hits[0])
        if doc.page_count != count:
            raise SystemExit('%s: %d pages, expected %d' % (slug, doc.page_count, count))
        clash = sorted(set(pages) & set(withheld))
        if clash:
            raise SystemExit('%s: both published and withheld: %s' % (slug, clash))
        gap = sorted(set(range(1, count + 1)) - set(pages) - set(withheld))
        if gap:
            raise SystemExit('%s: neither published nor withheld: %s' % (slug, gap))

        made = []
        for n in pages:
            p = doc[n - 1]
            z = WIDE / p.rect.width
            px = p.get_pixmap(matrix=pymupdf.Matrix(z, z))
            made.append(save(Image.frombytes('RGB', (px.width, px.height), px.samples),
                             out, 'kit/p%02d' % n, WIDE))

        if rar:
            tmp = tempfile.mkdtemp(prefix='ph-')
            subprocess.run(['bsdtar', '-xf', UP + rar, '-C', tmp], check=True)
            had = set(os.listdir(tmp))
            used = {s for s, _ in arch} | set(dup)
            if sorted(used - had):
                raise SystemExit('%s: named but not in the archive: %s'
                                 % (slug, sorted(used - had)))
            if sorted(had - used):
                raise SystemExit('%s: in the archive and unaccounted for: %s'
                                 % (slug, sorted(had - used)))
            for src, rel in arch:
                made.append(save(flatten(Image.open(os.path.join(tmp, src))),
                                 out, rel, UNIT))

        print('--- %s: %d pages of %d, %d archive files kept, %d in all'
              % (slug, len(pages), count, len(arch), len(made)))
        for n in sorted(withheld):
            print('    p%02d withheld — %s' % (n, withheld[n]))
        for k in sorted(dup):
            print('    %-22s dropped — %s' % (k, dup[k]))
        total += made

    print('\n%d files' % len(total))
    for path in total:
        im = Image.open(path)
        print('  %-54s %4dx%-4d %6.0f KB'
              % (os.path.relpath(path, ROOT), im.width, im.height,
                 os.path.getsize(path) / 1024))


if __name__ == '__main__':
    main()
