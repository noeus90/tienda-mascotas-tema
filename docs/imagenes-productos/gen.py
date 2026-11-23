# Simple flat product illustrations (1000x1000 SVG -> PNG with qlmanage).
import json, os, re, subprocess, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
FONT = "Avenir Next"

def esc(s):
    return html.escape(s, quote=True)

# ---------- small icons ----------
def dog_head(cx, cy, s, fill):
    return f'''<g transform="translate({cx},{cy}) scale({s})">
<ellipse cx="-34" cy="-6" rx="16" ry="30" fill="{fill}" opacity=".75" transform="rotate(18 -34 -6)"/>
<ellipse cx="34" cy="-6" rx="16" ry="30" fill="{fill}" opacity=".75" transform="rotate(-18 34 -6)"/>
<circle r="34" fill="{fill}"/>
<circle cx="-12" cy="-6" r="5" fill="#fff"/><circle cx="12" cy="-6" r="5" fill="#fff"/>
<ellipse cx="0" cy="12" rx="9" ry="7" fill="#fff"/></g>'''

def cat_head(cx, cy, s, fill):
    return f'''<g transform="translate({cx},{cy}) scale({s})">
<path d="M-32 -10 L-30 -46 L-6 -28 Z M32 -10 L30 -46 L6 -28 Z" fill="{fill}"/>
<circle r="34" fill="{fill}"/>
<ellipse cx="-12" cy="-4" rx="5" ry="7" fill="#fff"/><ellipse cx="12" cy="-4" rx="5" ry="7" fill="#fff"/>
<path d="M-6 10 L6 10 L0 17 Z" fill="#fff"/>
<path d="M-14 14 L-40 10 M-14 18 L-40 22 M14 14 L40 10 M14 18 L40 22" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>'''

def paw(cx, cy, s, fill, opacity=1):
    return f'''<g transform="translate({cx},{cy}) scale({s})" fill="{fill}" opacity="{opacity}">
<ellipse cx="0" cy="14" rx="22" ry="18"/><ellipse cx="-24" cy="-10" rx="9" ry="12"/><ellipse cx="-8" cy="-24" rx="9" ry="12"/>
<ellipse cx="8" cy="-24" rx="9" ry="12"/><ellipse cx="24" cy="-10" rx="9" ry="12"/></g>'''

def snowflake(cx, cy, s, fill="#0284c7"):
    arms = "".join(f'<g transform="rotate({a})"><path d="M0 0 V-40 M0 -26 L-10 -36 M0 -26 L10 -36" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/></g>' for a in range(0, 360, 60))
    return f'<g transform="translate({cx},{cy}) scale({s})"><circle r="56" fill="{fill}"/>{arms}</g>'

def species_icon(species, cx, cy, s, fill):
    if species == "cat":
        return cat_head(cx, cy, s, fill)
    if species == "both":
        return dog_head(cx - 40 * s, cy, s * 0.8, fill) + cat_head(cx + 40 * s, cy + 4 * s, s * 0.8, fill)
    return dog_head(cx, cy, s, fill)

def wrap(title, width):
    words, lines, cur = title.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > width:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines

def text_block(lines, cx, top, size, fill, weight=700, gap=1.18):
    out = []
    for i, line in enumerate(lines):
        out.append(f'<text x="{cx}" y="{top + size + i * size * gap:.0f}" font-family="{FONT}" font-weight="{weight}" font-size="{size}" text-anchor="middle" fill="{fill}">{esc(line)}</text>')
    return "".join(out)

def label(name, sub, cx, top, w, color, species, max_chars=13, size=44):
    lines = wrap(name, max_chars)
    if len(lines) > 4:
        size = int(size * 0.82)
        lines = wrap(name, int(max_chars * 1.2))
    h = 150 + len(lines) * size * 1.18 + (46 if sub else 0)
    out = f'<rect x="{cx - w / 2}" y="{top}" width="{w}" height="{h:.0f}" rx="22" fill="#fff"/>'
    out += species_icon(species, cx, top + 66, 0.9, color)
    out += text_block(lines, cx, top + 112, size, "#1f2937")
    if sub:
        out += f'<text x="{cx}" y="{top + h - 26:.0f}" font-family="{FONT}" font-weight="600" font-size="30" text-anchor="middle" fill="{color}">{esc(sub)}</text>'
    return out

