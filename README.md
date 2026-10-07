# EMXplore — Explore the Fascinating World of Electromagnetics

EMXplore is a static website serving as a central gateway to electromagnetics through science, engineering, education, research, and discovery.

**Live site:** [emxplore.com](https://emxplore.com)

## Ecosystem

EMXplore is one identity delivered from two repositories:

| Direction | Site | Repository |
|---|---|---|
| Projects (research, tools, facilities) | [emxplore.com](https://emxplore.com) | this repository |
| Courses (teaching material) | [courses.emxplore.com](https://courses.emxplore.com/) | `emxplore-teaching` |

Global navigation on every main-site page is **Home | Projects | Courses | Tools | Portals | About**.
`courses.html` is an in-site hub; each course card opens `courses.emxplore.com` (a separate repository).
"Discover → Learn → Experiment" (the approach) is a section of the Home page, not a separate page.

Header navigation and the (deliberately minimal) footer are generated from one place:
`python scripts/sync_chrome.py` rewrites them on every page; `--check` fails if any page drifts.

### Information architecture

```text
EMXplore
├── Home                       index.html  (includes the Discover → Learn → Experiment section)
├── Projects                   projects.html
│   ├── Radio Astronomy        radio-astronomy/            (live)
│   ├── Riyadh Space Minaret   riyadh-space-minaret.html   (coming soon)
│   └── Radar and Imaging      radar-imaging.html          (coming soon)
├── Courses                    courses.html → courses.emxplore.com
├── Tools                      tools.html  (Complex Numbers & Phasors live; two coming soon)
├── Portals                    portals.html
│   └── Radio Astronomy Lecture (radio-astronomy/lecture.html) · Ham Radio · Satellite Lecture
└── About                      about.html

Radio Astronomy: public (radio-astronomy/)
├── index.html          project introduction ("Come aboard →" → portal/start.html)
├── lecture.html        interactive lecture (also listed under Portals)
└── publications.html · project-ar.html · campus-to-milky-way-ar.html

Radio Astronomy: member portal (radio-astronomy/portal/, protected by Cloudflare Access)
├── Start (portal/start.html: member onboarding)
├── Telescopes   → Fixed (PSU, PNU) · Moving (PSU / DISH222)
├── Data Library → A. Explore data · B. Scientific Archives
│                  (archive-psu-fixed · archive-pnu-fixed · archive-psu-moving)
├── Data to Science → time-to-ra · frequency-to-velocity · calibration
├── Research
└── Project Log  (includes the project background timeline)
```

Placeholders use the statuses *Coming soon, Planned, Awaiting ingestion, Processing, Under validation*;
nothing is shown as available, and no download link exists, unless files are actually connected.

---

## Local Preview

Open `index.html` directly in a browser, or start a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment

This project is a fully static site with no build step.

### GitHub Pages
1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Set the source to the `main` branch, root directory.
4. The site will be available at `https://<username>.github.io/<repo>/`.

### Cloudflare Pages
1. Connect the GitHub repository in Cloudflare Pages.
2. Set build command to **(leave empty)** — no build needed.
3. Set output directory to `/` (root).
4. Deploy.

### Custom Domain (emxplore.com)
Add a `CNAME` file in the root with `emxplore.com` and configure DNS records as documented by your hosting provider.

## Configuration

### Project & Profile Links

All external URLs are documented centrally in [`assets/js/site-config.js`](assets/js/site-config.js).

To add or update a link:
1. Edit `site-config.js` with the correct URL.
2. Update the corresponding HTML files where the link appears.

Links marked with `// TODO` require the user's actual profile URLs.

### Hero Banner

The main hero image is stored at `assets/images/emxplore-hero.png`. This is the site's visual identity and should not be replaced without careful consideration.

## Current Live Portals

| Resource | Section | URL |
|---|---|---|
| Radio Astronomy | Projects | [`/radio-astronomy/`](radio-astronomy/) |
| Ham Radio | Projects — portals | [waliddyab.github.io/Ham-Radio](https://waliddyab.github.io/Ham-Radio/) |
| Satellite Lecture | Projects — portals | [waliddyab.github.io/satellite-lecture](https://waliddyab.github.io/satellite-lecture/) |
| Complex Numbers & Phasors | Simulation Tools | [waliddyab.github.io/Complex-Numbers](https://waliddyab.github.io/Complex-Numbers/) |
| EMG Research Group | Lab Facilities | [emg.psu.edu.sa](https://emg.psu.edu.sa) |
| Radio Telescope Facility | Lab Facilities | [`radio-astronomy/#telescopes`](radio-astronomy/) |

### Teaching migration candidates (Phase 2 — not yet moved)

| Resource | Current location | Destination | Recommendation |
|---|---|---|---|
| FSM Brute-Force Statistics (EE 322) | external repo `statistical-analysis-of-FSM` | courses.emxplore.com → Microprocessors Design | MOVE |
| Ham Radio portal | external repo `Ham-Radio` | — | REVIEW MANUALLY |
| Satellite Lecture portal | external repo `satellite-lecture` | — | REVIEW MANUALLY |
| Complex Numbers & Phasors | external repo `Complex-Numbers` | — | KEEP SHARED |

Nothing has been deleted. `assets/js/site-config.js` records each entry with a
`taxonomy` field (`project` / `tool` / `facility` / `course`) and, where relevant,
a `migration` note.

## Updating Safely

1. **Never add external scripts, tracking, analytics, or marketing tools.**
2. **Keep all assets local.** No CDN-hosted fonts, icon libraries, or framework files.
3. **Test locally** before pushing any changes.
4. **Review with GitHub Desktop** before committing.

## License

© 2026 Dr. Walid Dyab. All rights reserved.

## Radio Astronomy Portal

The `/radio-astronomy/` section is the permanent EMXplore home for the Radio Telescope / H I 21-cm Radio Astronomy Project.

### Structure

The section is split into a **public** project introduction and a **protected member portal**. Access to `radio-astronomy/portal/` is restricted by Cloudflare Access (authorized members, by email). Authentication is not implemented in the HTML; the protection is a path rule on the host, so everything that must stay private has to live under `portal/`.

```text
radio-astronomy/
├── index.html                  # PUBLIC project introduction
├── lecture.html                # PUBLIC 52-slide interactive lecture (linked from Portals)
├── publications.html           # PUBLIC IEEE publication citation, DOI, and BibTeX
├── project-ar.html             # PUBLIC Arabic formal project overview
├── campus-to-milky-way-ar.html # PUBLIC Arabic feature story
├── assets/                     # PUBLIC shared assets: CSS, lecture/KaTeX scripts, vendor/katex,
│   │                           #   images/lecture/, and the one figure used on the public page
│   └── images/research/dish222-2026-08-26-outer-galaxy-skymap.png
├── source/                     # Private authoring material (git-ignored, never deployed)
└── portal/                     # PROTECTED (members only)
    ├── start.html              # member onboarding
    ├── telescopes.html · telescope-psu-fixed.html · telescope-pnu-fixed.html · telescope-psu-moving.html
    ├── data.html · archive-psu-fixed.html · archive-pnu-fixed.html · archive-psu-moving.html
    ├── data-to-science.html · time-to-ra.html · frequency-to-velocity.html · calibration.html
    ├── research.html · log.html · resources.html · software.html
    ├── registry/               # scientific registries (JSON), schemas, validator, bundle builder
    └── assets/
        ├── js/                 # registry-data.js (generated bundle) and ra-portal.js
        └── images/research/    # member-only science figures
```

Rules for assets: shared CSS/JS/images that contain no private information stay in `radio-astronomy/assets/`; registry data, archive records and internal science products live under `portal/`. Do not place JSON/data files in the public `assets/` directory.

### Radio Astronomy page roles

- `index.html` (public) answers "what is this project and why does it matter?": telescopes, historical data, the reprocessing plan, and how students take part. Its CTA is `Come aboard →` to `portal/start.html`.
- `portal/start.html` answers "I am on the team; what do I need to know and do?": a map of the portal, project status, a catch-up path and how to contribute.
- `portal/data.html` presents the Data Library; the `archive-*` pages expose dataset lineage.
- `publications.html` presents the IEEE publication, DOI, copyable citation, and BibTeX. It links to the DOI/publisher page only.
- `portal/software.html` defines future software categories: telescope control, SDR acquisition, H I signal analysis, and visualization.
- `portal/resources.html` organizes resources into Learn, Research, Software, Data, and Project Material.
- `project-ar.html` and `campus-to-milky-way-ar.html` are the two restrained Arabic resource pages.
- `lecture.html` is the stable detailed educational layer and should not be redesigned during hub updates.

Page chrome is generated by `python scripts/sync_chrome.py` (use `--check` to verify): public pages get the global header, portal pages get the Radio Astronomy portal header with the Start / Telescopes / Data Library / Data to Science / Research / Project Log navigation.

### Publication configuration

Publication metadata is centralized in `assets/js/site-config.js` under `SITE_CONFIG.projects.radioAstronomy.publication`.

Current public publication:

```text
W. M. Dyab, M. S. Ibrahim, Y. M. Allawi, M. S. Darwish, T. Alrefay and P. B. Alfaisal,
"An Educational Radio Telescope Optimized for Hydrogen Line Astronomy: Its implementation in academic institutes in the Kingdom of Saudi Arabia. [Education Corner],"
IEEE Antennas and Propagation Magazine, vol. 67, no. 6, pp. 72-95, Dec. 2025,
doi: 10.1109/MAP.2025.3621127.
```

To add another publication:

1. Add the metadata to `assets/js/site-config.js`.
2. Add a publication card to `radio-astronomy/publications.html`.
3. Link to the publisher DOI page unless the author explicitly approves hosting a local public file.

### Software-resource configuration

Software categories are configured under `SITE_CONFIG.projects.radioAstronomy.softwareResources`.

Use these fields when real resources are supplied:

```text
Name, Purpose, GitHub, Release / Download, Documentation, Platform, Version, License, Status
```

Keep unknown values visitor-safe as `Coming Soon`. Do not create fake GitHub, release, or documentation URLs.

### Dataset configuration

Dataset metadata is configured under `SITE_CONFIG.projects.radioAstronomy.datasets`.

Use these fields when public datasets are supplied:

```text
Dataset title, Description, Observation type, Coordinates, Frequency coverage, Format, Size, Download, Documentation, Usage / citation
```

The public data page distinguishes available datasets from planned/in-preparation products. Do not link private working data unless explicitly approved.

### Project assets and source material

- Public images belong in `radio-astronomy/assets/images/`; member-only science figures belong in `radio-astronomy/portal/assets/images/`.
- Lecture slide exports belong in `radio-astronomy/assets/images/lecture/`.
- Private authoring/source files belong in `radio-astronomy/source/`.
- The IEEE PDF, source DOCX files, and source PowerPoint should not be linked publicly unless explicitly authorized.

### Future lecture downloads

The HTML lecture is public. PowerPoint and PDF download states are prepared in `SITE_CONFIG.projects.radioAstronomy.lectureDownloads`, but the public download URLs remain disabled until explicitly approved.

### Updating lecture slides

1. Update `radio-astronomy/source/radio_telescope-lecture.pptx`.
2. Export slides with Microsoft PowerPoint as `radio-astronomy/assets/images/lecture/slide-001.png` through `slide-052.png`.
3. Update the matching `<article class="ra-slide" id="slide-001">` section in `lecture.html`.
4. Keep slide anchors stable so student links do not break.
5. Keep Arabic development-story slides RTL and preserve established scientific notation such as H I, `T_A`, `T_B`, RA/Dec, and `v_LSR`.

Unknown repository, software, lecture-download, and dataset URLs are centralized in `assets/js/site-config.js` as empty unavailable values. Do not fabricate external links.
