#!/usr/bin/env python3
"""Validate the Radio Astronomy registries (offline, no hardware, no network).

Public checks (always run; need only the tracked registry):
  1. instruments.json, calibration-epochs.json and datasets.json against their
     JSON Schemas (schemas/*.schema.json, Draft 2020-12).
  2. Cross-references: unique IDs; referenced instrument, calibration, dataset and
     source IDs exist; calibration supersession chain is valid.
  3. Provenance rules: no silent recalibration; restricted sources may only support
     'inferred' values.
  4. Privacy lint: no private paths, filenames, storage details or checksums of
     non-distributed files in the public registry.
  5. Public files: existence and (if recorded) SHA-256 of publicly distributed sources and of
     published assets (dataset public_assets), plus asset/dataset calibration consistency.

Private checks (only when the git-ignored manifest
radio-astronomy/source/registry/local-sources.json is present):
  6. Manifest schema and ID mapping to the public registry; the manifest's private
     deny-list of terms is checked against every file in this public folder.
  7. Local private files: reported (not failed) when absent; SHA-256 and size
     verified, including members inside ZIP archives.

Usage
  python radio-astronomy/portal/registry/validate_registry.py [--no-local] [--local PATH]
                                                       [--skip-checksums] [--quiet]

Requires: Python 3.8+ and the 'jsonschema' package (pip install jsonschema).
Exit status is 0 when there are no errors (warnings and missing local files are allowed).
"""
from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

try:
    import jsonschema
    from jsonschema import Draft202012Validator
except ImportError:  # pragma: no cover
    sys.exit("jsonschema is required: pip install jsonschema")

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent.parent
RA_DIR = HERE.parent.parent  # radio-astronomy/ (used_on pages are relative to it)
SCHEMA_DIR = HERE / "schemas"
DEFAULT_LOCAL = REPO_ROOT / "radio-astronomy" / "source" / "registry" / "local-sources.json"
REGISTRIES = {
    "instruments": ("instruments.json", "instruments.schema.json"),
    "calibration-epochs": ("calibration-epochs.json", "calibration-epochs.schema.json"),
    "datasets": ("datasets.json", "datasets.schema.json"),
}
LOCAL_SCHEMA = "local-sources.schema.json"
# Product classes that define a calibration rather than carry one.
CALIBRATION_DEFINING = {"calibration_record", "calibration_report"}
# Privacy lint: file-like tokens and storage hints that must not appear in public registries.
FILENAME_RE = re.compile(
    r"[\w\-*]+\.(png|fits?|json|zip|npz|py|csv|xlsx|docx|pdf|md|jpe?g|mp4|txt|mat|h5)\b", re.I)
ALLOWED_FILENAMES = {"instruments.json", "calibration-epochs.json", "datasets.json"}
FORBIDDEN_SUBSTRINGS = ["radio-astronomy/source"]  # extra, private terms come from the manifest's privacy_denylist


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.missing: list[str] = []
        self.verified: list[str] = []
        self.notes: list[str] = []

    def error(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)


def load_json(path: Path):
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def build_validator(schema_name: str, schemas: dict):
    schema = schemas[schema_name]
    try:  # jsonschema >= 4.18
        from referencing import Registry, Resource

        registry = Registry().with_resources(
            (s["$id"], Resource.from_contents(s)) for s in schemas.values()
        )
        return Draft202012Validator(schema, registry=registry)
    except ImportError:  # older jsonschema
        store = {s["$id"]: s for s in schemas.values()}
        resolver = jsonschema.RefResolver.from_schema(schema, store=store)
        return Draft202012Validator(schema, resolver=resolver)


def validate_against(obj, schema_file: str, label: str, schemas: dict, rep: Report) -> None:
    validator = build_validator(schema_file, schemas)
    for e in sorted(validator.iter_errors(obj), key=lambda e: list(e.absolute_path)):
        loc = "/".join(str(p) for p in e.absolute_path) or "(root)"
        rep.error(f"[schema] {label} {loc}: {e.message[:300]}")


