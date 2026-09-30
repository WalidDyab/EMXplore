# Radio Astronomy registries

These files are the machine-readable scientific record behind the future student portal. They describe:
- what the instruments are;
- which calibration scale every number is on;
- which datasets exist;
- where each value came from.

They are technical documentation, not portal copy.

This folder is **public**: it is tracked and will be served by the website. It holds only scientific metadata and opaque identifiers. Storage locations, private filenames and checksums of files that are not distributed are kept in a separate, git-ignored **private local-source manifest**. That manifest is never published.

| File | Contents |
|---|---|
| `instruments.json` | Instrument generations: the fixed transit network (historical), DISH1 (historical), DISH222 (active). |
| `calibration-epochs.json` | The five immutable calibration epochs C0–C4. C4 is the current reference. |
| `datasets.json` | The `sources` catalogue (opaque logical IDs) plus every dataset from the Phase 0 audit, including datasets known to exist but not supplied. |
| `schemas/*.schema.json` | JSON Schemas (Draft 2020-12). `common.schema.json` holds the shared building blocks. `local-sources.schema.json` describes the private manifest; the schema is public, the data are not. |
| `validate_registry.py` | Offline validator. |

## Public vs private provenance

Each source in `datasets.json` has a `visibility`:

| Visibility | What the public registry holds | What the private manifest holds |
|---|---|---|
| `public` | Title, repository path or DOI, and a SHA-256 checksum if the artifact itself is distributed | – |
| `private` | Opaque `source_id`, `kind` (`research_file`, `legacy_software`, `project_record`), a neutral title, and an optional `evidence_limit` | Storage path, private filenames, size and SHA-256 |

- Items inside archives are referenced publicly by an opaque `artifact_id`. The private manifest maps each `artifact_id` to its archive member and checksum.
- Sources with `evidence_limit: inferred_only` are restricted project records. They may only support values flagged `inferred`, are never quoted, and their storage mechanism is not disclosed. AI-generated analyses within them are not treated as evidence.

## Evidence

Every scientific value is an object with:
- `value`
- `evidence`:
  - **documented**: stated in, or measured directly from, a cited source;
  - **inferred**: derived by analysis, and the `note` says how;
  - **unknown**: `value` must be `null`.
- `sources`: `source_id` plus a `locator` (section, header keyword, line number, figure panel).

## Processing levels L0–L8

| Level | Meaning |
|---|---|
| L0 | Native spectral acquisition: averaged power spectra written by the acquisition software (**not raw I/Q**). `product_class: resampled_spectra` marks the same values regridded. |
| L1 | Observation organisation: manifests, pointing tracks |
| L2 | Reduced spectra: baseline/bandpass removed, relative scale |
| L3 | Calibrated spectra on a named epoch |
| L4 | Spectral cubes |
| L5 | Derived science products: maps, catalogues, velocity tables |
| L6 | Curated / corrected products: selection rules, corrections, composites |
| L7 | Visualizations |
| L8 | Independently reproduced publication products |

`product_class` separates native, resampled, reduced, calibrated, derived, curated, visualization, calibration-record and report entries. `native_availability` and `missing_source` say whether the native data needed to reproduce a product were supplied.

## The five calibration epochs

f is the fractional line excess over the baseline: f = 10^(dB/10) − 1.

| Epoch | Dates | Scale | Status |
|---|---|---|---|
| C0 | until 26 Aug 2026 | dB above fitted baseline (relative) | superseded |
| C1 | ~26 Aug – 2 Sep | T = T_sys,eff·f, T_sys,eff ≈ 330–480 K, single LAB anchor through the origin | superseded |
| C2 | 2 Sep – 20 Sep | T_sys = 179.5 K (Y = 4.40 dB), η = 0.30 → G ≈ 598 K, no pedestal | superseded |
| C3 | 20 Sep – 23 Sep | 20 Sep hot-load T_sys determination (895.4 K, Y = 1.29 dB) with the legacy η = 0.30 conversion → G = 2985 K, no pedestal | superseded |
| **C4** | from 23 Sep | **T_B = (f − p)·G, G = 1454 ± 154 K, p = 0.0174 ± 0.0042, η = 0.616, T_sys = 895.4 K** | **current** |

The full parameters, limitations and sources are in `calibration-epochs.json`. The eight sky-reference points behind C4 are stored as `fit_data`.

## Why historical products are not silently recalibrated

- A product keeps the epoch it was **made** with. The 2 Sep maps stay on C2 even though C4 is current.
- Relabelling them would erase the history students need to understand. It would also hide the fact that the underlying processing (baselines, pedestal origin, η) differed.
- The validator refuses any dataset that carries an epoch established **after** its data were taken, unless the dataset declares a `rederivation`.
- The same mechanism records one real historical case. The 1 Sep kelvin map was made with the 2 Sep (C2) calibration.

## Adding a new (e.g. student-generated) product

1. **Never edit an existing dataset's values, files or `calibration_id`.**
2. Create a new entry with a new, unique `dataset_id` (`ds-<yyyymmdd>-<region>-<what>`, lowercase, hyphens).
3. Set `lineage.derived_from` to the parent dataset IDs, and `lineage.produced_by` to the code and version used.
4. Set `data_level` and `product_class`. An independently reproduced product built from L0/L1 with documented code is L8.
5. If you express older data on a newer epoch (for example the 2 Sep T_A cube on C4), add
   `"rederivation": {"of_dataset_id": ..., "original_calibration_id": ..., "created": ..., "created_by": ..., "method_note": ...}`.
6. Record new files:
   - **Published files:** add them as `visibility: "public"` sources with path and SHA-256.
   - **Unpublished files:** add an opaque `source_id` (and `artifact_id` if needed) here, and put the path and checksum in the private manifest.
7. Run the validator.

## Running the validator

```bash
pip install jsonschema
python radio-astronomy/registry/validate_registry.py              # public checks + private manifest if present
python radio-astronomy/registry/validate_registry.py --no-local   # public checks only
```

- `--local PATH` points to the private manifest.
- `--skip-checksums` skips hashing.
- `--quiet` prints only problems.
- The validator is offline and needs no network, Qt or telescope hardware.

What each part checks:
- **Public checks:** schemas, ID cross-references, the calibration supersession chain, the no-silent-recalibration rule, restricted-source evidence limits, and a privacy lint (no private storage paths, filename-like tokens, or checksums of private files).
- **Public validation stands on its own.** Without the private manifest the run passes and prints a note.
- **With the manifest:**
  - its ID mapping is checked;
  - private files and archive members are verified by SHA-256;
  - files not present on this machine are reported as `MISSING` without failing the run;
  - the manifest's private deny-list of terms is checked against every file in this folder.

The validator exits non-zero on errors.
