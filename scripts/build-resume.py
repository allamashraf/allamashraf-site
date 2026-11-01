"""Build the public one-page resume. Requires reportlab; no network or private inputs.

Run: python3 scripts/build-resume.py
The checked-in PDF ships as a static download; Python is not required by the site build.
"""
import json
from html import escape
from pathlib import Path
import reportlab

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "src/content/resume.json").read_text())
OUT = ROOT / "public/resume/Allam-Ashraf-Resume.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path(reportlab.__file__).parent / "fonts"
pdfmetrics.registerFont(TTFont("ResumeSans", str(FONT_DIR / "Vera.ttf")))
pdfmetrics.registerFont(TTFont("ResumeSans-Bold", str(FONT_DIR / "VeraBd.ttf")))
pdfmetrics.registerFontFamily("ResumeSans", normal="ResumeSans", bold="ResumeSans-Bold", italic="ResumeSans", boldItalic="ResumeSans-Bold")

INK = colors.HexColor("#172126")
MUTED = colors.HexColor("#46555c")
ACCENT = colors.HexColor("#345842")
styles = {
    "name": ParagraphStyle("Name", fontName="Helvetica-Bold", fontSize=25, leading=29, textColor=INK, spaceAfter=5),
    "headline": ParagraphStyle("Headline", fontName="Helvetica-Bold", fontSize=10.2, leading=14, textColor=ACCENT, spaceAfter=7),
    "body": ParagraphStyle("Body", fontName="Helvetica", fontSize=9.4, leading=13.1, textColor=INK, spaceAfter=5),
    "small": ParagraphStyle("Small", fontName="Helvetica", fontSize=8.7, leading=12, textColor=MUTED, spaceAfter=3),
    "section": ParagraphStyle("Section", fontName="Helvetica-Bold", fontSize=9.1, leading=13, textColor=ACCENT, spaceBefore=10, spaceAfter=6),
    "item": ParagraphStyle("Item", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=INK, spaceAfter=2),
    "bullet": ParagraphStyle("Bullet", fontName="Helvetica", fontSize=9.4, leading=13.1, textColor=INK, leftIndent=10, firstLineIndent=-8, spaceAfter=4),
}
for style in styles.values():
    style.fontName = "ResumeSans-Bold" if style.fontName.endswith("Bold") else "ResumeSans"

def p(text, style="body"):
    return Paragraph(text, styles[style])

def link(label, url):
    return f'<a href="{escape(url, quote=True)}" color="#345842"><u>{escape(label)}</u></a>'

story = [p(escape(DATA["name"]), "name"), p(escape(DATA["headline"]), "headline")]
story.append(p(f'{escape(DATA["location"])} | {link(DATA["email"], "mailto:" + DATA["email"])} | {link("allamashraf.dev", DATA["website"])}', "small"))
story.append(p(f'{link("github.com/allamashraf", DATA["github"])} | {link("linkedin.com/in/allam-ashraf", DATA["linkedin"])}', "small"))
story.extend([Spacer(1, 7), p(escape(DATA["summary"]))])
story.append(p("EXPERIENCE", "section"))
for item in DATA["experience"]:
    block = [p(f'{escape(item["org"])} <font color="#46555c">| {escape(item["period"])}</font>', "item"), p(escape(item["role"]), "small")]
    block.extend(p("- " + escape(b), "bullet") for b in item["bullets"])
    story.append(KeepTogether(block))
story.append(p("SELECTED PROJECTS", "section"))
for item in DATA["projects"]:
    story.append(KeepTogether([p(link(item["name"], item["url"]), "item"), p(escape(item["status"]), "small"), p(escape(item["text"]))]))
story.extend([p("TECHNICAL SKILLS", "section"), p(escape(DATA["skills"])), p("EDUCATION", "section"), p(escape(DATA["education"])), Spacer(1, 4), p(escape(DATA["availability"]), "small")])

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=43, leftMargin=43, topMargin=35, bottomMargin=35, title="Allam Ashraf - Resume", author=DATA["name"], subject="GTM engineering, frontend development and lead automation", pageCompression=1, invariant=1)
doc.build(story)
print(OUT)
