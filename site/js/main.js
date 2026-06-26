document.addEventListener('DOMContentLoaded', function() {

  // Skip link focus
  document.querySelector('.skip-link')?.addEventListener('click', function(e) {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView();
    }
  });

  // Nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.setAttribute('aria-hidden', String(expanded));
      links.classList.toggle('open');
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.setAttribute('aria-hidden', 'true');
        links.classList.remove('open');
        toggle.focus();
      }
    });
  }

  // Highlight current page nav
  var currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    if (a.getAttribute('href') === currentPage) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Checklist persistence
  document.querySelectorAll('.checklist input[type="checkbox"]').forEach(function(cb) {
    var key = 'check-' + (cb.id || cb.value || Math.random());
    if (localStorage.getItem(key) === 'true') {
      cb.checked = true;
      var label = cb.parentElement.querySelector('label');
      if (label) label.classList.add('done');
    }
    cb.addEventListener('change', function() {
      localStorage.setItem(key, cb.checked);
      var label = cb.parentElement.querySelector('label');
      if (label) label.classList.toggle('done', cb.checked);
      updateProgress();
    });
  });

  // Update all progress bars
  function updateProgress() {
    document.querySelectorAll('.checklist').forEach(function(list) {
      var checkboxes = list.querySelectorAll('input[type="checkbox"]');
      var checked = list.querySelectorAll('input[type="checkbox"]:checked');
      var pct = checkboxes.length ? Math.round((checked.length / checkboxes.length) * 100) : 0;

      var bar = list.parentElement?.querySelector('.progress-fill');
      var text = list.parentElement?.querySelector('.progress-text');
      var progressEl = list.parentElement?.querySelector('.progress-bar');

      if (bar) bar.style.width = pct + '%';
      if (text) text.textContent = pct + '% complete';
      if (progressEl) {
        progressEl.setAttribute('aria-valuenow', String(pct));
      }
    });
  }
  updateProgress();

  // 5-4-3-2-1 Grounding Tool
  var labelEl = document.getElementById('sense-label');
  var promptEl = document.getElementById('sense-prompt');
  var itemsEl = document.getElementById('sense-items');
  var nextBtn = document.getElementById('grounding-next');
  var resetBtn = document.getElementById('grounding-reset');

  if (labelEl && promptEl && itemsEl && nextBtn) {
    var senses = [
      { label: 'SEE', prompt: 'Name 5 things you can see', count: 5 },
      { label: 'TOUCH', prompt: 'Name 4 things you can feel', count: 4 },
      { label: 'HEAR', prompt: 'Name 3 things you can hear', count: 3 },
      { label: 'SMELL', prompt: 'Name 2 things you can smell', count: 2 },
      { label: 'TASTE', prompt: 'Name 1 thing you can taste', count: 1 }
    ];
    var currentIndex = -1;

    function renderSense(index) {
      if (index >= senses.length) {
        labelEl.textContent = 'You are grounded.';
        promptEl.textContent = 'Take a slow breath. You are safe.';
        itemsEl.innerHTML = '';
        nextBtn.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'inline-block';
        return;
      }
      var s = senses[index];
      labelEl.textContent = s.label;
      promptEl.textContent = s.prompt;
      itemsEl.innerHTML = '';

      for (var i = 0; i < s.count; i++) {
        var div = document.createElement('button');
        div.type = 'button';
        div.className = 'sense-item';
        div.textContent = s.label + ' ' + (i + 1);
        div.setAttribute('aria-pressed', 'false');
        div.addEventListener('click', function() {
          var pressed = this.getAttribute('aria-pressed') === 'true';
          this.setAttribute('aria-pressed', String(!pressed));
        });
        itemsEl.appendChild(div);
      }
      nextBtn.style.display = 'inline-block';
      if (resetBtn) resetBtn.style.display = 'inline-block';
    }

    function nextSense() {
      currentIndex++;
      renderSense(currentIndex);
    }

    function resetTool() {
      currentIndex = -1;
      nextSense();
    }

    nextBtn.addEventListener('click', nextSense);
    if (resetBtn) resetBtn.addEventListener('click', resetTool);

    renderSense(0);
  }

  // Mood sliders
  document.querySelectorAll('.mood-row input[type="range"]').forEach(function(slider) {
    var display = slider.parentElement.querySelector('.slider-value');
    if (display) {
      display.textContent = slider.value;
      slider.addEventListener('input', function() {
        display.textContent = this.value;
      });
    }
  });

  // Tracker form
  var trackerForm = document.getElementById('daily-tracker');
  if (trackerForm) {
    var today = new Date().toISOString().split('T')[0];
    var dateInput = document.getElementById('tracker-date');
    if (dateInput) dateInput.value = today;

    var storageKey = 'tracker-' + today;
    var saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        var data = JSON.parse(saved);
        for (var key in data) {
          if (!data.hasOwnProperty(key)) continue;
          var el = trackerForm.querySelector('[name="' + key + '"]');
          if (!el) continue;
          if (el.type === 'checkbox') {
            el.checked = data[key];
          } else if (el.type === 'range') {
            el.value = data[key];
            var valDisplay = el.parentElement.querySelector('.slider-value');
            if (valDisplay) valDisplay.textContent = data[key];
          } else {
            el.value = data[key];
          }
        }
      } catch(e) { /* ignore parse errors */ }
    }

    trackerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = {};
      trackerForm.querySelectorAll('[name]').forEach(function(el) {
        if (el.type === 'checkbox') {
          data[el.name] = el.checked;
        } else if (el.type === 'range') {
          data[el.name] = el.value;
        } else {
          data[el.name] = el.value;
        }
      });
      localStorage.setItem(storageKey, JSON.stringify(data));

      var msg = trackerForm.querySelector('.save-msg');
      if (msg) {
        msg.textContent = 'Saved for ' + today;
        msg.style.opacity = '1';
        setTimeout(function() { msg.style.opacity = '0'; }, 2000);
      }
    });
  }
});