# ---------- packages ----------
def bag(p):
    c, d = p["color"], p["dark"]
    body = f'''<path d="M290 230 Q500 205 710 230 L745 830 Q500 860 255 830 Z" fill="{c}"/>
<path d="M290 230 Q500 205 710 230 L714 290 Q500 268 286 290 Z" fill="{d}"/>
<path d="M300 205 L700 205 L710 232 Q500 210 290 232 Z" fill="{d}"/>
<path d="M310 214 H690" stroke="#fff" stroke-width="4" stroke-dasharray="10 10" opacity=".5"/>
<path d="M700 300 L735 800" stroke="#fff" stroke-width="10" opacity=".15" stroke-linecap="round"/>'''
    return body + label(p["name"], p["sub"], 500, 330, 360, c, p["species"])

def pouch(p):
    c, d = p["color"], p["dark"]
    body = f'''<path d="M320 220 H680 L700 790 Q700 840 650 840 H350 Q300 840 300 790 Z" fill="{c}"/>
<rect x="320" y="220" width="360" height="40" fill="{d}"/>
<path d="M660 222 L680 242 L680 222 Z" fill="#fff" opacity=".6"/>'''
    return body + label(p["name"], p["sub"], 500, 300, 320, c, p["species"], max_chars=12, size=40)

def can(p):
    c, d = p["color"], p["dark"]
    body = f'''<rect x="300" y="300" width="400" height="460" fill="#cbd5e1"/>
<ellipse cx="500" cy="760" rx="200" ry="46" fill="#94a3b8"/>
<rect x="300" y="340" width="400" height="380" fill="{c}"/>
<ellipse cx="500" cy="300" rx="200" ry="46" fill="#e2e8f0"/>
<ellipse cx="500" cy="300" rx="170" ry="36" fill="#cbd5e1"/>
<ellipse cx="500" cy="300" rx="140" ry="26" fill="none" stroke="#94a3b8" stroke-width="4"/>
<rect x="300" y="330" width="400" height="10" fill="#94a3b8"/><rect x="300" y="720" width="400" height="10" fill="#94a3b8"/>'''
    lines = wrap(p["name"], 15)
    size = 40 if len(lines) <= 3 else 34
    txt = species_icon(p["species"], 500, 410, 0.9, "#fff")
    txt += text_block(lines, 500, 470, size, "#fff")
    if p["sub"]:
        txt += f'<text x="500" y="700" font-family="{FONT}" font-weight="600" font-size="30" text-anchor="middle" fill="#fff" opacity=".9">{esc(p["sub"])}</text>'
    return body + txt

def tub(p):
    c, d = p["color"], p["dark"]
    body = f'''<path d="M250 380 H750 L715 800 Q500 830 285 800 Z" fill="#fff"/>
<path d="M250 380 H750 L740 500 H260 Z" fill="{c}"/>
<rect x="230" y="320" width="540" height="70" rx="20" fill="{d}"/>'''
    lines = wrap(p["name"], 18)
    txt = species_icon(p["species"], 500, 445, 0.75, "#fff")
    txt += text_block(lines, 500, 520, 40, "#1f2937")
    if p["sub"]:
        txt += f'<text x="500" y="770" font-family="{FONT}" font-weight="600" font-size="30" text-anchor="middle" fill="{c}">{esc(p["sub"])}</text>'
    if p.get("frozen"):
        txt += snowflake(735, 330, 1.0)
    return body + txt

def bottle(p):
    c, d = p["color"], p["dark"]
    body = f'''<rect x="440" y="170" width="120" height="60" rx="10" fill="{d}"/>
<rect x="420" y="220" width="160" height="50" rx="8" fill="{d}"/>
<path d="M420 268 Q330 300 330 380 V800 Q330 840 370 840 H630 Q670 840 670 800 V380 Q670 300 580 268 Z" fill="{c}"/>
<rect x="640" y="380" width="12" height="380" rx="6" fill="#fff" opacity=".25"/>'''
    return body + label(p["name"], p["sub"], 500, 400, 290, c, p["species"], max_chars=11, size=38)

