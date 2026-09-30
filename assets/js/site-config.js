/**
 * EMXplore — Central Site Configuration
 * ======================================
 * All project URLs, profile links, and external references are
 * managed here. Update this single file instead of editing HTML.
 *
 * STATUS values: 'live' | 'research' | 'educational' | 'coming-soon'
 * RESOURCE states: 'Available' | 'Published' | 'Coming Soon' | 'In Preparation' | 'External'
 */

const SITE_CONFIG = {

  /* ── Ecosystem ───────────────────────────────────────────—
   * EMXplore is one identity delivered from two repositories:
   *   main site  → emxplore.com          (this repository)
   *   courses    → courses.emxplore.com  (emxplore-teaching repository)
   * Courses is first-class navigation, not an external resource:
   * no external-link arrow and no forced new tab.
   */
  ecosystem: {
    main:    'https://emxplore.com/',
    courses: 'https://courses.emxplore.com/',
    nav: [
      { label: 'Home',     href: 'index.html' },
      { label: 'About',    href: 'about.html' },
      { label: 'Projects', href: 'projects.html' },
      { label: 'Courses',  href: 'https://courses.emxplore.com/' },
    ],
  },

  /* ── Courses (hosted in the emxplore-teaching repository) ── */
  courses: {
    communicationSystems: {
      code:        'EE 351',
      title:       'Communication Systems',
      description: 'Signals and systems across the time and frequency domains, modulation, and communication-system analysis.',
      status:      'available',
      url:         'https://courses.emxplore.com/communication-systems/',
    },
    satelliteCommunications: {
      code:        'EE 499',
      title:       'Satellite Communications',
      description: 'Orbital mechanics, satellite geometry, propagation, antennas, communication links, spacecraft, and ground systems.',
      status:      'available',
      url:         'https://courses.emxplore.com/satellite-technologies/',
    },
    microprocessorsDesign: {
      code:        '',
      title:       'Microprocessors Design',
      description: 'A planned learning space covering microprocessor architecture, interfacing, and embedded design.',
      status:      'coming-soon',
      url:         '', // Not yet published on courses.emxplore.com
    },
  },

  /* ── Profile & Academic Links ────────────────────────────── */
  profiles: {
    linkedin:      'https://www.linkedin.com/in/walid-dyab-0a60b315/',
    emg:           'https://emg.psu.edu.sa',
    orcid:         '', // Add when available, e.g. https://orcid.org/0000-000X-XXXX-XXXX
    researchgate:  'https://www.researchgate.net/profile/Walid-Dyab',
    academia:      '', // Add when available
    github:        'https://github.com/WalidDyab',
    scholar:       'https://scholar.google.com/citations?hl=en&user=Y6nqdz0AAAAJ',
    ieee:          'https://ieeexplore.ieee.org/author/37947052100',
  },

  /* ── Projects ───────────────────────────────────────────── */
  projects: {

    hamRadio: {
      title:       'Ham Radio',
      description: 'Lectures, license preparation, reference material, and a growing portal for amateur radio communication.',
      category:    'Radio Communication',
      status:      'live',
      language:    'Arabic',
      taxonomy:    'project',   // public engineering portal — REVIEW MANUALLY before any migration
      url:         'https://waliddyab.github.io/Ham-Radio/',
      github:      'https://github.com/WalidDyab/Ham-Radio',
    },

    satelliteLecture: {
      title:       'Satellite Lecture',
      description: 'A bilingual visual portal on amateur satellite communication — tracking, antennas, Doppler correction, and student satellite missions.',
      category:    'Space Systems',
      status:      'live',
      taxonomy:    'project',   // public engineering portal — REVIEW MANUALLY (relates to, but is not, EE 499)
      url:         'https://waliddyab.github.io/satellite-lecture/',
      github:      'https://github.com/WalidDyab/satellite-lecture',
    },

    complexNumbers: {
      title:       'Complex Numbers & Phasors',
      description: 'From algebra and Argand diagrams to phasors and AC circuits, with an interactive visualizer and quiz.',
      category:    'Engineering Mathematics',
      status:      'live',
      taxonomy:    'tool',      // general engineering resource — KEEP SHARED (linkable from Courses)
      url:         'https://waliddyab.github.io/Complex-Numbers/',
      github:      'https://github.com/WalidDyab/Complex-Numbers',
    },

    /* MIGRATION CANDIDATE → courses.emxplore.com (Microprocessors Design).
     * Course-specific teaching material (EE 322 / Microprocessor Design).
     * Removed from the public Projects taxonomy in the main site; the entry is
     * retained here as the record until Phase 2 moves it to emxplore-teaching.
     * Nothing has been deleted — the module lives in its own external repository.
     */
    fsmStatistics: {
      title:       'FSM Brute-Force Statistics',
      description: 'A module on geometric distributions and search strategy for locking mechanisms, built for Microprocessor Design.',
      category:    'Engineering Education',
      status:      'live',
      taxonomy:    'course',
      migration:   'MOVE → courses.emxplore.com / microprocessors-design',
      url:         'https://waliddyab.github.io/statistical-analysis-of-FSM/',
      github:      'https://github.com/WalidDyab/statistical-analysis-of-FSM',
    },

    radioAstronomy: {
      title:       'Radio Astronomy',
      description: 'Development of a Saudi radio telescope system for H I 21-cm observations, including telescope design, automated pointing, receiver development, calibration, Galactic hydrogen observations, scientific software, data analysis, publications, and educational resources.',
      category:    'H I 21-cm Astronomy',
      status:      'live',
      taxonomy:    'project',
      url:         'radio-astronomy/',
      github:      '', // Add when available
      paper:       'https://doi.org/10.1109/MAP.2025.3621127',
      software:    '', // Add when available
      data:        'radio-astronomy/data.html',
      lecture:     'radio-astronomy/lecture.html',
      publication: {
        status: 'Published',
        title: 'An Educational Radio Telescope Optimized for Hydrogen Line Astronomy: Its implementation in academic institutes in the Kingdom of Saudi Arabia. [Education Corner]',
        authors: 'W. M. Dyab, M. S. Ibrahim, Y. M. Allawi, M. S. Darwish, T. Alrefay and P. B. Alfaisal',
        journal: 'IEEE Antennas and Propagation Magazine',
        volume: '67',
        issue: '6',
        pages: '72-95',
        date: 'Dec. 2025',
        doi: '10.1109/MAP.2025.3621127',
        doiUrl: 'https://doi.org/10.1109/MAP.2025.3621127',
        publisherUrl: 'https://doi.org/10.1109/MAP.2025.3621127',
        citation: 'W. M. Dyab, M. S. Ibrahim, Y. M. Allawi, M. S. Darwish, T. Alrefay and P. B. Alfaisal, "An Educational Radio Telescope Optimized for Hydrogen Line Astronomy: Its implementation in academic institutes in the Kingdom of Saudi Arabia. [Education Corner]," IEEE Antennas and Propagation Magazine, vol. 67, no. 6, pp. 72-95, Dec. 2025, doi: 10.1109/MAP.2025.3621127.',
        bibtex: '@article{Dyab2025EducationalRadioTelescope,\n  author = {Dyab, W. M. and Ibrahim, M. S. and Allawi, Y. M. and Darwish, M. S. and Alrefay, T. and Alfaisal, P. B.},\n  title = {An Educational Radio Telescope Optimized for Hydrogen Line Astronomy: Its implementation in academic institutes in the Kingdom of Saudi Arabia. [Education Corner]},\n  journal = {IEEE Antennas and Propagation Magazine},\n  volume = {67},\n  number = {6},\n  pages = {72--95},\n  month = dec,\n  year = {2025},\n  doi = {10.1109/MAP.2025.3621127}\n}',
      },
      softwareResources: [
        { name: 'Telescope control', purpose: 'Pointing and telescope motion/control resources.', status: 'Coming Soon', platform: '', version: '', license: '', github: '', release: '', documentation: '' },
        { name: 'SDR data acquisition', purpose: 'Receiver control and real-time spectral acquisition: the SDR produces I/Q samples, which are Fourier-transformed and averaged on the fly. Only native averaged power spectra are stored; raw I/Q is not recorded.', status: 'Coming Soon', platform: '', version: '', license: '', github: '', release: '', documentation: '' },
        { name: 'H I signal analysis', purpose: 'Analysis of the native averaged power spectra: baseline and bandpass treatment, RFI handling, H I line measurement, velocity and calibration workflows.', status: 'Coming Soon', platform: '', version: '', license: '', github: '', release: '', documentation: '' },
        { name: 'Scientific visualization', purpose: 'Plots, survey visualizations, and future data-product viewers.', status: 'Coming Soon', platform: '', version: '', license: '', github: '', release: '', documentation: '' },
      ],
      lectureDownloads: {
        powerpoint: { status: 'Coming Soon', url: '' },
        pdf: { status: 'Coming Soon', url: '' },
      },
    },

    sarIsar: {
      title:       'SAR & ISAR',
      description: 'Electromagnetic simulation, synthetic echo datasets, visualisation, and radar imaging research.',
      category:    'Radar Imaging',
      status:      'research',
      taxonomy:    'project',
      url:         '', // No dedicated page yet — do not fabricate a route.
      github:      '',
    },

    riyadhSpaceMinaret: {
      title:       'Riyadh Space Minaret',
      description: 'Radio astronomy, student projects, live telescope feeds, outreach, and space-science education.',
      category:    'Space Outreach',
      status:      'coming-soon',
      taxonomy:    'project',
      url:         '', // No dedicated page yet — do not fabricate a route.
      github:      '',
    },

    engineeringLab: {
      title:       'Engineering Lab Toolset',
      description: 'Waveguide tools, RFSoC resources, SDR experiments, electromagnetic field visualisation, and interactive utilities.',
      category:    'Simulation & Tools',
      status:      'coming-soon',
      taxonomy:    'tool',
      url:         '',
      github:      '',
    },

    waveguideSeptaTool: {
      title:       'Waveguide Septa Tool',
      description: 'An interactive calculator for stepped-impedance waveguide septa design and analysis.',
      category:    'Waveguide Design',
      status:      'coming-soon',
      taxonomy:    'tool',
      url:         '',
      github:      '',
    },

    radioTelescopeFacility: {
      title:       'Radio Telescope Facility',
      description: 'The 5 m parabolic reflector, choke-horn feed, and software-defined receiver chain used for hydrogen-line observations near 1.42 GHz.',
      category:    'Radio Telescope',
      status:      'live',
      taxonomy:    'facility',
      url:         'radio-astronomy/project.html',
      github:      '',
    },

    emgResearch: {
      title:       'EMG Research Portal',
      description: 'Electromagnetic systems, antennas, waveguides, simulations, manuscripts, and research intelligence portals.',
      category:    'Research',
      status:      'research',
      taxonomy:    'facility',
      url:         'https://emg.psu.edu.sa',
      github:      '',
    },
  },
};

window.SITE_CONFIG = SITE_CONFIG;