def schema_validate(data: dict, schemas: dict, rep: Report) -> None:
    for name, (data_file, schema_file) in REGISTRIES.items():
        validate_against(data[name], schema_file, data_file, schemas, rep)


def walk(obj, path=""):
    """Yield (path, dict) for every dict in a JSON tree."""
    if isinstance(obj, dict):
        yield path, obj
        for k, v in obj.items():
            yield from walk(v, f"{path}/{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk(v, f"{path}/{i}")


def strings(obj):
    if isinstance(obj, dict):
        for v in obj.values():
            yield from strings(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings(v)
    elif isinstance(obj, str):
        yield obj


def unique_ids(items, key, label, rep: Report) -> set:
    seen: set = set()
    for it in items:
        i = it.get(key)
        if i in seen:
            rep.error(f"[ids] duplicate {label} id '{i}'")
        seen.add(i)
    return seen


def date_key(s):
    """Comparable date prefix (YYYY-MM-DD) or None."""
    return s[:10] if isinstance(s, str) and len(s) >= 10 else None


def public_asset_paths(data: dict) -> set:
    return {a.get("path") for d in data["datasets"].get("datasets", []) for a in d.get("public_assets", [])}


def privacy_lint(data: dict, rep: Report) -> None:
    sources = {s["source_id"]: s for s in data["datasets"].get("sources", [])}
    published = public_asset_paths(data)  # published copies may be named by their public path
    for reg_name, reg in data.items():
        for text in strings(reg):
            if text in published:
                continue
            low = text.lower()
            for bad in FORBIDDEN_SUBSTRINGS:
                if bad in low:
                    rep.error(f"[privacy] {reg_name}: forbidden storage detail '{bad}' in: {text[:80]!r}")
            for m in FILENAME_RE.finditer(text):
                if m.group(0) not in ALLOWED_FILENAMES:
                    rep.error(f"[privacy] {reg_name}: filename-like token '{m.group(0)}' in: {text[:80]!r}")
    for d in data["datasets"].get("datasets", []):
        for f in d.get("files", []):
            src = sources.get(f.get("source_id"), {})
            if src.get("visibility") == "private" and ("sha256" in f or "bytes" in f):
                rep.error(f"[privacy] {d.get('dataset_id')}: checksum/size recorded for a private source "
                          f"'{f.get('source_id')}' (belongs in the private manifest)")


def cross_check(data: dict, rep: Report) -> None:
    instruments = data["instruments"].get("instruments", [])
    cal = data["calibration-epochs"]
    epochs = cal.get("epochs", [])
    ds_reg = data["datasets"]
    datasets = ds_reg.get("datasets", [])
    sources = ds_reg.get("sources", [])

    inst_ids = unique_ids(instruments, "instrument_id", "instrument", rep)
    cal_ids = unique_ids(epochs, "calibration_id", "calibration", rep)
    ds_ids = unique_ids(datasets, "dataset_id", "dataset", rep)
    src_ids = unique_ids(sources, "source_id", "source", rep)
    restricted = {s["source_id"] for s in sources if s.get("evidence_limit") == "inferred_only"}
    epoch_by_id = {e["calibration_id"]: e for e in epochs if "calibration_id" in e}

    # --- every referenced source exists; restricted sources only support 'inferred'
    for reg_name, reg in data.items():
        for path, d in walk(reg):
            if reg_name == "datasets" and path.startswith("/sources/"):
                continue
            sid = d.get("source_id")
            if isinstance(sid, str) and sid not in src_ids:
                rep.error(f"[refs] {reg_name}{path}: unknown source_id '{sid}'")
            refs = d.get("sources")
            if isinstance(refs, list) and "evidence" in d:
                ids = [r.get("source_id") for r in refs if isinstance(r, dict)]
                if any(i in restricted for i in ids) and d["evidence"] != "inferred":
                    rep.error(f"[provenance] {reg_name}{path}: a restricted source (inferred_only) "
                              f"supports a '{d['evidence']}' value")
                if d["evidence"] == "documented" and ids and all(i in restricted for i in ids):
                    rep.error(f"[provenance] {reg_name}{path}: 'documented' cannot rest on restricted sources alone")

    # --- instruments
    for inst in instruments:
        iid = inst.get("instrument_id")
        for rel in inst.get("relationships", []):
            if rel.get("target") not in inst_ids:
                rep.error(f"[refs] instrument {iid}: relationship target '{rel.get('target')}' unknown")
            if rel.get("target") == iid:
                rep.error(f"[refs] instrument {iid}: relationship points to itself")
        for c in inst.get("calibration_epochs", []):
            if c not in cal_ids:
                rep.error(f"[refs] instrument {iid}: calibration epoch '{c}' unknown")
    active = [i["instrument_id"] for i in instruments if i.get("status", {}).get("value") == "active"]
    if len(active) != 1:
        rep.warn(f"[instruments] expected exactly one active instrument, found {active}")

    # --- calibration epochs
    current = [e["calibration_id"] for e in epochs if e.get("status") == "current"]
    if len(current) != 1:
        rep.error(f"[calibration] exactly one epoch must be 'current', found {current}")
    if cal.get("current_calibration_id") not in current:
        rep.error(f"[calibration] current_calibration_id '{cal.get('current_calibration_id')}' "
                  "is not the epoch with status 'current'")
    for e in epochs:
        cid = e.get("calibration_id")
        if e.get("instrument_id") not in inst_ids:
            rep.error(f"[refs] epoch {cid}: instrument '{e.get('instrument_id')}' unknown")
        for field, back in (("superseded_by", "supersedes"), ("supersedes", "superseded_by")):
            other = e.get(field)
            if other is None:
                continue
            if other not in epoch_by_id:
                rep.error(f"[calibration] {cid}.{field} -> unknown epoch '{other}'")
            elif epoch_by_id[other].get(back) != cid:
                rep.error(f"[calibration] {cid}.{field}={other} but {other}.{back}={epoch_by_id[other].get(back)}")
            if other == cid:
                rep.error(f"[calibration] {cid} supersedes itself")
        nxt = e.get("superseded_by")
        if nxt in epoch_by_id:
            a = date_key(e.get("valid_period", {}).get("start"))
            b = date_key(epoch_by_id[nxt].get("valid_period", {}).get("start"))
            if a and b and b < a:
                rep.error(f"[calibration] {nxt} starts before the epoch it supersedes ({cid})")
        # G = Tsys / eta consistency (warning only; historical values are kept as recorded)
        p = e.get("parameters", {})
        try:
            ts, eta, g = p["tsys_k"]["value"], p["eta"]["value"], p["conversion_constant_g_k"]["value"]
            if None not in (ts, eta, g) and eta > 0 and abs(g - ts / eta) / g > 0.01:
                rep.warn(f"[calibration] {cid}: G={g} differs from Tsys/eta={ts / eta:.1f} by >1%")
        except (KeyError, TypeError):
            pass
    for e in epochs:  # chain must be acyclic and reach the current epoch
        seen, cur = set(), e.get("calibration_id")
        while cur is not None:
            if cur in seen:
                rep.error(f"[calibration] supersession cycle involving {cur}")
                break
            seen.add(cur)
            cur = epoch_by_id.get(cur, {}).get("superseded_by")
        if current and current[0] not in seen:
            rep.error(f"[calibration] {e.get('calibration_id')} does not lead to the current epoch")

    # --- datasets
    by_id = {d["dataset_id"]: d for d in datasets if "dataset_id" in d}
    for d in datasets:
        did = d.get("dataset_id")
        if d.get("instrument_id") not in inst_ids:
            rep.error(f"[refs] {did}: instrument '{d.get('instrument_id')}' unknown")
        cid = d.get("calibration_id")
        if cid is not None and cid not in cal_ids:
            rep.error(f"[refs] {did}: calibration '{cid}' unknown")
        for parent in d.get("lineage", {}).get("derived_from", []):
            if parent not in ds_ids:
                rep.error(f"[refs] {did}: derived_from '{parent}' unknown")
            if parent == did:
                rep.error(f"[refs] {did}: derived_from itself")
        rd = d.get("rederivation")
        if rd and rd.get("of_dataset_id") not in ds_ids:
            rep.error(f"[refs] {did}: rederivation.of_dataset_id '{rd.get('of_dataset_id')}' unknown")
        # no silent recalibration: epoch established after the data were taken
        if cid in epoch_by_id and d.get("product_class") not in CALIBRATION_DEFINING:
            est = date_key(epoch_by_id[cid].get("valid_period", {}).get("start"))
            obs = d.get("observation_time", {})
            obs_end = date_key(obs.get("end")) or date_key(obs.get("start"))
            if est and obs_end and obs_end < est and not rd:
                rep.error(f"[calibration] {did}: carries {cid} (from {est}) but data end {obs_end}; "
                          "declare a 'rederivation' and a new dataset_id instead of relabelling")
        if d.get("portal_status") == "current" and cid is not None and cid not in current:
            rep.error(f"[calibration] {did}: portal_status 'current' but calibration {cid} is superseded")
        if d.get("native_availability") == "available" and d.get("missing_source"):
            rep.error(f"[datasets] {did}: native_availability 'available' contradicts missing_source=true")
    art_seen: dict = {}
    for d in datasets:
        for f in d.get("files", []):
            aid = f.get("artifact_id")
            if aid:
                if aid in art_seen:
                    rep.error(f"[ids] artifact '{aid}' referenced by both {art_seen[aid]} and {d['dataset_id']}")
                art_seen[aid] = d["dataset_id"]

    def visit(node, stack):
        if node in stack:
            rep.error(f"[lineage] cycle: {' -> '.join(stack + [node])}")
            return
        for parent in by_id.get(node, {}).get("lineage", {}).get("derived_from", []):
            visit(parent, stack + [node])

    for did in by_id:
        visit(did, [])


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def check_file(label: str, path: Path, sha: str | None, size: int | None, rep: Report,
               skip: bool, private: bool) -> bool:
    if not path.exists():
        if private:
            rep.missing.append(f"{label}: private file not present on this machine")
        else:
            rep.error(f"[files] {label}: public file does not exist")
        return False
    if skip:
        return True
    if size is not None and path.stat().st_size != size:
        rep.error(f"[files] {label}: size {path.stat().st_size} != recorded {size}")
    if sha is not None:
        if sha256_file(path) == sha:
            rep.verified.append(label)
        else:
            rep.error(f"[files] {label}: SHA-256 mismatch")
    return True


def check_public_files(data: dict, rep: Report, skip: bool) -> None:
    for s in data["datasets"].get("sources", []):
        if s.get("visibility") == "public" and s.get("path"):
            check_file(s["source_id"], REPO_ROOT / s["path"], s.get("sha256"), s.get("bytes"), rep, skip, False)
    # Published assets: unique IDs/paths, files present with matching checksum, calibration consistent
    seen_ids, seen_paths = set(), set()
    cal_ids = {e["calibration_id"]: e for e in data["calibration-epochs"].get("epochs", [])}
    current = data["calibration-epochs"].get("current_calibration_id")
    for d in data["datasets"].get("datasets", []):
        for a in d.get("public_assets", []):
            aid, path = a["asset_id"], a["path"]
            if aid in seen_ids:
                rep.error(f"[assets] duplicate asset_id '{aid}'")
            if path in seen_paths:
                rep.error(f"[assets] path published twice: {path}")
            seen_ids.add(aid)
            seen_paths.add(path)
            check_file(aid, REPO_ROOT / path, a.get("sha256"), a.get("bytes"), rep, skip, False)
            c = a["calibration"]
            cid = c.get("calibration_id")
            if cid is not None and cid not in cal_ids:
                rep.error(f"[assets] {aid}: unknown calibration '{cid}'")
            if cid != d.get("calibration_id"):
                rep.error(f"[assets] {aid}: calibration {cid} differs from its dataset {d['dataset_id']} ({d.get('calibration_id')})")
            if cid is not None and (c["epoch_status"] == "current") != (cid == current):
                rep.error(f"[assets] {aid}: epoch_status '{c['epoch_status']}' contradicts {cid} being "
                          f"{'current' if cid == current else 'superseded'}")
            if d.get("calibration_assignment", {}).get("evidence") == "inferred" and c["evidence"] == "documented":
                rep.error(f"[assets] {aid}: calibration documented on the asset but only inferred for its dataset")
            for page in a.get("used_on", []):
                pp = RA_DIR / page
                if not pp.exists():
                    rep.error(f"[assets] {aid}: used_on page {page} does not exist")
                elif path.rsplit("/", 1)[1] not in pp.read_text(encoding="utf-8", errors="replace"):
                    rep.warn(f"[assets] {aid}: listed as used on {page} but not referenced there")


def check_local(data: dict, local: dict, schemas: dict, rep: Report, skip: bool) -> None:
    validate_against(local, LOCAL_SCHEMA, "local-sources.json", schemas, rep)
    if rep.errors:
        return
    deny = [w.lower() for w in local.get("privacy_denylist", [])]
    for reg_name, reg in data.items():
        text = json.dumps(reg, ensure_ascii=False).lower()
        for i, w in enumerate(deny):
            if w in text:
                rep.error(f"[privacy] {reg_name} registry contains private deny-list term #{i + 1}")
    for f in sorted(p for p in HERE.rglob("*") if p.is_file() and p.suffix in (".json", ".md", ".py")):
        text = f.read_text(encoding="utf-8", errors="replace").lower()
        for i, w in enumerate(deny):
            if w in text:
                rep.error(f"[privacy] {f.relative_to(HERE)} contains private deny-list term #{i + 1}")
    public = {s["source_id"]: s for s in data["datasets"].get("sources", [])}
    public_artifacts = {}
    for d in data["datasets"].get("datasets", []):
        for f in d.get("files", []):
            if f.get("artifact_id"):
                public_artifacts[f["artifact_id"]] = (f["source_id"], f)

    local_src = {}
    for s in local.get("sources", []):
        sid = s["source_id"]
        if sid not in public:
            rep.error(f"[local] source '{sid}' is not declared in datasets.json")
        elif public[sid].get("visibility") != "private":
            rep.error(f"[local] source '{sid}' is public; storage details belong in the public registry")
        local_src[sid] = s
    for sid, s in public.items():
        if s.get("visibility") == "private" and s.get("kind") in ("research_file", "legacy_software") \
                and sid not in local_src:
            rep.warn(f"[local] private source '{sid}' has no local storage entry")

    local_art = {a["artifact_id"]: a for a in local.get("artifacts", [])}
    for aid, (sid, f) in public_artifacts.items():
        a = local_art.get(aid)
        if a is None:
            rep.error(f"[local] artifact '{aid}' is referenced publicly but not mapped in local-sources.json")
        elif a["source_id"] != sid:
            rep.error(f"[local] artifact '{aid}' maps to source '{a['source_id']}', public registry says '{sid}'")
        elif "member_count" in f and a.get("member_count") not in (None, f["member_count"]):
            rep.error(f"[local] artifact '{aid}' member_count {a.get('member_count')} != public {f['member_count']}")
    for aid in local_art:
        if aid not in public_artifacts:
            rep.warn(f"[local] artifact '{aid}' is mapped locally but not referenced publicly")

    present: dict[str, Path] = {}
    for sid, s in local_src.items():
        if check_file(sid, REPO_ROOT / s["path"], s.get("sha256"), s.get("bytes"), rep, skip, True):
            present[sid] = REPO_ROOT / s["path"]
    for aid, a in local_art.items():
        container = present.get(a["source_id"])
        if container is None:
            continue
        if not zipfile.is_zipfile(container):
            rep.error(f"[local] artifact '{aid}': source '{a['source_id']}' is not a ZIP archive")
            continue
        with zipfile.ZipFile(container) as zf:
            names = zf.namelist()
            if "member_pattern" in a:
                n = len(fnmatch.filter(names, a["member_pattern"]))
                if n != a["member_count"]:
                    rep.error(f"[local] artifact '{aid}': {n} members match, expected {a['member_count']}")
                continue
            if a["member"] not in names:
                rep.error(f"[local] artifact '{aid}': member not found in its archive")
                continue
            if skip:
                continue
            blob = zf.read(a["member"])
            if "bytes" in a and len(blob) != a["bytes"]:
                rep.error(f"[local] artifact '{aid}': size {len(blob)} != {a['bytes']}")
            if "sha256" in a:
                if hashlib.sha256(blob).hexdigest() == a["sha256"]:
                    rep.verified.append(aid)
                else:
                    rep.error(f"[local] artifact '{aid}': SHA-256 mismatch")
    private_shas = {x.get("sha256") for k in ("sources", "artifacts", "private_record_files")
                    for x in local.get(k, []) if x.get("sha256")}
    for d in data["datasets"].get("datasets", []):
        for a in d.get("public_assets", []):
            if a.get("sha256") in private_shas:
                rep.error(f"[privacy] published asset {a['asset_id']} is byte-identical to a private file")
    for i, r in enumerate(local.get("private_record_files", [])):
        if r["source_id"] not in public:
            rep.error(f"[local] private record file #{i} refers to unknown source '{r['source_id']}'")
        check_file(f"{r['source_id']}#file{i + 1}", REPO_ROOT / r["path"], r.get("sha256"), r.get("bytes"),
                   rep, skip, True)


def summary(data: dict) -> list[str]:
    ds = data["datasets"]["datasets"]
    src = data["datasets"]["sources"]
    return [
        f"instruments:        {len(data['instruments']['instruments'])}",
        f"calibration epochs: {len(data['calibration-epochs']['epochs'])} "
        f"(current: {data['calibration-epochs']['current_calibration_id']})",
        f"datasets:           {len(ds)} "
        f"({sum(1 for d in ds if d['native_availability'] != 'not_supplied')} with supplied files, "
        f"{sum(1 for d in ds if d['native_availability'] == 'not_supplied')} known but not supplied)",
        f"missing_source:     {sum(1 for d in ds if d['missing_source'])}",
        f"sources:            {len(src)} "
        f"({sum(1 for s in src if s['visibility'] == 'public')} public, "
        f"{sum(1 for s in src if s['visibility'] == 'private')} private)",
    ]


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Validate the Radio Astronomy registries (offline).")
    ap.add_argument("--no-local", action="store_true", help="public validation only; ignore the private manifest")
    ap.add_argument("--local", type=Path, default=DEFAULT_LOCAL, help="path to the private local-sources.json")
    ap.add_argument("--skip-checksums", action="store_true", help="do not hash files (faster)")
    ap.add_argument("--quiet", action="store_true", help="print only problems and the result line")
    args = ap.parse_args(argv)

    rep = Report()
    schemas = {p.name: load_json(p) for p in sorted(SCHEMA_DIR.glob("*.schema.json"))}
    for s in schemas.values():
        Draft202012Validator.check_schema(s)
    data = {name: load_json(HERE / f) for name, (f, _) in REGISTRIES.items()}

    schema_validate(data, schemas, rep)
    if not rep.errors:  # cross-checks assume structurally valid input
        cross_check(data, rep)
        privacy_lint(data, rep)
        check_public_files(data, rep, args.skip_checksums)

    mode = "public only"
    if not args.no_local and not rep.errors:
        if args.local.exists():
            mode = "public + private manifest"
            check_local(data, load_json(args.local), schemas, rep, args.skip_checksums)
        else:
            rep.notes.append("private manifest not present: private-file checks skipped")

    if not args.quiet:
        print(f"Radio Astronomy registry validation ({mode})")
        for line in summary(data):
            print("  " + line)
        print(f"  checksums verified: {len(rep.verified)}")
    for n in rep.notes:
        print(f"NOTE     {n}")
    for m in rep.missing:
        print(f"MISSING  {m}")
    for w in rep.warnings:
        print(f"WARNING  {w}")
    for e in rep.errors:
        print(f"ERROR    {e}")
    status = "FAILED" if rep.errors else "OK"
    print(f"Result: {status} ({len(rep.errors)} errors, {len(rep.warnings)} warnings, "
          f"{len(rep.missing)} private files not present)")
    return 1 if rep.errors else 0


if __name__ == "__main__":
    sys.exit(main())