def jar(p):
    c, d = p["color"], p["dark"]
    body = f'''<rect x="330" y="240" width="340" height="90" rx="16" fill="{d}"/>
<rect x="300" y="320" width="400" height="500" rx="50" fill="{c}"/>'''
    return body + label(p["name"], p["sub"], 500, 380, 340, c, p["species"], max_chars=13, size=40)

def dropper(p):
    c, d = p["color"], p["dark"]
    body = f'''<ellipse cx="500" cy="190" rx="40" ry="50" fill="#1f2937"/>
<rect x="450" y="220" width="100" height="90" rx="10" fill="#1f2937"/>
<path d="M440 310 H560 Q640 330 650 400 V800 Q650 840 610 840 H390 Q350 840 350 800 V400 Q360 330 440 310 Z" fill="{c}"/>'''
    return body + label(p["name"], p["sub"], 500, 420, 260, d, p["species"], max_chars=10, size=36)

def tin(p):
    c, d = p["color"], p["dark"]
    body = f'''<rect x="260" y="470" width="480" height="230" fill="{d}"/>
<ellipse cx="500" cy="700" rx="240" ry="70" fill="{d}"/>
<ellipse cx="500" cy="470" rx="240" ry="70" fill="{c}"/>
<rect x="260" y="400" width="480" height="70" fill="{c}"/>
<ellipse cx="500" cy="400" rx="240" ry="70" fill="#fff"/>'''
    lines = wrap(p["name"], 16)
    txt = species_icon(p["species"], 500, 380, 0.8, c) + text_block(lines[:2], 500, 520, 36, "#fff")
    return body + txt

def box(p):
    c, d = p["color"], p["dark"]
    body = f'''<path d="M240 360 L500 280 L760 360 L500 440 Z" fill="{d}"/>
<path d="M240 360 L500 440 V830 L240 750 Z" fill="{c}"/>
<path d="M760 360 L500 440 V830 L760 750 Z" fill="{d}"/>'''
    lines = wrap(p["name"], 10)
    txt = f'<g transform="translate(370 610) skewY(17)">' + text_block(lines, 0, -110, 40, "#fff") + "</g>"
    txt += snowflake(640, 600, 1.1) if p.get("frozen") else ""
    return body + txt

# ---------- items ----------
def ball(p):
    c = p["color"]
    return f'''<circle cx="500" cy="500" r="260" fill="{c}"/>
<path d="M260 420 Q500 520 740 420 M260 580 Q500 680 740 580" stroke="#fff" stroke-width="26" fill="none" opacity=".9"/>
<circle cx="420" cy="380" r="40" fill="#fff" opacity=".35"/>
{"".join(f'<circle cx="{x}" cy="{y}" r="14" fill="{p["dark"]}"/>' for x, y in [(380,300),(620,320),(330,500),(670,500),(420,720),(590,710)])}'''

def rope(p):
    c, d = p["color"], p["dark"]
    rope_path = "M250 640 Q380 360 500 500 Q620 640 750 360"
    out = f'<path d="{rope_path}" stroke="{c}" stroke-width="70" fill="none" stroke-linecap="round"/>'
    out += f'<path d="{rope_path}" stroke="{d}" stroke-width="70" fill="none" stroke-dasharray="18 24" opacity=".45"/>'
    for x, y in [(250, 640), (750, 360)]:
        out += f'<circle cx="{x}" cy="{y}" r="85" fill="{d}"/><circle cx="{x}" cy="{y}" r="85" fill="none" stroke="{c}" stroke-width="12" stroke-dasharray="20 16"/>'
        out += "".join(f'<path d="M{x + dx} {y + 70} L{x + dx * 1.4} {y + 170}" stroke="{c}" stroke-width="16" stroke-linecap="round"/>' for dx in (-40, -15, 15, 40))
    return out

def mouse(p):
    c, d = p["color"], p["dark"]
    return f'''<path d="M680 600 Q820 640 800 760 Q790 820 720 800" stroke="{d}" stroke-width="16" fill="none" stroke-linecap="round"/>
<ellipse cx="480" cy="560" rx="240" ry="160" fill="{c}"/>
<circle cx="330" cy="420" r="80" fill="{c}"/><circle cx="330" cy="420" r="46" fill="#fda4af"/>
<circle cx="440" cy="400" r="80" fill="{c}"/><circle cx="440" cy="400" r="46" fill="#fda4af"/>
<circle cx="300" cy="540" r="16" fill="#1f2937"/><circle cx="244" cy="600" r="20" fill="#fb7185"/>
<path d="M250 610 L170 590 M250 620 L170 640" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>'''

