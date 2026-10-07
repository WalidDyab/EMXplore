/**
 * EMXplore Radio Astronomy - student research portal renderers.
 *
 * Reads window.RA_REGISTRY (generated from radio-astronomy/registry/*.json by
 * registry/build_bundle.py) and fills elements marked with data-ra-render="...".
 * The JSON registries are the source of truth; nothing here restates their values.
 * No network requests, no dependencies.
 */
(function () {
  'use strict';

  var REG = window.RA_REGISTRY;

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  // Annotated registry value -> plain value (null when unknown)
  function val(x) {
    if (x && typeof x === 'object' && !Array.isArray(x) && 'evidence' in x) {
      return x.evidence === 'unknown' ? null : x.value;
    }
    return x;
  }
  function isInferred(x) { return x && typeof x === 'object' && x.evidence === 'inferred'; }
  function inferredTag(x) {
    return isInferred(x) ? '<span class="ra-inferred" title="' + esc(x.note || 'Inferred from analysis') + '">inferred</span>' : '';
  }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(s) {
    if (!s) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (!m) return s;
    return (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1];
  }
  function fmtRange(t) {
    if (!t || t.evidence === 'unknown') return 'Date not recorded';
    var a = fmtDate(t.start), b = fmtDate(t.end);
    if (a && b && a !== b) {
      var ya = a.slice(-4), yb = b.slice(-4);
      return (ya === yb ? a.slice(0, -5) : a) + ' – ' + b;
    }
    return a || b || 'Date not recorded';
  }
  function num(v, digits) {
    if (v == null) return '';
    return digits == null ? String(v) : Number(v).toFixed(digits);
  }
  function degSym(v) { return (v < 0 ? '−' + Math.abs(v) : v) + '°'; }

  function datasets() { return REG.datasets.datasets; }
  function dsById(id) { return datasets().filter(function (d) { return d.dataset_id === id; })[0]; }
  function epochs() { return REG.calibration.epochs; }
  function epochById(id) { return epochs().filter(function (e) { return e.calibration_id === id; })[0]; }
  function currentEpochId() { return REG.calibration.current_calibration_id; }
  function instruments() { return REG.instruments.instruments; }
  function instrumentById(id) { return instruments().filter(function (i) { return i.instrument_id === id; })[0]; }
  var LEVELS = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];

  /* ---------- vocabulary (display labels only) ---------- */

  // What kind of thing a dataset is, for students. Stage drives a colour stripe,
  // but every stage is also written out in text.
  function kindOf(d) {
    var c = d.product_class, lv = d.data_level;
    if (c === 'native_spectra') return { label: 'Native spectra', stage: 'acq' };
    if (c === 'observation_manifest') return { label: 'Pointing manifest', stage: 'acq' };
    if (c === 'resampled_spectra') return { label: 'Resampled spectra', stage: 'acq' };
    if (c === 'reduced_spectra') return { label: 'Reduced spectra', stage: 'proc' };
    if (lv === 'L4') return { label: c === 'calibrated_product' ? 'Calibrated spectral cube' : 'Spectral cube', stage: 'proc' };
    if (c === 'calibrated_product') return { label: 'Calibrated data', stage: 'proc' };
    if (c === 'derived_science_product') return { label: 'Derived science product', stage: 'sci' };
    if (c === 'curated_product') return { label: 'Curated product', stage: 'sci' };
    if (c === 'visualization') return { label: 'Visualization', stage: 'vis' };
    if (c === 'calibration_record') return { label: 'Calibration record', stage: 'rec' };
    if (c === 'calibration_report') return { label: 'Calibration report', stage: 'rec' };
    if (c === 'validation_report') return { label: 'Validation note', stage: 'rec' };
    return { label: c, stage: 'vis' };
  }
  var STAGES = [
    ['acq', 'Acquisition'], ['proc', 'Processing'], ['sci', 'Science product'],
    ['vis', 'Visualization'], ['rec', 'Record / report']
  ];
  var AVAIL = {
    available: 'Native spectra in the archive',
    partial: 'Native lineage incomplete',
    derived_only: 'Derived only – native spectra not supplied',
    not_supplied: 'Known to exist – not in the archive',
    not_applicable: 'Record / report'
  };
  var STATUS = {
    reference: 'Reference data',
    historical: 'Historical product',
    current: 'Current reference',
    showcase: 'Showcase',
    unavailable: 'Not in the archive'
  };

  function calibrationChip(id, d) {
    var inferred = d && d.calibration_assignment && d.calibration_assignment.evidence === 'inferred';
    if (id && inferred) {
      return '<a class="ra-chip ra-chip--caution" href="calibration.html#' + esc(id) + '" title="' +
        esc('Calibration not recorded in the product metadata; ' + id + ' is inferred') + '">' + esc(id) + ' · inferred, not recorded</a>';
    }
    if (!id) return '<span class="ra-chip" title="Native power or pointing data do not carry a temperature scale">No calibration scale</span>';
    var e = epochById(id);
    var cur = id === currentEpochId();
    var label = id + (cur ? ' · current reference' : ' · historical scale');
    return '<a class="ra-chip ' + (cur ? 'ra-chip--current' : 'ra-chip--historical') + '" href="calibration.html#' + esc(id) +
      '" title="' + esc(e ? e.title : id) + '">' + esc(label) + '</a>';
  }
  function coverageText(c) {
    if (!c || c.frame === 'not_applicable' || c.lon_min_deg == null) return null;
    if (c.frame === 'galactic') {
      return 'l ' + degSym(c.lon_min_deg) + ' to ' + degSym(c.lon_max_deg) + ', b ' + degSym(c.lat_min_deg) + ' to ' + degSym(c.lat_max_deg) + ' (Galactic)';
    }
    if (c.frame === 'equatorial') {
      return 'RA ' + degSym(c.lon_min_deg) + ' to ' + degSym(c.lon_max_deg) + ', Dec ' + degSym(c.lat_min_deg) + ' to ' + degSym(c.lat_max_deg);
    }
    return null;
  }
  var CLASS_TEXT = {
    native_spectra: 'native averaged spectra (not raw I/Q samples)',
    observation_manifest: 'pointing / scan manifest',
    resampled_spectra: 'native values resampled to a common frequency grid',
    reduced_spectra: 'reduced spectra on a relative scale',
    calibrated_product: 'calibrated data',
    derived_science_product: 'derived science product',
    curated_product: 'curated / corrected product',
    visualization: 'visualization',
    calibration_record: 'calibration record',
    calibration_report: 'calibration report',
    validation_report: 'validation note'
  };

  /* ---------- renderers ---------- */

  var R = {};

  // Counts shown on Start / Data Library
  R['dataset-stats'] = function (el) {
    var ds = datasets();
    var supplied = ds.filter(function (d) { return d.native_availability !== 'not_supplied'; }).length;
    var native = ds.filter(function (d) { return d.native_availability === 'available' && d.product_class === 'native_spectra'; }).length;
    var missing = ds.filter(function (d) { return d.native_availability === 'not_supplied'; }).length;
    el.innerHTML =
      '<div><strong>' + ds.length + '</strong><span>catalogued datasets and records</span></div>' +
      '<div><strong>' + supplied + '</strong><span>in the current research archive</span></div>' +
      '<div><strong>' + native + '</strong><span>campaign with native spectra and a pointing manifest (26 Aug 2026)</span></div>' +
      '<div><strong>' + missing + '</strong><span>known sessions or products not yet in the archive</span></div>';
  };

  function fact(label, q, unitText) {
    var v = val(q);
    if (v == null || v === '') return '';
    if (Array.isArray(v)) v = v.join(', ');
    return '<div><dt>' + esc(label) + '</dt><dd>' + esc(v) + (unitText ? ' ' + esc(unitText) : '') + inferredTag(q) + '</dd></div>';
  }

  R['instrument-cards'] = function (el) {
    var MODE = {
      fixed_zenith_transit: 'Fixed zenith transit (Earth rotation scans the sky)',
      raster_scan: 'Raster scans of a sky region',
      area_scan: 'Area (box) scans',
      drift_scan: 'Drift scans',
      hot_cold_calibration: 'Hot/cold (Y-factor) calibration',
      sun_cross_scan: 'Sun cross-scan pointing check',
      solar_transit: 'Solar transit',
      sky_reference_calibration: 'Sky-referenced calibration against the LAB survey'
    };
    var POINT = { fixed_zenith: 'Fixed, pointing at the zenith', az_el_motorised: 'Motorised azimuth/elevation (steerable)' };
    var only = el.getAttribute('data-instrument');
    el.innerHTML = instruments().filter(function (i) { return !only || i.instrument_id === only; }).map(function (i) {
      var active = val(i.status) === 'active';
      var d = i.dish || {}, r = i.receiver || {}, s = i.site || {};
      var modes = (i.observing_modes || []).filter(function (m) { return m.evidence === 'documented'; })
        .map(function (m) { return MODE[m.mode] || m.mode; });
      var facts =
        fact('Status', { value: active ? 'Active research telescope' : 'Historical', evidence: 'documented' }) +
        fact('Pointing', { value: POINT[val(i.pointing.capability)] || null, evidence: i.pointing.capability.evidence }) +
        fact('Dish diameter', d.diameter_m, 'm') +
        fact('Focal ratio f/D', d.focal_ratio_f_over_d) +
        fact('Feed', d.feed) +
        fact('Gain', d.gain_dbi, 'dBi (approx.)') +
        fact('Beam width (FWHM)', d.beam_fwhm_deg, '° (approx.)') +
        fact('Aperture efficiency', d.aperture_efficiency, '(Sun, 20 Sep 2026)') +
        fact('Receiver / SDR', r.sdr) +
        fact('Frequency reference', r.frequency_reference) +
        fact('Receiver temperature', r.receiver_temperature_k, 'K (20 Sep 2026)') +
        fact('Institution', s.institution);
      var unresolved = (i.unresolved || []).map(function (u) { return '<li>' + esc(u.question) + '</li>'; }).join('');
      return '<article class="ra-instr-card' + (active ? ' is-active' : '') + '" id="' + esc(i.instrument_id) + '">' +
        '<div class="ra-instr-head"><h3>' + esc(i.name) + '</h3>' +
        '<span class="ra-chip ' + (active ? 'ra-chip--current' : '') + '">' + (active ? 'Active' : 'Historical') + '</span></div>' +
        '<p>' + esc(val(i.telescope_type) || '') + '</p>' +
        '<dl class="ra-facts">' + facts + '</dl>' +
        (modes.length ? '<p class="ra-muted" style="margin-top:12px"><strong>Documented observing modes:</strong> ' + esc(modes.join(' · ')) + '</p>' : '') +
        (unresolved ? '<details class="ra-disclosure"><summary>Open documentation questions (' + i.unresolved.length + ')</summary><ul>' + unresolved + '</ul></details>' : '') +
        '</article>';
    }).join('');
  };

  // L0-L8 ladder with the supplied datasets placed on it
  R['level-ladder'] = function (el) {
    var defs = REG.datasets.data_levels;
    var NAMES = { L0: 'Native spectral acquisition', L1: 'Observation organisation', L2: 'Reduced spectra', L3: 'Calibrated spectra',
      L4: 'Spectral cubes', L5: 'Derived science products', L6: 'Curated / corrected products', L7: 'Visualization', L8: 'Independently reproduced products' };
    el.innerHTML = LEVELS.map(function (lv) {
      var here = datasets().filter(function (d) {
        return d.native_availability !== 'not_supplied' && (d.data_level === lv || (d.additional_levels || []).indexOf(lv) >= 0);
      });
      var chips = here.map(function (d) {
        return '<a class="ra-chip" href="data.html#' + esc(d.dataset_id) + '" title="' + esc(d.title) + '">' + esc(shortName(d)) + '</a>';
      }).join('');
      // Registry wording, lightly tidied for display (drop the repeated name and internal field names)
      var def = String(defs[lv] || '').replace(/^[^:]+:\s*/, '').replace(/\s*\(product_class [a-z_]+\)/, '');
      def = def.charAt(0).toUpperCase() + def.slice(1);
      return '<li class="' + (here.length ? '' : 'is-empty') + '"><span class="ra-ladder-level">' + lv + '</span>' +
        '<div class="ra-ladder-def"><strong>' + esc(NAMES[lv]) + '.</strong> ' + esc(def) +
        (here.length ? '<div class="ra-chips">' + chips + '</div>' :
          '<div class="ra-muted" style="margin-top:6px">' + (lv === 'L8' ? 'Nothing yet – this is where independently reproduced student results will appear.' : 'No supplied dataset at this level yet.') + '</div>') +
        '</div></li>';
    }).join('');
  };

  function shortName(d) {
    var date = d.observation_time && d.observation_time.start ? fmtDate(d.observation_time.start).replace(/ 2026$/, '') : '';
    var k = kindOf(d).label;
    if (d.campaign === 'full-survey') date = 'All-sky';
    var fmt = (d.file_formats || []).filter(function (f) { return f !== 'zip'; }).map(function (f) { return f.toUpperCase(); }).join('/');
    return (date ? date + ' · ' : '') + k + (fmt ? ' (' + fmt + ')' : '');
  }

  // The recommended campaign, as an ordered chain
  R['featured-chain'] = function (el) {
    var campaign = el.getAttribute('data-campaign');
    var order = ['native_spectra', 'observation_manifest', 'resampled_spectra', 'reduced_spectra', 'derived_science_product', 'visualization'];
    var list = datasets().filter(function (d) { return d.campaign === campaign; }).sort(function (a, b) {
      var ka = order.indexOf(a.product_class), kb = order.indexOf(b.product_class);
      if (ka !== kb) return ka - kb;
      return LEVELS.indexOf(a.data_level) - LEVELS.indexOf(b.data_level);
    });
    el.innerHTML = list.map(function (d) {
      var k = kindOf(d);
      return '<li class="ra-stage-' + k.stage + '"><span class="ra-lv">' + esc(d.data_level) + '</span>' +
        '<span><a href="data.html#' + esc(d.dataset_id) + '">' + esc(d.title) + '</a><span class="ra-kind">' + esc(k.label) +
        (d.calibration_id === 'C0' ? ' · C0, relative dB scale' : d.calibration_id ? ' · ' + esc(d.calibration_id) : ' · no calibration scale') + '</span></span></li>';
    }).join('');
  };

  // Dataset browser with filters
  R['dataset-browser'] = function (el) {
    var ds = datasets().slice();
    var controls =
      '<div class="ra-filters" role="group" aria-label="Filter datasets">' +
      '<label>Show<select data-f="show">' +
      '<option value="archive">In the research archive</option>' +
      '<option value="recommended">Recommended for students</option>' +
      '<option value="missing">Known but not in the archive</option>' +
      '<option value="all">Everything catalogued</option></select></label>' +
      '<label>Processing level<select data-f="level"><option value="">All levels</option>' +
      LEVELS.map(function (l) { return '<option value="' + l + '">' + l + '</option>'; }).join('') + '</select></label>' +
      '<label>Stage<select data-f="stage"><option value="">All stages</option>' +
      STAGES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('') + '</select></label>' +
      '<span class="ra-filter-count" aria-live="polite"></span></div>' +
      '<ul class="ra-stage-legend" aria-label="Stage colour key">' +
      STAGES.map(function (s) { return '<li class="ra-stage-' + s[0] + '">' + s[1] + '</li>'; }).join('') + '</ul>' +
      '<div class="ra-dslist" style="margin-top:14px"></div>';
    el.innerHTML = controls;
    var list = el.querySelector('.ra-dslist');
    list.innerHTML = ds.map(datasetRow).join('');

    function apply() {
      var show = el.querySelector('[data-f="show"]').value;
      var lv = el.querySelector('[data-f="level"]').value;
      var st = el.querySelector('[data-f="stage"]').value;
      var n = 0;
      ds.forEach(function (d) {
        var ok = true;
        if (show === 'archive') ok = d.native_availability !== 'not_supplied';
        if (show === 'recommended') ok = !!d.recommended_for_students;
        if (show === 'missing') ok = d.native_availability === 'not_supplied';
        if (ok && lv) ok = d.data_level === lv || (d.additional_levels || []).indexOf(lv) >= 0;
        if (ok && st) ok = kindOf(d).stage === st;
        var row = document.getElementById(d.dataset_id);
        if (row) row.hidden = !ok;
        if (ok) n++;
      });
      el.querySelector('.ra-filter-count').textContent = n + ' of ' + ds.length + ' shown';
    }
    el.querySelectorAll('select').forEach(function (s) { s.addEventListener('change', apply); });
    apply();

    function openFromHash() {
      var id = decodeURIComponent((location.hash || '').slice(1));
      if (!id || id.indexOf('ds-') !== 0) return;
      var row = document.getElementById(id);
      if (!row) return;
      if (row.hidden) { el.querySelector('[data-f="show"]').value = 'all'; el.querySelector('[data-f="level"]').value = ''; el.querySelector('[data-f="stage"]').value = ''; apply(); }
      el.querySelectorAll('.ra-ds.is-target').forEach(function (r) { r.classList.remove('is-target'); });
      row.open = true;
      row.classList.add('is-target');
      row.scrollIntoView({ block: 'start' });
    }
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  };

  function datasetRow(d) {
    var k = kindOf(d);
    var inst = instrumentById(d.instrument_id);
    var cov = coverageText(d.coverage);
    var target = val(d.target);
    var purpose = val(d.scientific_purpose);
    var proc = val(d.processing_status);
    var parents = (d.lineage && d.lineage.derived_from || []).map(function (id) {
      var p = dsById(id);
      return '<li><a href="#' + esc(id) + '">' + esc(p ? p.title : id) + '</a></li>';
    }).join('');
    var lims = (d.limitations || []).map(function (l) { return '<li>' + esc(val(l) || l.note || '') + inferredTag(l) + '</li>'; }).join('');
    var formats = (d.file_formats || []).filter(function (f) { return f !== 'zip'; }).map(function (f) { return f.toUpperCase(); }).join(', ');
    var chips = '<span class="ra-chips">' +
      '<span class="ra-chip" title="Processing level">' + esc(d.data_level || 'Record') + '</span>' +
      calibrationChip(d.calibration_id, d) +
      (d.recommended_for_students ? '<span class="ra-chip ra-chip--recommended">Recommended</span>' : '') +
      (d.portal_status === 'showcase' ? '<span class="ra-chip ra-chip--caution">Showcase</span>' : '') +
      '</span>';
    var rows = [
      ['What it is', esc(k.label) + ' – ' + esc(CLASS_TEXT[d.product_class] || '') + (d.additional_levels && d.additional_levels.length ? ' (also ' + esc(d.additional_levels.join(', ')) + ')' : '')],
      ['Status', esc(STATUS[d.portal_status] || d.portal_status)],
      ['Source availability', esc(AVAIL[d.native_availability] || d.native_availability) + (d.missing_source ? ' – cannot yet be reproduced from native data' : '')],
      target ? ['Target', esc(target)] : null,
      cov ? ['Sky coverage', esc(cov) + inferredTag(d.coverage)] : null,
      purpose ? ['Scientific purpose', esc(purpose)] : null,
      proc ? ['Processing', esc(proc) + inferredTag(d.processing_status)] : null,
      d.calibration_assignment && val(d.calibration_assignment) ? ['Calibration', esc(val(d.calibration_assignment)) + inferredTag(d.calibration_assignment)] : null,
      d.rederivation ? ['Re-derivation', esc(d.rederivation.method_note || '')] : null,
      formats ? ['Formats', esc(formats)] : null,
      d.student_notes ? ['For students', esc(d.student_notes)] : null,
      parents ? ['Derived from', '<ul>' + parents + '</ul>'] : null,
      lims ? ['Known limitations', '<ul>' + lims + '</ul>'] : null
    ].filter(Boolean).map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
    return '<details class="ra-ds ra-stage-' + k.stage + '" id="' + esc(d.dataset_id) + '">' +
      '<summary><div class="ra-ds-top"><span class="ra-ds-title">' + esc(d.title) + '</span>' + chips + '</div>' +
      '<div class="ra-ds-meta"><span>' + esc(fmtRange(d.observation_time)) + '</span>' +
      '<span>' + esc(inst ? inst.name : d.instrument_id) + '</span>' +
      '<span>' + esc(k.label) + '</span>' +
      '<span>' + esc(AVAIL[d.native_availability] || '') + '</span></div></summary>' +
      '<div class="ra-ds-body"><dl>' + rows + '</dl>' +
      '<p class="ra-muted" style="margin-top:12px">Dataset ID: <code>' + esc(d.dataset_id) + '</code></p></div></details>';
  }

  // Calibration history C0-C4
  R['calibration-timeline'] = function (el) {
    var PLAIN = {
      C0: 'Line strength measured in decibels above a fitted baseline. Internally consistent, but not a temperature.',
      C1: 'A single bright position was matched to the LAB survey to turn dB into kelvin. One effective number (330–480 K) absorbed both system temperature and beam efficiency, and the line was forced through zero.',
      C2: 'First Y-factor measurement: a warm wall against the cold zenith sky gave a system temperature of 179.5 K. A beam efficiency of 0.30 was taken from a comparison with LAB.',
      C3: 'A new hot-load measurement on 20 Sep gave T_sys = 895.4 K, while the conversion still used the legacy efficiency η = 0.30.',
      C4: 'Eight sky positions of known LAB brightness were measured. Fitting slope and intercept separately gave the conversion constant G and revealed an additive pedestal p that earlier scales could not detect.'
    };
    el.innerHTML = epochs().map(function (e) {
      var cur = e.calibration_id === currentEpochId();
      var vp = e.valid_period || {};
      var reason = e.superseded_reason ? val(e.superseded_reason) : null;
      var used = datasets().filter(function (d) { return d.calibration_id === e.calibration_id && d.native_availability !== 'not_supplied'; });
      return '<li class="ra-epoch' + (cur ? ' is-current' : '') + '" id="' + esc(e.calibration_id) + '">' +
        '<div class="ra-epoch-id">' + esc(e.calibration_id) + '<small>' + esc(periodText(vp)) + '</small></div>' +
        '<div><h3>' + esc(e.title.replace(/\s*-\s*CURRENT REFERENCE\s*$/i, '')) + (cur ? '<span class="ra-chip ra-chip--current">Current reference</span>' : '<span class="ra-chip ra-chip--historical">Historical scale</span>') + '</h3>' +
        '<p>' + esc(PLAIN[e.calibration_id] || '') + '</p>' +
        (e.brightness_equation ? '<span class="ra-eq">' + esc(e.brightness_equation) + '</span>' : '') +
        (reason ? '<p class="ra-muted"><strong>Why it was superseded:</strong> ' + esc(reason) + '.</p>' : '') +
        (used.length ?
          '<details class="ra-disclosure"><summary>Products on this scale in the archive (' + used.length + ')</summary><ul>' +
          used.map(function (d) { return '<li><a href="data.html#' + esc(d.dataset_id) + '">' + esc(d.title) + '</a>' +
            (d.calibration_assignment && d.calibration_assignment.evidence === 'inferred' ? ' <span class="ra-inferred">epoch inferred</span>' : '') + '</li>'; }).join('') + '</ul></details>' :
          '<p class="ra-muted"><strong>Products on this scale in the archive:</strong> none</p>') +
        '</div></li>';
    }).join('');
  };
  function periodText(vp) {
    var a = vp.start ? fmtDate(vp.start) : null, b = vp.end ? fmtDate(vp.end) : null;
    if (a && b) return a.replace(/ 2026$/, '') + ' – ' + b.replace(/ 2026$/, '');
    if (a && !b) return 'from ' + a;
    if (!a && b) return 'until ' + b;
    return '';
  }

  // Current reference parameters (C4)
  R['calibration-current'] = function (el) {
    var e = epochById(currentEpochId());
    var p = e.parameters;
    function cell(label, q, unit, digits) {
      if (!q || q.value == null) return '';
      return '<div><dt>' + label + '</dt><dd>' + esc(num(q.value, digits)) +
        (q.uncertainty != null ? ' <small>± ' + esc(num(q.uncertainty, digits)) + '</small>' : '') +
        (unit ? ' <small>' + esc(unit) + '</small>' : '') + '</dd></div>';
    }
    el.innerHTML =
      cell('Conversion constant G', p.conversion_constant_g_k, 'K') +
      cell('Pedestal p', p.pedestal_p, '', 4) +
      cell('Efficiency η', p.eta, '', 3) +
      cell('System temperature T<sub>sys</sub>', p.tsys_k, 'K', 1);
  };

  // Scatter of the eight sky-reference points with the adopted fit line
  R['calibration-fit-chart'] = function (el) {
    var e = epochById(currentEpochId());
    var pts = e.fit_data || [];
    var G = e.parameters.conversion_constant_g_k.value, P = e.parameters.pedestal_p.value;
    var W = 520, H = 340, m = { l: 58, r: 16, t: 14, b: 48 };
    var xMax = 90, yMax = 0.09;
    function X(v) { return m.l + (v / xMax) * (W - m.l - m.r); }
    function Y(v) { return H - m.b - (v / yMax) * (H - m.t - m.b); }
    var grid = '', axis = '';
    for (var x = 0; x <= xMax; x += 10) {
      grid += '<line x1="' + X(x) + '" x2="' + X(x) + '" y1="' + m.t + '" y2="' + (H - m.b) + '"/>';
      axis += '<text x="' + X(x) + '" y="' + (H - m.b + 18) + '" text-anchor="middle">' + x + '</text>';
    }
    for (var y = 0; y <= yMax + 1e-9; y += 0.01) {
      grid += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(y) + '" y2="' + Y(y) + '"/>';
      axis += '<text x="' + (m.l - 8) + '" y="' + (Y(y) + 4) + '" text-anchor="end">' + y.toFixed(2) + '</text>';
    }
    var fitAt = function (t) { return P + t / G; };
    var line = '<line x1="' + X(0) + '" y1="' + Y(fitAt(0)) + '" x2="' + X(xMax) + '" y2="' + Y(fitAt(xMax)) + '" stroke="#b7791f" stroke-width="2" stroke-linecap="round"/>';
    var dots = pts.map(function (p, i) {
      var pos = p.galactic_l_deg == null ? 'b = ' + p.galactic_b_deg + '° (l not stated)' : 'l = ' + p.galactic_l_deg + '°, b = ' + p.galactic_b_deg + '°';
      var tip = 'Point ' + p.label + ': ' + pos + '<br>LAB T<sub>B</sub> = ' + p.lab_tb_k + ' K<br>measured f = ' + p.measured_f +
        (p.elevation_deg != null ? '<br>elevation ' + (p.elevation_approximate ? '~' : '') + p.elevation_deg + '°' : '');
      return '<circle cx="' + X(p.lab_tb_k) + '" cy="' + Y(p.measured_f) + '" r="5.5" fill="#0891b2" stroke="#fff" stroke-width="2" tabindex="0" data-tip="' + esc(tip) + '"/>' +
        '<circle cx="' + X(p.lab_tb_k) + '" cy="' + Y(p.measured_f) + '" r="13" fill="transparent" data-tip="' + esc(tip) + '"/>';
    }).join('');
    // Intercept annotation with a leader line, placed in the empty region below the data
    var ax = X(0), ay = Y(P), lx = X(14), ly = Y(0.006);
    var pLabel = '<circle cx="' + ax + '" cy="' + ay + '" r="4" fill="#fff" stroke="#b7791f" stroke-width="2"/>' +
      '<line x1="' + (ax + 3) + '" y1="' + (ay + 3) + '" x2="' + (lx - 4) + '" y2="' + (ly - 4) + '" stroke="#94a3b8" stroke-width="1"/>' +
      '<text class="ra-label" x="' + lx + '" y="' + ly + '">intercept = pedestal p = ' + P + '</text>';
    var fitLabel = '';
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Measured fractional line depth f against LAB brightness temperature for the eight calibration positions, with the adopted linear fit">' +
      '<g class="ra-grid">' + grid + '</g><g class="ra-axis">' + axis +
      '<text class="ra-axis-title" x="' + ((m.l + W - m.r) / 2) + '" y="' + (H - 10) + '" text-anchor="middle">LAB survey brightness temperature T_B (K)</text>' +
      '<text class="ra-axis-title" transform="translate(16 ' + ((m.t + H - m.b) / 2) + ') rotate(-90)" text-anchor="middle">measured fractional line depth f</text></g>' +
      line + pLabel + fitLabel + dots + '</svg>';
    var rows = pts.map(function (p) {
      return '<tr><td>' + esc(p.label) + '</td><td>' + (p.galactic_l_deg == null ? 'not stated' : p.galactic_l_deg + '°') + '</td><td class="num">' +
        p.galactic_b_deg + '°</td><td class="num">' + (p.elevation_approximate ? '~' : '') + p.elevation_deg + '°</td><td class="num">' +
        p.lab_tb_k + '</td><td class="num">' + p.measured_f + '</td></tr>';
    }).join('');
    el.innerHTML = '<h3>C4 sky-reference fit (23 Sep 2026)</h3>' +
      '<ul class="ra-legend"><li><span class="ra-key-dot" aria-hidden="true"></span><span>Measured position (median of 15 samples)</span></li>' +
      '<li><span class="ra-key-line" aria-hidden="true"></span><span>Adopted fit f = p + T<sub>B</sub>/G, G = ' + G + ' K</span></li></ul>' +
      svg + '<div class="ra-tooltip" role="status"></div>' +
      '<details class="ra-disclosure"><summary>Show the eight points as a table</summary><div class="ra-table-scroll"><table class="ra-table">' +
      '<thead><tr><th>#</th><th>Galactic l</th><th class="num">b</th><th class="num">Elevation</th><th class="num">LAB T<sub>B</sub> (K)</th><th class="num">measured f</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></details>';
    var tip = el.querySelector('.ra-tooltip');
    function show(evt) {
      var t = evt.target.getAttribute('data-tip');
      if (!t) return;
      tip.innerHTML = t;
      var box = el.getBoundingClientRect(), r = evt.target.getBoundingClientRect();
      var left = r.left - box.left + r.width / 2 + 12, top = r.top - box.top - 10;
      if (left > box.width - 230) left = r.left - box.left - 230;
      tip.style.left = Math.max(8, left) + 'px';
      tip.style.top = Math.max(8, top) + 'px';
      tip.classList.add('is-on');
    }
    function hide() { tip.classList.remove('is-on'); }
    el.querySelectorAll('[data-tip]').forEach(function (c) {
      c.addEventListener('mouseenter', show);
      c.addEventListener('focus', show);
      c.addEventListener('mouseleave', hide);
      c.addEventListener('blur', hide);
    });
  };

  // Inline dataset title links: <a data-ra-dataset="ds-...">fallback</a>
  function fillDatasetLinks() {
    document.querySelectorAll('[data-ra-dataset]').forEach(function (a) {
      var d = dsById(a.getAttribute('data-ra-dataset'));
      if (!d) return;
      if (a.tagName === 'A' && !a.getAttribute('href')) a.setAttribute('href', 'data.html#' + d.dataset_id);
      if (a.hasAttribute('data-ra-title')) a.textContent = d.title;
    });
  }


  // Archive categories for the DISH222 (moving PSU telescope), grouped from the registry.
  // Status comes from native_availability only: nothing is shown as available unless the
  // registry says the files were supplied to the research archive, and nothing is a download.
  R['archive-moving'] = function (el) {
    var GROUPS = [
      { title: 'Native averaged spectra', note: 'Averaged power spectra as written by the acquisition software (L0). Not raw I/Q.', match: function (d) { return d.product_class === 'native_spectra'; } },
      { title: 'Observation manifests and pointing', note: 'Planned and commanded sky positions and times for each session (L1).', match: function (d) { return d.product_class === 'observation_manifest'; } },
      { title: 'Reduced and resampled spectra', note: 'Baseline-removed or regridded spectra, still on a relative scale (L0 resampled, L2).', match: function (d) { return d.product_class === 'reduced_spectra' || d.product_class === 'resampled_spectra'; } },
      { title: 'Calibration records and state', note: 'Calibration measurements, reports and calibrated products tied to an epoch (C0–C4).', match: function (d) { return d.product_class === 'calibration_record' || d.product_class === 'calibration_report' || d.product_class === 'calibrated_product'; } },
      { title: 'Spectral cubes', note: 'Position–position–velocity cubes (L4).', match: function (d) { return d.data_level === 'L4'; } },
      { title: 'Maps, velocity tables and curated products', note: 'Derived and curated science products (L5–L6).', match: function (d) { return d.product_class === 'derived_science_product' || d.product_class === 'curated_product'; } },
      { title: 'Plots and derived figures', note: 'Figures and renderings made from lower levels (L7).', match: function (d) { return d.product_class === 'visualization'; } },
      { title: 'Reports', note: 'Validation notes and other written records.', match: function (d) { return d.product_class === 'validation_report'; } }
    ];
    var used = {};
    el.innerHTML = GROUPS.map(function (g) {
      var list = datasets().filter(function (d) {
        if (used[d.dataset_id] || !g.match(d)) return false;
        used[d.dataset_id] = true;
        return true;
      });
      if (!list.length) return '';
      var have = list.filter(function (d) { return d.native_availability !== 'not_supplied'; });
      var wait = list.length - have.length;
      var fmts = {};
      list.forEach(function (d) { (d.file_formats || []).forEach(function (f) { if (f !== 'zip') fmts[f.toUpperCase()] = 1; }); });
      var chip = have.length
        ? '<span class="ra-status ra-status--available">Available on request</span>'
        : '<span class="ra-status ra-status--awaiting">Awaiting ingestion</span>';
      var counts = have.length + ' catalogued with files in the research archive' +
        (wait ? '; ' + wait + ' known but awaiting ingestion' : '');
      var items = list.map(function (d) {
        var tag = d.native_availability === 'not_supplied' ? ' <em>(awaiting ingestion)</em>'
          : d.native_availability === 'derived_only' ? ' <em>(native spectra not supplied)</em>'
          : d.native_availability === 'partial' ? ' <em>(native lineage incomplete)</em>' : '';
        return '<li><a href="data.html#' + esc(d.dataset_id) + '">' + esc(d.title) + '</a>' + tag + '</li>';
      }).join('');
      var fmtList = Object.keys(fmts);
      return '<article class="ra-prod' + (have.length ? '' : ' is-placeholder') + '">' +
        '<div class="ra-prod-head"><h3>' + esc(g.title) + '</h3>' + chip + '</div>' +
        '<p>' + esc(g.note) + '</p>' +
        (fmtList.length ? '<ul class="ra-formats" aria-label="File formats">' + fmtList.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '') +
        '<p class="ra-prod-note">' + esc(counts) + '. Files are not yet published for download on this site.</p>' +
        '<details><summary>Show ' + list.length + ' catalogue ' + (list.length === 1 ? 'record' : 'records') + '</summary><ul class="ra-prod-list">' + items + '</ul></details>' +
        '</article>';
    }).join('');
  };

  function run() {
    var targets = document.querySelectorAll('[data-ra-render]');
    if (!targets.length) return;
    if (!REG) {
      targets.forEach(function (el) {
        el.innerHTML = '<p class="ra-render-error">The project registry could not be loaded.</p>';
      });
      return;
    }
    targets.forEach(function (el) {
      var fn = R[el.getAttribute('data-ra-render')];
      if (!fn) return;
      try { fn(el); } catch (err) {
        el.innerHTML = '<p class="ra-render-error">This section could not be rendered from the registry.</p>';
        if (window.console) console.error('[ra-portal]', err);
      }
    });
    fillDatasetLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
