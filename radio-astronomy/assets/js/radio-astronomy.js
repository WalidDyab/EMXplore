(function () {
  'use strict';

  var radioConfig = window.SITE_CONFIG &&
    window.SITE_CONFIG.projects &&
    window.SITE_CONFIG.projects.radioAstronomy;

  function setText(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach(function (element) {
      element.textContent = value;
    });
  }

  function setHref(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach(function (element) {
      element.setAttribute('href', value);
      if (/^https?:\/\//.test(value)) {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  function statusClass(status) {
    var normalized = (status || '').toLowerCase();
    if (normalized === 'published' || normalized === 'available') return 'ra-status-published';
    if (normalized === 'external') return 'ra-status-external';
    if (normalized === 'in preparation') return 'ra-status-prep';
    return 'ra-status-coming';
  }

  function renderPublication() {
    var publication = radioConfig && radioConfig.publication;
    if (!publication) return;

    setText('[data-ra-publication="title"]', publication.title);
    setText('[data-ra-publication="authors"]', publication.authors);
    setText('[data-ra-publication="journal"]', publication.journal);
    setText('[data-ra-publication="volumeIssue"]', 'Vol. ' + publication.volume + ', no. ' + publication.issue);
    setText('[data-ra-publication="pages"]', publication.pages);
    setText('[data-ra-publication="date"]', publication.date);
    setText('[data-ra-publication="doi"]', publication.doi);
    setText('[data-ra-publication="citation"]', publication.citation);
    setText('[data-ra-publication="bibtex"]', publication.bibtex);
    setHref('[data-ra-publication-url]', publication.publisherUrl || publication.doiUrl);
  }

  function renderSoftware() {
    var target = document.querySelector('[data-ra-software-list]');
    if (!target || !radioConfig || !Array.isArray(radioConfig.softwareResources)) return;

    target.innerHTML = radioConfig.softwareResources.map(function (item) {
      return '<tr>' +
        '<td>' + item.name + '</td>' +
        '<td>' + item.purpose + '</td>' +
        '<td>' + (item.github ? '<a href="' + item.github + '" target="_blank" rel="noopener noreferrer">GitHub</a>' : 'Coming Soon') + '</td>' +
        '<td>' + (item.release ? '<a href="' + item.release + '" target="_blank" rel="noopener noreferrer">Release</a>' : 'Coming Soon') + '</td>' +
        '<td>' + (item.documentation ? '<a href="' + item.documentation + '" target="_blank" rel="noopener noreferrer">Documentation</a>' : 'Coming Soon') + '</td>' +
        '<td>' + (item.platform || 'Coming Soon') + '</td>' +
        '<td>' + (item.version || 'Coming Soon') + '</td>' +
        '<td>' + (item.license || 'Coming Soon') + '</td>' +
        '<td><span class="ra-status-pill ' + statusClass(item.status) + '">' + item.status + '</span></td>' +
      '</tr>';
    }).join('');
  }

  function renderLectureDownloads() {
    var downloads = radioConfig && radioConfig.lectureDownloads;
    if (!downloads) return;

    Object.keys(downloads).forEach(function (key) {
      var item = downloads[key];
      document.querySelectorAll('[data-ra-download-status="' + key + '"]').forEach(function (element) {
        element.textContent = item.status;
        element.className = 'project-status status-coming';
      });
      setHref('[data-ra-download-url="' + key + '"]', item.url);
    });
  }

  function setCopyStatus(button, message) {
    var original = button.getAttribute('data-label') || button.textContent;
    button.setAttribute('data-label', original);
    button.textContent = message;
    window.setTimeout(function () {
      button.textContent = original;
    }, 1800);
  }

  function copyText(button) {
    var targetId = button.getAttribute('data-copy-target');
    var target = targetId ? document.getElementById(targetId) : null;
    var text = target ? target.textContent.trim() : button.getAttribute('data-copy');

    if (!text) {
      setCopyStatus(button, 'Unavailable');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setCopyStatus(button, 'Copied');
      }).catch(function () {
        setCopyStatus(button, 'Copy failed');
      });
      return;
    }

    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      setCopyStatus(button, 'Copied');
    } catch (error) {
      setCopyStatus(button, 'Copy failed');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  document.querySelectorAll('[data-copy-target], [data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      copyText(button);
    });
  });

  renderPublication();
  renderSoftware();
  renderLectureDownloads();
})();
