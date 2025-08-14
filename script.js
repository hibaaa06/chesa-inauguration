document.addEventListener('DOMContentLoaded', () => {
  // ---------------------
  // MENU TOGGLE FOR MOBILE
  // ---------------------
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  menuToggle && menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // ---------------------
  // SMOOTH SCROLL FOR SAME-PAGE LINKS
  // ---------------------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nav.classList.remove('open');
    });
  });

  // ---------------------
  // COUNTDOWN TIMER
  // ---------------------
  const countdownTarget = new Date("2025-08-14T10:00:00").getTime();
  const timerEl = document.getElementById('timer');

  function updateTimer() {
    if (!timerEl) return; // if timer element not on page
    const now = Date.now();
    const diff = countdownTarget - now;

    if (diff <= 0) {
      timerEl.textContent = "The inauguration has started!";
      clearInterval(timerInterval);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    timerEl.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }

  const timerInterval = setInterval(updateTimer, 1000);
  updateTimer();

  // ---------------------
  // RSVP STORAGE + CSV DOWNLOAD
  // ---------------------
  const form = document.getElementById('rsvpForm');
  const rsvpKey = 'chesa_rsvps';
  const listContainer = document.getElementById('rsvpList');
  const downloadBtn = document.getElementById('downloadBtn');

  function loadRSVPs() { return JSON.parse(localStorage.getItem(rsvpKey) || '[]'); }
  function saveRSVPs(arr) { localStorage.setItem(rsvpKey, JSON.stringify(arr)); }

  function renderList() {
    if (!listContainer) return;
    const arr = loadRSVPs();
    if (!arr.length) {
      listContainer.innerHTML = '<p>No RSVPs yet.</p>';
      return;
    }
    const html = arr.map(r => {
      return `<div class="card" style="margin-bottom:8px">
        <strong>${escapeHtml(r.name || '')}</strong> • ${escapeHtml(r.email || '')}<br/>
        Guests: ${escapeHtml(String(r.guests || '0'))} • ${new Date(r.time).toLocaleString()}
        <div style="opacity:.85;margin-top:6px">${escapeHtml(r.message || '')}</div>
      </div>`;
    }).join('');
    listContainer.innerHTML = html;
  }

  function escapeHtml(s) {
    return (s || '').toString().replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    );
  }

  form && form.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      guests: form.guests.value || '0',
      message: form.message.value.trim(),
      time: new Date().toISOString()
    };
    if (!data.name || !data.email) {
      alert('Please enter name and a valid email.');
      return;
    }
    const arr = loadRSVPs();
    arr.push(data);
    saveRSVPs(arr);
    renderList();
    form.reset();
    alert('Thanks — your RSVP is recorded.');
  });

  function toCSV(arr) {
    const keys = ['name','email','phone','guests','message','time'];
    const rows = [ keys.join(',') ];
    arr.forEach(o => {
      const line = keys.map(k => JSON.stringify(o[k] || '')).join(',');
      rows.push(line);
    });
    return rows.join('\r\n');
  }

  downloadBtn && downloadBtn.addEventListener('click', () => {
    const arr = loadRSVPs();
    if (!arr.length) { alert('No RSVPs to download.'); return; }
    const csv = toCSV(arr);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chesa_rsvps.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // initial render for RSVP list
  renderList();
});