def wand(p):
    c, d = p["color"], p["dark"]
    feathers = "".join(f'<path d="M640 360 Q{640 + dx} {360 + dy} {640 + dx * 1.6} {360 + dy * 1.6}" stroke="{col}" stroke-width="44" fill="none" stroke-linecap="round"/>'
                       for dx, dy, col in [(90, -40, "#f472b6"), (60, 60, "#38bdf8"), (110, 10, "#facc15"), (20, 100, "#a78bfa")])
    return f'''<path d="M260 820 L620 380" stroke="{d}" stroke-width="22" stroke-linecap="round"/>
<path d="M620 380 Q650 330 640 360" stroke="#1f2937" stroke-width="4" fill="none"/>{feathers}
<circle cx="640" cy="360" r="26" fill="{c}"/>'''

def scratcher(p):
    c, d = p["color"], p["dark"]
    rings = "".join(f'<path d="M420 {y} H580" stroke="#a16207" stroke-width="6" opacity=".45"/>' for y in range(300, 760, 34))
    return f'''<rect x="260" y="760" width="480" height="70" rx="16" fill="{c}"/>
<rect x="420" y="260" width="160" height="510" fill="#e7c48f"/>{rings}
<rect x="380" y="210" width="240" height="60" rx="14" fill="{c}"/>
<path d="M600 300 Q660 330 640 420" stroke="{d}" stroke-width="10" fill="none"/>
<circle cx="640" cy="440" r="28" fill="#f472b6"/>'''

def tunnel(p):
    c, d = p["color"], p["dark"]
    hoops = "".join(f'<ellipse cx="{x}" cy="520" rx="60" ry="190" fill="none" stroke="{d}" stroke-width="10" opacity=".5"/>' for x in range(330, 700, 70))
    return f'''<path d="M240 330 H720 Q800 520 720 710 H240 Z" fill="{c}"/>{hoops}
<ellipse cx="240" cy="520" rx="80" ry="190" fill="{d}"/>
<ellipse cx="240" cy="520" rx="56" ry="160" fill="#1f2937" opacity=".75"/>'''

def ring(p):
    c, d = p["color"], p["dark"]
    bumps = "".join(f'<circle cx="{500 + 225 * __import__("math").cos(a * 0.2618):.0f}" cy="{500 + 225 * __import__("math").sin(a * 0.2618):.0f}" r="18" fill="{d}"/>' for a in range(24))
    return f'<circle cx="500" cy="500" r="270" fill="{c}"/><circle cx="500" cy="500" r="140" fill="#fff"/>{bumps}<circle cx="500" cy="500" r="140" fill="none" stroke="{d}" stroke-width="10"/>'

def brush(p):
    c, d = p["color"], p["dark"]
    teeth = "".join(f'<rect x="{x}" y="560" width="10" height="70" fill="#9ca3af"/>' for x in range(260, 600, 22))
    return f'''<rect x="250" y="440" width="360" height="130" rx="30" fill="{c}"/>{teeth}
<rect x="600" y="470" width="200" height="70" rx="35" fill="{d}"/>
<circle cx="760" cy="505" r="14" fill="#fff"/>'''

def clipper(p):
    c, d = p["color"], p["dark"]
    return f'''<path d="M500 500 L330 300" stroke="#9ca3af" stroke-width="40" stroke-linecap="round"/>
<path d="M500 500 L420 270" stroke="#cbd5e1" stroke-width="40" stroke-linecap="round"/>
<path d="M500 500 L640 760" stroke="{c}" stroke-width="56" stroke-linecap="round"/>
<path d="M500 500 L740 680" stroke="{d}" stroke-width="56" stroke-linecap="round"/>
<circle cx="500" cy="500" r="26" fill="#1f2937"/>'''

