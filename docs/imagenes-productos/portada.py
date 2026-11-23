# Provisional home banner illustration (UX-04), 2400 x 1000: dog fresh from the bath, cat,
# a food bag and grooming tools on the right; the left side stays calm for the text box.
# SVG -> PNG with qlmanage (macOS). Output: out/portada.png
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
W, H = 2400, 1000

GREEN, DARK, CREAM = "#047857", "#065f46", "#fdf6ec"


def paw(cx, cy, s, fill, op):
    return f'''<g transform="translate({cx},{cy}) scale({s}) rotate(-15)" fill="{fill}" opacity="{op}">
<ellipse cx="0" cy="14" rx="22" ry="18"/><ellipse cx="-24" cy="-10" rx="9" ry="12"/><ellipse cx="-8" cy="-24" rx="9" ry="12"/>
<ellipse cx="8" cy="-24" rx="9" ry="12"/><ellipse cx="24" cy="-10" rx="9" ry="12"/></g>'''


def bubble(cx, cy, r):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#ffffff" opacity=".85" stroke="#7dd3fc" stroke-width="4"/><circle cx="{cx - r * .35}" cy="{cy - r * .35}" r="{r * .22}" fill="#ffffff"/>'


dog = f'''<g transform="translate(1640 560)">
  <!-- tail -->
  <path d="M170 250 Q300 200 280 90" stroke="#d97706" stroke-width="44" fill="none" stroke-linecap="round"/>
  <!-- body -->
  <ellipse cx="60" cy="300" rx="190" ry="170" fill="#f59e0b"/>
  <ellipse cx="20" cy="330" rx="110" ry="120" fill="#fde68a"/>
  <!-- legs -->
  <rect x="-70" y="380" width="70" height="130" rx="35" fill="#f59e0b"/>
  <rect x="40" y="380" width="70" height="130" rx="35" fill="#f59e0b"/>
  <ellipse cx="-35" cy="505" rx="52" ry="26" fill="#fde68a"/>
  <ellipse cx="75" cy="505" rx="52" ry="26" fill="#fde68a"/>
  <!-- head -->
  <path d="M-185 -40 Q-260 120 -190 230 Q-140 250 -130 140 Z" fill="#b45309"/>
  <path d="M185 -40 Q260 120 190 230 Q140 250 130 140 Z" fill="#b45309"/>
  <circle cx="0" cy="40" r="185" fill="#f59e0b"/>
  <ellipse cx="0" cy="120" rx="105" ry="85" fill="#fde68a"/>
  <ellipse cx="0" cy="75" rx="40" ry="30" fill="#1f2937"/>
  <path d="M0 105 Q0 150 -40 160 M0 105 Q0 150 40 160" stroke="#1f2937" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M-22 158 Q0 210 22 158 Z" fill="#fb7185"/>
  <circle cx="-70" cy="0" r="22" fill="#1f2937"/><circle cx="70" cy="0" r="22" fill="#1f2937"/>
  <circle cx="-62" cy="-8" r="7" fill="#fff"/><circle cx="78" cy="-8" r="7" fill="#fff"/>
  <ellipse cx="-110" cy="60" rx="22" ry="12" fill="#fb7185" opacity=".5"/><ellipse cx="110" cy="60" rx="22" ry="12" fill="#fb7185" opacity=".5"/>
  <!-- bow -->
  <path d="M-40 -150 L-110 -190 L-110 -110 Z M40 -150 L110 -190 L110 -110 Z" fill="{GREEN}"/>
  <circle cx="0" cy="-150" r="30" fill="{DARK}"/>
</g>'''

