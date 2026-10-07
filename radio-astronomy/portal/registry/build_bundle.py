#!/usr/bin/env python3
"""Bundle the public registries into a JavaScript file for the portal pages.

The JSON registries in this folder remain the source of truth. The portal pages
load a generated copy (radio-astronomy/portal/assets/js/registry-data.js) as a plain
<script>, so they also work when opened from file:// (where fetch() of local JSON
is blocked) and need no build tooling at deploy time.

Usage
  python radio-astronomy/portal/registry/build_bundle.py          # regenerate
  python radio-astronomy/portal/registry/build_bundle.py --check  # fail if out of date

Only the three public registries are bundled. Nothing from the private
local-source manifest is read.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "js" / "registry-data.js"
FILES = {
    "instruments": "instruments.json",
    "calibration": "calibration-epochs.json",
    "datasets": "datasets.json",
}


def render() -> str:
    data = {key: json.loads((HERE / name).read_text(encoding="utf-8")) for key, name in FILES.items()}
    body = json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=False)
    return (
        "/* GENERATED FILE - do not edit by hand.\n"
        " * Source of truth: radio-astronomy/portal/registry/*.json\n"
        " * Regenerate: python radio-astronomy/portal/registry/build_bundle.py */\n"
        f"window.RA_REGISTRY = {body};\n"
    )


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Bundle the public registries for the portal pages.")
    ap.add_argument("--check", action="store_true", help="exit 1 if the bundle is missing or stale")
    args = ap.parse_args(argv)
    text = render()
    if args.check:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != text:
            print(f"STALE: {OUT.relative_to(HERE.parent.parent)} does not match the registries; run build_bundle.py")
            return 1
        print("OK: registry bundle is up to date")
        return 0
    OUT.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {OUT.relative_to(HERE.parent.parent)} ({len(text) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