def leash(p):
    c, d = p["color"], p["dark"]
    return f'''<path d="M300 260 Q200 360 300 450 Q380 380 300 260 Z" fill="none" stroke="{c}" stroke-width="40" stroke-linejoin="round"/>
<path d="M300 450 Q420 700 640 640" stroke="{c}" stroke-width="40" fill="none" stroke-linecap="round"/>
<rect x="630" y="610" width="60" height="60" rx="12" fill="#9ca3af"/>
<path d="M690 640 Q790 640 780 720 Q770 790 700 770" stroke="#9ca3af" stroke-width="22" fill="none" stroke-linecap="round"/>'''

def bed(p):
    c, d = p["color"], p["dark"]
    return f'''<ellipse cx="500" cy="640" rx="330" ry="150" fill="{d}"/>
<ellipse cx="500" cy="600" rx="330" ry="140" fill="{c}"/>
<ellipse cx="500" cy="600" rx="240" ry="90" fill="#fef3c7"/>
{"".join(f'<path d="M{x} 560 q10 -20 20 0" stroke="#fde68a" stroke-width="6" fill="none"/>' for x in range(330, 680, 40))}
{paw(500, 600, 1.2, "#fbbf24", .7)}'''

def cat_tree(p):
    c, d = p["color"], p["dark"]
    return f'''<rect x="230" y="790" width="540" height="60" rx="14" fill="{c}"/>
<rect x="320" y="320" width="70" height="480" fill="#e7c48f"/><rect x="610" y="480" width="70" height="320" fill="#e7c48f"/>
<rect x="250" y="560" width="300" height="50" rx="12" fill="{c}"/>
<rect x="520" y="440" width="260" height="50" rx="12" fill="{c}"/>
<rect x="270" y="260" width="200" height="70" rx="20" fill="{d}"/>
<circle cx="700" cy="560" r="24" fill="#f472b6"/><path d="M700 490 V536" stroke="{d}" stroke-width="6"/>'''

def ear(p):
    c, d = p["color"], p["dark"]
    return f'''<path d="M380 280 Q240 520 400 760 Q520 860 640 720 Q760 520 600 300 Q490 200 380 280 Z" fill="{c}"/>
<path d="M430 340 Q330 520 440 700 Q520 770 590 680 Q680 520 570 360 Q500 290 430 340 Z" fill="{d}" opacity=".55"/>'''

SHAPES = {k: v for k, v in globals().items() if callable(v) and k in (
    "bag pouch can tub bottle jar dropper tin box ball rope mouse wand scratcher tunnel ring brush clipper leash bed cat_tree ear").split()}

# ---------- per product ----------
PALETTE = {
    "green": ("#059669", "#047857"), "purple": ("#8b5cf6", "#6d28d9"), "orange": ("#f59e0b", "#d97706"),
    "red": ("#ef4444", "#b91c1c"), "blue": ("#38bdf8", "#0284c7"), "teal": ("#14b8a6", "#0f766e"),
    "pink": ("#f472b6", "#db2777"), "brown": ("#b45309", "#78350f"), "salmon": ("#fb7185", "#e11d48"),
    "slate": ("#64748b", "#334155"), "lime": ("#84cc16", "#4d7c0f"), "indigo": ("#6366f1", "#4338ca"),
}
BG = {"Pienso": "#ecfdf5", "Comida húmeda": "#fff7ed", "Dieta BARF": "#fef2f2", "Higiene": "#f0f9ff", "Juguete": "#fefce8",
      "Accesorio": "#f5f3ff", "Snack": "#fffbeb", "Suplemento": "#f0fdfa", "Pack": "#fef2f2"}

