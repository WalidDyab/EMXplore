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
      url:         'https://waliddyab.github.io/Ham-Radio/',
      github:      'https://github.com/WalidDyab/Ham-Radio',
    },

    satelliteLecture: {
      title:       'Satellite Lecture',
      description: 'A bilingual visual portal on amateur satellite communication — tracking, antennas, Doppler correction, and student satellite missions.',
      category:    'Space Systems',
      status:      'live',
      url:         'https://waliddyab.github.io/satellite-lecture/',
      github:      'https://github.com/WalidDyab/satellite-lecture',
    },

    complexNumbers: {
      title:       'Complex Numbers & Phasors',
      description: 'From algebra and Argand diagrams to phasors and AC circuits, with an interactive visualizer and quiz.',
      category:    'Engineering Mathematics',
      status:      'live',
      url:         'https://waliddyab.github.io/Complex-Numbers/',
      github:      'https://github.com/WalidDyab/Complex-Numbers',
    },

    fsmStatistics: {
      title:       'FSM Brute-Force Statistics',
      description: 'A module on geometric distributions and search strategy for locking mechanisms, built for Microprocessor Design.',
      category:    'Engineering Education',
      status:      'live',
      url:         'https://waliddyab.github.io/statistical-analysis-of-FSM/',
      github:      'https://github.com/WalidDyab/statistical-analysis-of-FSM',
    },

    radioAstronomy: {
      title:       'Radio Astronomy',
      description: 'Development of a Saudi radio telescope system for H I 21-cm observations, including telescope design, automated pointing, receiver development, calibration, Galactic hydrogen observations, scientific software, data analysis, publications, and educational resources.',
      category:    'H I 21-cm Astronomy',
      status:      'live',
      url:         'radio-astronomy/',
      github:      '', // Add when available
      paper:       'https://doi.org/10.1109/MAP.2025.3621127',
      software:    '', // Add when available
      data:        '', // Add when available
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
        { name: 'SDR data acquisition', purpose: 'Receiver sampling and spectral acquisition resources.', status: 'Coming Soon', platform: '', version: '', license: '', github: '', release: '', documentation: '' },
        { name: 'H I signal analysis', purpose: 'I/Q processing, FFT, averaging, calibration, and H I line analysis workflows.', status: 'Coming Soon', platform: '', version: '', license: '', github: '', release: '', documentation: '' },
        { name: 'Scientific visualization', purpose: 'Plots, survey visualizations, and future data-product viewers.', status: 'Coming Soon', platform: '', version: '', license: '', github: '', release: '', documentation: '' },
      ],
      datasets: [
        { title: 'Raw receiver output', description: 'Receiver captures before public packaging.', status: 'In Preparation', observationType: 'Receiver acquisition', coordinates: 'In preparation', frequencyCoverage: 'H I observing band', format: '', size: '', download: '', documentation: '' },
        { title: 'H I spectra', description: 'Spectral products after FFT, averaging, and processing.', status: 'In Preparation', observationType: 'Hydrogen-line spectrum', coordinates: 'In preparation', frequencyCoverage: 'Near 1.42 GHz', format: '', size: '', download: '', documentation: '' },
        { title: 'Position / velocity products', description: 'Future science products connecting sky coordinates and velocity.', status: 'Coming Soon', observationType: 'H I line product', coordinates: 'RA / Dec planned', frequencyCoverage: '', format: '', size: '', download: '', documentation: '' },
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
      url:         '',
      github:      '',
    },

    riyadhSpaceMinaret: {
      title:       'Riyadh Space Minaret',
      description: 'Radio astronomy, student projects, live telescope feeds, outreach, and space-science education.',
      category:    'Space Outreach',
      status:      'coming-soon',
      url:         '',
      github:      '',
    },

    engineeringLab: {
      title:       'Engineering Lab',
      description: 'Waveguide tools, RFSoC resources, SDR experiments, electromagnetic field visualisation, and interactive utilities.',
      category:    'Simulation & Tools',
      status:      'coming-soon',
      url:         '',
      github:      '',
    },

    emgResearch: {
      title:       'EMG Research Portal',
      description: 'Electromagnetic systems, antennas, waveguides, simulations, manuscripts, and research intelligence portals.',
      category:    'Research',
      status:      'research',
      url:         'https://emg.psu.edu.sa',
      github:      '',
    },
  },
};

window.SITE_CONFIG = SITE_CONFIG;
