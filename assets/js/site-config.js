/**
 * EMXplore — Central Site Configuration
 * ======================================
 * All project URLs, profile links, and external references are
 * managed here. Update this single file instead of editing HTML.
 *
 * STATUS values: 'live' | 'research' | 'educational' | 'coming-soon'
 */

const SITE_CONFIG = {

  /* ── Profile & Academic Links ────────────────────────────── */
  profiles: {
    linkedin:      'https://www.linkedin.com/in/walid-dyab-0a60b315/',
    emg:           'https://emg.psu.edu.sa',
    orcid:         '', // TODO: Insert ORCID URL, e.g. https://orcid.org/0000-000X-XXXX-XXXX
    researchgate:  'https://www.researchgate.net/profile/Walid-Dyab',
    academia:      '', // TODO: Insert Academia.edu profile URL
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
      description: 'Hydrogen-line observations, radio telescopes, outreach activities, and listening to the universe at 1420 MHz.',
      category:    '1420 MHz',
      status:      'coming-soon',
      url:         '',
      github:      '',
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