# handle: (shape, palette, subtitle)
SPEC = {
    "arbol": ("cat_tree", "purple", ""),
    "correa-nylon": ("leash", "red", ""),
    "cama-con-pelo": ("bed", "brown", ""),
    "lata-cordero-monoproteina-perro": ("can", "brown", "Monoproteína"),
    "lata-gato-senior-atun": ("can", "indigo", "Senior"),
    "lata-para-gatos-de-conejo": ("can", "purple", ""),
    "lata-pate-perro-adulto": ("can", "green", "400 g"),
    "sobres-gatito-pollo-salsa": ("pouch", "orange", "12 × 85 g"),
    "cuellos-pollo-barf-perro": ("tub", "orange", "1 kg"),
    "menu-barf-pollo-verduras-perro": ("tub", "red", "2 × 500 g"),
    "menu-barf-ternera-cordero-perro": ("tub", "brown", "2 × 500 g"),
    "mezcla-verduras-algas-barf-perro": ("pouch", "lime", "400 g"),
    "balsamo-almohadillas-perro": ("tin", "teal", ""),
    "cepillo-deslanador-perro-gato": ("brush", "blue", ""),
    "champu-avena-perro": ("bottle", "orange", "Avena"),
    "champu-hipoalergenico-piel-sensible-perro": ("bottle", "blue", "250 ml"),
    "cortaunas": ("clipper", "pink", ""),
    "cana-plumas-gato": ("wand", "indigo", ""),
    "cuerda-algodon-perro": ("rope", "blue", ""),
    "mordedor-denticion-cachorro": ("ring", "teal", ""),
    "pelota-mordedor-perro": ("ball", "orange", ""),
    "rascador-gato": ("scratcher", "purple", ""),
    "tunel-plegable-gato": ("tunnel", "pink", ""),
    "juguete-raton": ("mouse", "slate", ""),
    "pack-barf-iniciacion": ("box", "red", ""),
    "pienso-gatito-pollo": ("bag", "orange", "Gatito"),
    "pienso-gato-control-bolas-pelo": ("bag", "purple", "Bolas de pelo"),
    "pienso-gato-digestion-sensible-pavo": ("bag", "teal", "Digestión sensible"),
    "pienso-gato-estirilizado": ("bag", "indigo", "Esterilizado"),
    "pienso-hipoalergenico-salmon-perro": ("bag", "salmon", "Sin cereales"),
    "pienso-light-control-peso-perro": ("bag", "lime", "Light"),
    "pienso-pollo-cachorro": ("bag", "orange", "Cachorro"),
    "pienso-senior-pollo-arroz-perro": ("bag", "green", "Senior"),
    "chips-manzana-zanahoria-perro": ("pouch", "red", "Snack natural"),
    "oreja-de-cerdo": ("ear", "brown", ""),
    "snack-insecto-hipoalergenico-perro": ("pouch", "lime", "Hipoalergénico"),
    "snack-malta-gatos": ("pouch", "purple", "Malta"),
    "snack-dental-perro": ("pouch", "teal", "Dental"),
    "aceite-de-salmon": ("dropper", "salmon", "Omega 3"),
    "probiotico-digestivo-perro-gato": ("jar", "teal", "Probiótico"),
    "suplemento-articulaciones-perro-senior": ("jar", "blue", "Articulaciones"),
    "malta": ("pouch", "orange", "Pasta de malta"),
}

def clean_name(title):
    t = re.sub(r"\s*\(.*?\)", "", title).strip()
    return t[0].upper() + t[1:]

def species_of(tags):
    dog, cat = "perro" in tags, "gato" in tags or "gatito" in tags
    return "both" if dog and cat else "cat" if cat else "dog"

def render(product):
    shape, pal, sub = SPEC[product["handle"]]
    color, dark = PALETTE[pal]
    p = {"name": clean_name(product["title"]), "sub": sub, "color": color, "dark": dark,
         "species": species_of(product["tags"]), "frozen": "congelado" in product["tags"]}
    bg = BG.get(product["productType"], "#f8fafc")
    deco = paw(150, 160, 1.3, dark, .08) + paw(860, 860, 1.6, dark, .08) + paw(860, 170, .9, dark, .06)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
<rect width="1000" height="1000" fill="{bg}"/>{deco}
<ellipse cx="500" cy="870" rx="300" ry="30" fill="#000" opacity=".07"/>
{SHAPES[shape](p)}</svg>'''
    path = os.path.join(OUT, product["handle"] + ".svg")
    open(path, "w").write(svg)
    subprocess.run(["qlmanage", "-t", "-s", "1000", "-o", OUT, path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return path + ".png"

if __name__ == "__main__":
    products = [n for n in json.load(open(os.path.join(HERE, "products.json")))["data"]["products"]["nodes"] if n["handle"] in SPEC]
    only = sys.argv[1:]
    for pr in products:
        if not only or pr["handle"] in only:
            print(render(pr))