cat = '''<g transform="translate(2080 680)">
  <path d="M110 300 Q230 300 210 170 Q200 110 150 120" stroke="#6d28d9" stroke-width="34" fill="none" stroke-linecap="round"/>
  <ellipse cx="0" cy="230" rx="130" ry="150" fill="#8b5cf6"/>
  <ellipse cx="0" cy="260" rx="70" ry="100" fill="#ede9fe"/>
  <ellipse cx="-50" cy="370" rx="45" ry="24" fill="#ede9fe"/><ellipse cx="50" cy="370" rx="45" ry="24" fill="#ede9fe"/>
  <path d="M-110 -40 L-100 -170 L-20 -95 Z M110 -40 L100 -170 L20 -95 Z" fill="#8b5cf6"/>
  <path d="M-95 -60 L-90 -135 L-45 -95 Z M95 -60 L90 -135 L45 -95 Z" fill="#f9a8d4"/>
  <circle cx="0" cy="0" r="125" fill="#8b5cf6"/>
  <ellipse cx="-45" cy="-10" rx="16" ry="24" fill="#1f2937"/><ellipse cx="45" cy="-10" rx="16" ry="24" fill="#1f2937"/>
  <circle cx="-40" cy="-18" r="6" fill="#fff"/><circle cx="50" cy="-18" r="6" fill="#fff"/>
  <path d="M-14 30 L14 30 L0 46 Z" fill="#f9a8d4"/>
  <path d="M0 46 Q-10 66 -30 60 M0 46 Q10 66 30 60" stroke="#1f2937" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M-40 40 L-130 25 M-40 52 L-130 62 M40 40 L130 25 M40 52 L130 62" stroke="#ede9fe" stroke-width="5" stroke-linecap="round"/>
</g>'''

bag = f'''<g transform="translate(1230 610)">
  <path d="M-130 0 Q0 -14 130 0 L150 400 Q0 420 -150 400 Z" fill="#059669"/>
  <path d="M-130 0 Q0 -14 130 0 L132 40 Q0 26 -132 40 Z" fill="{DARK}"/>
  <path d="M-124 -16 L124 -16 L130 2 Q0 -12 -130 2 Z" fill="{DARK}"/>
  <rect x="-95" y="90" width="190" height="200" rx="18" fill="#fff"/>
  {paw(0, 150, 1.1, GREEN, 1)}
  <rect x="-60" y="215" width="120" height="16" rx="8" fill="#d1fae5"/>
  <rect x="-45" y="245" width="90" height="14" rx="7" fill="#d1fae5"/>
</g>'''

tools = f'''<g transform="translate(1330 330) rotate(-20)">
  <path d="M0 0 L-110 -150" stroke="#9ca3af" stroke-width="22" stroke-linecap="round"/>
  <path d="M0 0 L-40 -175" stroke="#cbd5e1" stroke-width="22" stroke-linecap="round"/>
  <circle cx="35" cy="55" r="34" fill="none" stroke="{GREEN}" stroke-width="16"/>
  <circle cx="-30" cy="70" r="34" fill="none" stroke="{GREEN}" stroke-width="16"/>
  <circle cx="0" cy="0" r="12" fill="#1f2937"/>
</g>
<g transform="translate(2170 300) rotate(15)">
  <rect x="-120" y="-30" width="240" height="60" rx="18" fill="#f472b6"/>
  {"".join(f'<rect x="{x}" y="28" width="12" height="60" rx="5" fill="#f472b6"/>' for x in range(-110, 110, 24))}
</g>'''

bubbles = "".join(bubble(x, y, r) for x, y, r in [(1500, 300, 46), (1580, 220, 28), (1880, 250, 36), (1960, 330, 22), (1770, 180, 20), (2290, 560, 30), (1420, 470, 24)])
deco = "".join(paw(x, y, s, DARK, op) for x, y, s, op in [(180, 160, 1.6, .05), (420, 900, 2.2, .05), (860, 220, 1.2, .05), (980, 960, 1.5, .05), (2300, 980, 1.8, .07)])

# qlmanage renders a square: draw on a W x W canvas with the scene centred, then crop the centre.
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{W}" viewBox="0 0 {W} {W}">
<g transform="translate(0 {(W - H) // 2})">
<rect width="{W}" height="{H}" fill="{CREAM}"/>
{deco}
<g transform="translate({W} {H}) scale(0.86) translate(-2400 -1100)">
<path d="M1050 1100 Q980 640 1260 360 Q1560 60 2050 120 Q2400 160 2400 160 L2400 1100 Z" fill="#d1fae5"/>
<circle cx="1980" cy="250" r="120" fill="#fef3c7"/>
<ellipse cx="1720" cy="1080" rx="760" ry="70" fill="{DARK}" opacity=".12"/>
{bubbles}
{tools}
{bag}
{dog}
{cat}
</g>
</g>
</svg>'''

path = os.path.join(OUT, "portada.svg")
open(path, "w").write(svg)
subprocess.run(["qlmanage", "-t", "-s", str(W), "-o", OUT, path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
final = os.path.join(OUT, "portada.png")
os.replace(path + ".png", final)
subprocess.run(["sips", "-c", str(H), str(W), final], stdout=subprocess.DEVNULL)
print(os.path.join(OUT, "portada.png"))
