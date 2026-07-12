# EMXplore — Explore the Fascinating World of Electromagnetics

EMXplore is a static website serving as a central gateway to electromagnetics through science, engineering, education, research, and discovery.

**Live site:** [emxplore.com](https://emxplore.com)

---

## Project Structure

```
EMXplore/
├── index.html                 # Homepage
├── projects.html              # Projects & Portals
├── about.html                 # About EMXplore
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── style.css          # All styles
    ├── js/
    │   ├── main.js            # Navigation, hero animation, utilities
    │   └── site-config.js     # Central link/project configuration
    └── images/
        ├── emxplore-hero.png  # Hero banner image
        └── favicon.svg        # Site favicon
```

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

| Project | URL |
|---|---|
| Ham Radio | [waliddyab.github.io/Ham-Radio](https://waliddyab.github.io/Ham-Radio/) |
| Satellite Lecture | [waliddyab.github.io/satellite-lecture](https://waliddyab.github.io/satellite-lecture/) |
| Complex Numbers & Phasors | [waliddyab.github.io/Complex-Numbers](https://waliddyab.github.io/Complex-Numbers/) |
| FSM Statistics | [waliddyab.github.io/statistical-analysis-of-FSM](https://waliddyab.github.io/statistical-analysis-of-FSM/) |
| EMG Research | [emg.psu.edu.sa](https://emg.psu.edu.sa) |

## Updating Safely

1. **Never add external scripts, tracking, analytics, or marketing tools.**
2. **Keep all assets local.** No CDN-hosted fonts, icon libraries, or framework files.
3. **Test locally** before pushing any changes.
4. **Review with GitHub Desktop** before committing.

## License

© 2026 Dr. Walid Dyab. All rights reserved.
