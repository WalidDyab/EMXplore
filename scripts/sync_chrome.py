#!/usr/bin/env python3
"""Single source for the site chrome: global header nav, Radio Astronomy header nav, footer.

Every page carries identical, plain-HTML chrome (no build step at deploy time). This script
rewrites it from the definitions below so the copies cannot drift apart.

Usage
  python scripts/sync_chrome.py          # rewrite headers/footers in place
  python scripts/sync_chrome.py --check  # exit 1 if any page is out of date
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RA_DIR = ROOT / "radio-astronomy"

# ── Global navigation ────────────────────────────────────────────────
MAIN_NAV = [
    ("home", "Home", "index.html"),
    ("projects", "Projects", "projects.html"),
    ("courses", "Courses", "courses.html"),
    ("tools", "Tools", "tools.html"),
    ("portals", "Portals", "portals.html"),
    ("about", "About", "about.html"),
]
MAIN_KEY = {
    "index.html": "home", "projects.html": "projects", "riyadh-space-minaret.html": "projects",
    "radar-imaging.html": "projects", "courses.html": "courses", "tools.html": "tools",
    "portals.html": "portals", "about.html": "about",
}

# ── Radio Astronomy project navigation ───────────────────────────────
RA_NAV = [
    ("start", "Start Here", "start-here.html"),
    ("telescopes", "Telescopes", "telescopes.html"),
    ("data", "Data Library", "data.html"),
    ("d2s", "Data to Science", "data-to-science.html"),
    ("research", "Research", "research.html"),
    ("log", "Project Log", "log.html"),
]
RA_KEY = {
    "start-here.html": "start",
    "telescopes.html": "telescopes", "telescope-psu-fixed.html": "telescopes",
    "telescope-pnu-fixed.html": "telescopes", "telescope-psu-moving.html": "telescopes",
    "data.html": "data", "archive-psu-fixed.html": "data", "archive-pnu-fixed.html": "data",
    "archive-psu-moving.html": "data",
    "data-to-science.html": "d2s", "time-to-ra.html": "d2s", "frequency-to-velocity.html": "d2s",
    "calibration.html": "d2s", "research.html": "research", "log.html": "log",
}
# Pages whose "up" link goes somewhere other than Projects
RA_PARENT = {"lecture.html": ("Portals", "../portals.html")}

CUR = ' aria-current="page"'


def main_header(key: str) -> str:
    links = "\n".join(
        f'        <a href="{h}"{CUR if k == key else ""}>{l}</a>' for k, l, h in MAIN_NAV)
    return f'''<header class="site-header" id="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="index.html" aria-label="EMXplore home">
        <span class="brand-mark" aria-hidden="true">EM</span><span class="brand-name">Xplore</span>
      </a>

      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="sr-only">Open navigation</span>
        <span></span><span></span><span></span>
      </button>

      <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
{links}
      </nav>
    </div>
  </header>'''


def ra_header(key: str | None, parent: tuple[str, str]) -> str:
    links = "".join(f'<a href="{h}"{CUR if k == key else ""}>{l}</a>' for k, l, h in RA_NAV)
    return f'''<header class="site-header ra-portal-header" id="site-header">
    <div class="wrap header-inner ra-portal-header-inner">
      <a class="brand ra-portal-brand" href="index.html" aria-label="EMXplore Radio Astronomy overview"><span class="brand-mark" aria-hidden="true">EM</span><span class="brand-name">Xplore</span><span class="ra-brand-divider" aria-hidden="true">/</span><span class="ra-portal-name">Radio Astronomy</span></a>
      <a class="ra-parent-link" href="{parent[1]}">{parent[0]}</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="sr-only">Open Radio Astronomy navigation</span><span></span><span></span><span></span></button>
      <nav class="site-nav ra-portal-nav" id="site-nav" aria-label="Radio Astronomy primary navigation">{links}</nav>
    </div>
  </header>'''


def footer(prefix: str) -> str:
    return f'''<footer class="site-footer">
    <div class="wrap footer-simple">
      <a class="brand footer-brand" href="{prefix}index.html" aria-label="EMXplore home">
        <span class="brand-mark" aria-hidden="true">EM</span><span class="brand-name">Xplore</span>
      </a>
      <p class="footer-tagline">Discover · Learn · Experiment</p>
    </div>
    <div class="wrap">
      <p class="copyright">&copy; <span id="year">2026</span> Walid Dyab</p>
    </div>
  </footer>'''


HEADER_RE = re.compile(r'<header class="site-header[^"]*" id="site-header">.*?</header>', re.S)
FOOTER_RE = re.compile(r'<footer class="site-footer[^"]*">.*?</footer>', re.S)


def render(path: Path) -> str:
    html = path.read_text(encoding="utf-8")
    in_ra = path.parent == RA_DIR
    name = path.name
    if in_ra:
        hdr = ra_header(RA_KEY.get(name), RA_PARENT.get(name, ("Projects", "../projects.html")))
    else:
        hdr = main_header(MAIN_KEY[name])
    html, n1 = HEADER_RE.subn(lambda m: hdr, html, count=1)
    html, n2 = FOOTER_RE.subn(lambda m: footer("../" if in_ra else ""), html, count=1)
    if n1 != 1 or n2 != 1:
        raise SystemExit(f"{path.relative_to(ROOT)}: header/footer not found")
    return html


def pages():
    return sorted(list(ROOT.glob("*.html")) + list(RA_DIR.glob("*.html")))


def main() -> int:
    check = "--check" in sys.argv
    stale = []
    for p in pages():
        new = render(p)
        if new != p.read_text(encoding="utf-8"):
            stale.append(p.relative_to(ROOT).as_posix())
            if not check:
                p.write_text(new, encoding="utf-8", newline="\n")
    if check:
        if stale:
            print("Out of date:", *stale, sep="\n  ")
            return 1
        print(f"OK: chrome identical on {len(pages())} pages")
        return 0
    print(f"Rewrote {len(stale)} of {len(pages())} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
