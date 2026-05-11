/* =====================================================================
   manav asnani — operator's console
   all interactive behavior, no dependencies
   ===================================================================== */
(function () {
  'use strict';

  /* -------------------------------------------------- shorthand */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ====================================================================
     LIVE CLOCK
     ==================================================================== */
  const clock = $('#clock');
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickClock() {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} EST`;
  }
  tickClock();
  setInterval(tickClock, 1000);


  /* ====================================================================
     HERO TERMINAL — type-on + interactive shell
     ==================================================================== */
  const termBody  = $('#terminal-body');
  const termInput = $('#terminal-input');
  const termForm  = $('#terminal-form');
  const typedEl   = $('#t-typed');
  const caretEl   = termBody.querySelector('.t-caret');

  function typeText(el, text, speed) {
    return new Promise((resolve) => {
      if (reduceMotion) { el.textContent = text; resolve(); return; }
      let i = 0;
      const id = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) { clearInterval(id); resolve(); }
      }, speed);
    });
  }

  function termAppendLine(html, kind = null) {
    const line = document.createElement('div');
    line.className = 't-line';
    if (kind === 'out')     line.classList.add('t-out');
    if (kind === 'err')     line.classList.add('t-err');
    if (kind === 'comment') line.classList.add('t-comment');
    line.innerHTML = html;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function termAppendOutput(text) {
    text.split('\n').forEach((row) => {
      const line = document.createElement('div');
      line.className = 't-line t-out';
      line.innerHTML = row || '&nbsp;';
      termBody.appendChild(line);
    });
    termBody.scrollTop = termBody.scrollHeight;
  }

  /* terminal commands */
  const FILES = {
    'about.md':
`Hi, I'm Manav. I'm a cybersecurity master's student at
Northeastern, graduating in December 2026. My focus is
application security: iOS, SAST/DAST, and a bit of binary
exploitation on the side.

Right now I'm an AppSec intern at QuakTravel.
Looking for entry-level roles in AppSec, NetSec, or CloudSec.`,
    'skills.txt':
`OFFENSIVE   pentest, SAST/DAST, OWASP Top 10, secure code review, binary exploit
DEFENSIVE   SIEM, threat detection, IR, MITRE ATT&CK
MOBILE      IPA analysis, Frida, cert pinning bypass, API testing
NETWORK     firewall rules, TCP/IP, IDS/IPS, pcap analysis
TOOLS       Burp, Splunk, Checkmarx, SonarQube, Snyk, Nessus, Wireshark, Pwntools
LANG        Python, Bash, PowerShell`,
    'experience.log':
`2026-01 → present   QuakTravel        AppSec Intern
2023-12 → 2024-04   DefX              Pentest Intern
2023-06 → 2023-08   TechDefence Labs  Cybersecurity Intern`,
    'contact.vcf':
`EMAIL      asnani.ma@northeastern.edu
PHONE      +1 (617) 378-8327
LOCATION   Boston, MA
GITHUB     github.com/manav
LINKEDIN   linkedin.com/in/manav`,
    '~/.profile':
`name        manav asnani
location    boston, ma
focus       appsec, ios, sast/dast, binary exploitation
education   m.s. cybersecurity, northeastern (3.76/4.0)
graduating  december 2026
looking     entry-level security roles in appsec, netsec, cloudsec`,
  };

  const SECTIONS_BY_KEY = {
    hero: 'hero', operator: 'operator', about: 'operator',
    arsenal: 'arsenal', skills: 'arsenal',
    operations: 'operations', experience: 'operations', work: 'operations',
    cases: 'cases', projects: 'cases',
    credentials: 'credentials', education: 'credentials', edu: 'credentials',
    comms: 'comms', contact: 'comms',
  };

  const CMD = {
    help() {
      return [
        'available commands:',
        '  whoami              identity card',
        '  ls                  list files',
        '  cat <file>          read a file (about.md, skills.txt, experience.log, contact.vcf, ~/.profile)',
        '  skills              show skill matrix',
        '  experience          work history',
        '  projects            list case files',
        '  contact             contact info',
        '  goto <section>      scroll to a section (hero, operator, arsenal, operations, cases, credentials, comms)',
        '  open <case>         open a project dossier (binexp, capstone, logforge)',
        '  pwd                 print working directory',
        '  date                current time',
        '  clear               clear the terminal',
        '  help                this list',
      ].join('\n');
    },
    whoami() { return 'manav asnani · application security engineer · boston, ma'; },
    ls()     { return 'about.md   skills.txt   experience.log   contact.vcf   projects/   resume.pdf'; },
    pwd()    { return '/home/manav'; },
    date()   { return new Date().toString(); },
    cat(arg) {
      if (!arg) return 'cat: missing operand\nusage: cat <filename>';
      if (FILES[arg]) return FILES[arg];
      return `cat: ${arg}: No such file or directory`;
    },
    skills()     { return FILES['skills.txt']; },
    experience() { return FILES['experience.log']; },
    contact()    { return FILES['contact.vcf']; },
    projects() {
      return [
        'CASE-001  binexp        binary exploitation. pwntools, ROP chains',
        'CASE-002  capstone      healthcare web app pentest (MS capstone)',
        'CASE-003  logforge      Dockerized ELK with MITRE-tagged log parsing',
        'CASE-004  ir-playbooks  SOC incident response playbooks (NIST 800-61)',
        'CASE-005  webguard      OWASP Top 10 pentesting on web apps',
        'CASE-006  keylogger     Python keylogger with AES + SMTP exfil',
        'CASE-007  ecdh          Bash file sharing with ECDH and ECC',
        '',
        'tip: run `open <case>` (e.g. `open ecdh`) or `goto cases`',
      ].join('\n');
    },
    goto(arg) {
      if (!arg) return 'goto: missing target. try: hero, operator, arsenal, operations, cases, credentials, comms';
      const id = SECTIONS_BY_KEY[arg.toLowerCase()];
      if (!id) return `goto: unknown section '${arg}'`;
      $('#' + id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      return `→ scrolling to ${id}`;
    },
    open(arg) {
      if (!arg) return 'open: missing operand. try: open binexp, capstone, logforge, ir-playbooks, webguard, keylogger, or ecdh';
      const map = {
        binexp: 'binexp', binary: 'binexp',
        capstone: 'capstone', healthcare: 'capstone', hipaa: 'capstone',
        logforge: 'logforge', elk: 'logforge',
        'ir-playbooks': 'ir-playbooks', ir: 'ir-playbooks', playbooks: 'ir-playbooks', soc: 'ir-playbooks',
        webguard: 'webguard', owasp: 'webguard',
        keylogger: 'keylogger', keys: 'keylogger',
        ecdh: 'ecdh', filesharing: 'ecdh', crypto: 'ecdh',
      };
      const k = map[arg.toLowerCase()];
      if (!k) return `open: unknown case '${arg}'`;
      openCase(k);
      const ids = { binexp: '001', capstone: '002', logforge: '003', 'ir-playbooks': '004', webguard: '005', keylogger: '006', ecdh: '007' };
      return `→ opening case-${ids[k]}`;
    },
    sudo() { return 'lol no'; },
    rm()   { return 'rm: nice try.'; },
    exit() { return 'session persists. portfolio is read-only.'; },
  };

  const COMMAND_NAMES = Object.keys(CMD).concat(['clear']);

  function runCommand(line) {
    const trimmed = line.trim();
    if (!trimmed) return;

    /* echo */
    termAppendLine(`<span class="t-prompt">$</span> ${escapeHtml(trimmed)}`);

    const [cmd, ...args] = trimmed.split(/\s+/);

    if (cmd === 'clear') {
      termBody.innerHTML = '';
      return;
    }
    if (CMD[cmd]) {
      const out = CMD[cmd](...args);
      if (out) termAppendOutput(out);
    } else {
      termAppendLine(`<span>zsh: command not found: ${escapeHtml(cmd)}</span>`, 'err');
    }
  }

  /* history + tab completion */
  const history = [];
  let historyIdx = -1;

  termForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = termInput.value;
    if (v.trim()) {
      history.push(v);
      historyIdx = history.length;
      runCommand(v);
    }
    termInput.value = '';
  });

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const v = termInput.value;
      const parts = v.split(/\s+/);
      if (parts.length === 1) {
        const matches = COMMAND_NAMES.filter((c) => c.startsWith(parts[0]));
        if (matches.length === 1) termInput.value = matches[0] + ' ';
        else if (matches.length > 1) termAppendOutput(matches.join('  '));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) { historyIdx--; termInput.value = history[historyIdx] || ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < history.length - 1) { historyIdx++; termInput.value = history[historyIdx] || ''; }
      else { historyIdx = history.length; termInput.value = ''; }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      termBody.innerHTML = '';
    }
  });

  /* clicking the terminal anywhere focuses input */
  $('#terminal').addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') termInput.focus();
  });

  /* boot sequence */
  async function boot() {
    await typeText(typedEl, 'whoami', reduceMotion ? 0 : 60);
    if (caretEl) caretEl.remove();
    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 240));
    termAppendOutput('manav asnani · application security engineer · boston, ma');
    termAppendLine('&nbsp;');
    termAppendLine(`<span class="t-comment"># tab-completes commands · ↑↓ for history · type 'help' for the list</span>`);
  }
  boot();


  /* ====================================================================
     KEYBOARD SHORTCUTS — R / P / C / G  (when no input focused)
     ==================================================================== */
  const isTypingTarget = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;
    if (paletteEl && !paletteEl.hasAttribute('hidden')) return;

    const k = e.key.toLowerCase();
    if (k === 'r')      { e.preventDefault(); location.href = 'resume.pdf'; }
    else if (k === 'p') { e.preventDefault(); CMD.goto('cases'); }
    else if (k === 'c') { e.preventDefault(); CMD.goto('comms'); }
    else if (k === 'g') { e.preventDefault(); window.open('https://github.com/', '_blank'); }
  });

  /* shortcut chips in identity card */
  $$('.shortcut').forEach((s) => {
    s.addEventListener('click', () => {
      const k = s.dataset.key;
      if      (k === 'r') location.href = 'resume.pdf';
      else if (k === 'p') CMD.goto('cases');
      else if (k === 'c') CMD.goto('comms');
      else if (k === 'g') window.open('https://github.com/', '_blank');
    });
  });


  /* ====================================================================
     COMMAND PALETTE  (⌘ + K)
     ==================================================================== */
  const paletteEl    = $('#palette');
  const paletteInput = $('#palette-input');
  const paletteList  = $('#palette-list');

  const PALETTE_CMDS = [
    { name: 'goto · hero',         meta: '01 · landing',     icon: '↗', run: () => CMD.goto('hero') },
    { name: 'goto · operator',     meta: '02 · about',       icon: '↗', run: () => CMD.goto('operator') },
    { name: 'goto · arsenal',      meta: '03 · skills',      icon: '↗', run: () => CMD.goto('arsenal') },
    { name: 'goto · operations',   meta: '04 · experience',  icon: '↗', run: () => CMD.goto('operations') },
    { name: 'goto · case files',   meta: '05 · projects',    icon: '↗', run: () => CMD.goto('cases') },
    { name: 'goto · credentials',  meta: '06 · education',   icon: '↗', run: () => CMD.goto('credentials') },
    { name: 'goto · comms',        meta: '07 · contact',     icon: '↗', run: () => CMD.goto('comms') },
    { name: 'open case · binary exploitation', meta: 'CASE-001', icon: '⊞', run: () => openCase('binexp') },
    { name: 'open case · healthcare pentest',  meta: 'CASE-002', icon: '⊞', run: () => openCase('capstone') },
    { name: 'open case · logforge elk',        meta: 'CASE-003', icon: '⊞', run: () => openCase('logforge') },
    { name: 'open case · ir playbooks (soc)',  meta: 'CASE-004', icon: '⊞', run: () => openCase('ir-playbooks') },
    { name: 'open case · webguard (owasp)',    meta: 'CASE-005', icon: '⊞', run: () => openCase('webguard') },
    { name: 'open case · system keylogger',    meta: 'CASE-006', icon: '⊞', run: () => openCase('keylogger') },
    { name: 'open case · ecdh file sharing',   meta: 'CASE-007', icon: '⊞', run: () => openCase('ecdh') },
    { name: 'send email',          meta: 'mailto',           icon: '✉', run: () => location.href = 'mailto:asnani.ma@northeastern.edu' },
    { name: 'copy email',          meta: 'clipboard',        icon: '⎘', run: () => copyText('asnani.ma@northeastern.edu', 'email copied to ~/.clipboard') },
    { name: 'copy phone',          meta: 'clipboard',        icon: '⎘', run: () => copyText('+16173788327', 'phone copied to ~/.clipboard') },
    { name: 'open github',         meta: 'external',         icon: '↗', run: () => window.open('https://github.com/', '_blank') },
    { name: 'open linkedin',       meta: 'external',         icon: '↗', run: () => window.open('https://linkedin.com/', '_blank') },
    { name: 'download resume',     meta: 'pdf',              icon: '↓', run: () => location.href = 'resume.pdf' },
    { name: 'clear skill filter',  meta: 'reset',            icon: '✕', run: () => clearFilter() },
  ];

  let paletteFiltered = PALETTE_CMDS.slice();
  let paletteActive = 0;

  function renderPalette() {
    paletteList.innerHTML = paletteFiltered.map((c, i) => `
      <li class="palette-item ${i === paletteActive ? 'is-active' : ''}" data-i="${i}" role="option">
        <span class="pi-icon">${c.icon}</span>
        <span class="pi-name">${escapeHtml(c.name)}</span>
        <span class="pi-meta">${escapeHtml(c.meta)}</span>
      </li>
    `).join('');
  }

  function openPalette() {
    paletteEl.removeAttribute('hidden');
    paletteInput.value = '';
    paletteFiltered = PALETTE_CMDS.slice();
    paletteActive = 0;
    renderPalette();
    setTimeout(() => paletteInput.focus(), 0);
  }

  function closePalette() {
    paletteEl.setAttribute('hidden', '');
  }

  function runPaletteActive() {
    const cmd = paletteFiltered[paletteActive];
    if (cmd) { closePalette(); cmd.run(); }
  }

  paletteInput.addEventListener('input', () => {
    const q = paletteInput.value.toLowerCase().trim();
    paletteFiltered = q
      ? PALETTE_CMDS.filter((c) => (c.name + ' ' + c.meta).toLowerCase().includes(q))
      : PALETTE_CMDS.slice();
    paletteActive = 0;
    renderPalette();
  });

  paletteInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); paletteActive = Math.min(paletteActive + 1, paletteFiltered.length - 1); renderPalette(); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); paletteActive = Math.max(paletteActive - 1, 0); renderPalette(); }
    else if (e.key === 'Enter')     { e.preventDefault(); runPaletteActive(); }
    else if (e.key === 'Escape')    { e.preventDefault(); closePalette(); }
  });

  paletteList.addEventListener('click', (e) => {
    const item = e.target.closest('.palette-item');
    if (!item) return;
    paletteActive = parseInt(item.dataset.i, 10);
    runPaletteActive();
  });

  $('#open-palette').addEventListener('click', openPalette);

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      paletteEl.hasAttribute('hidden') ? openPalette() : closePalette();
    } else if (e.key === 'Escape' && !paletteEl.hasAttribute('hidden')) {
      closePalette();
    }
  });

  paletteEl.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closePalette();
  });


  /* ====================================================================
     COPY + TOAST
     ==================================================================== */
  const toast = $('#toast');
  let toastTimer;

  function showToast(text) {
    toast.textContent = text;
    toast.removeAttribute('hidden');
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.setAttribute('hidden', ''), 250);
    }, 1800);
  }

  function copyText(text, msg) {
    if (!navigator.clipboard) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
      showToast(msg);
      return;
    }
    navigator.clipboard.writeText(text).then(() => showToast(msg));
  }

  $$('.copy-target').forEach((el) => {
    el.addEventListener('click', () => copyText(el.dataset.copy, `${el.querySelector('.ch-key').textContent} copied to ~/.clipboard`));
  });


  /* ====================================================================
     SKILL FILTER — cross-section dimming
     ==================================================================== */
  let activeFilter = null;
  const filterStateEl = $('#filter-state');
  const filterClearBtn = $('#filter-clear');

  function applyFilter() {
    const filterables = $$('.filterable');
    if (!activeFilter) {
      filterables.forEach((el) => el.classList.remove('is-dimmed'));
      filterStateEl.textContent = 'none active · click any tag below to cross-filter';
      filterStateEl.classList.remove('is-active');
      filterClearBtn.hidden = true;
      $$('.chip-tag').forEach((c) => c.classList.remove('is-selected'));
      return;
    }
    filterables.forEach((el) => {
      const skills = (el.dataset.skills || '').toLowerCase();
      el.classList.toggle('is-dimmed', !skills.includes(activeFilter));
    });
    filterStateEl.innerHTML = `active: <span class="sev-info">${escapeHtml(activeFilter)}</span> · related items highlighted across operations &amp; case files`;
    filterStateEl.classList.add('is-active');
    filterClearBtn.hidden = false;
  }

  function clearFilter() { activeFilter = null; applyFilter(); }

  $$('.chip-tag').forEach((chip) => {
    chip.addEventListener('click', () => {
      const skill = chip.dataset.skill.toLowerCase();
      if (activeFilter === skill) {
        clearFilter();
      } else {
        activeFilter = skill;
        $$('.chip-tag').forEach((c) => c.classList.toggle('is-selected', c === chip));
        applyFilter();
      }
    });
  });

  filterClearBtn.addEventListener('click', clearFilter);


  /* ====================================================================
     OPERATIONS — log event expand/collapse
     ==================================================================== */
  $$('.log-head').forEach((head) => {
    const body = head.nextElementSibling;
    function toggle() {
      const open = body.classList.toggle('collapsed');
      head.setAttribute('aria-expanded', String(!open));
    }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });


  /* ====================================================================
     CASE FILES — open modal
     ==================================================================== */
  const modalEl    = $('#modal');
  const modalIdEl  = $('#modal-id');
  const modalTitle = $('#modal-title');
  const modalBody  = $('#modal-body');

  $$('.case-card').forEach((card) => {
    card.addEventListener('click', () => openCase(card.dataset.case));
  });

  function openCase(key) {
    const data = CASES[key];
    if (!data) return;
    modalIdEl.textContent = data.id;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.body;
    modalEl.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (data.onMount) data.onMount();
    modalEl.querySelector('.modal-close').focus();
  }

  function closeModal() {
    modalEl.setAttribute('hidden', '');
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
  }

  modalEl.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalEl.hasAttribute('hidden')) closeModal();
  });


  /* ====================================================================
     CASE-001 — Binary Exploitation (interactive stack viz)
     ==================================================================== */
  const STACK_HTML = `
    <div class="m-section">
      <p>A series of pwn challenges where I used pwntools to write exploits for format string bugs and ROP chains. The interactive stack below walks through a classic buffer overflow: write past the end of a buffer, overwrite the saved return address, and redirect execution to <code>system("/bin/sh")</code>.</p>
    </div>

    <div class="m-section">
      <h3>interactive · stack overflow demo</h3>
      <div class="bin-viz">
        <div class="bin-stack" id="bin-stack"></div>
        <div class="bin-controls">
          <button class="bin-btn" id="bin-reset">send "hello" (safe)</button>
          <button class="bin-btn danger" id="bin-exploit">trigger overflow →</button>
        </div>
      </div>
      <p class="text-dim" style="font-size:11px;margin-top:8px;">Visualization only. No real exploitation. Stack grows down, low addresses at the bottom. AAAA is <code>0x41</code>.</p>
    </div>

    <div class="m-section">
      <h3>artifacts</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">primitives</div><div class="m-v">format string, BOF, ROP</div></div>
        <div class="m-stat"><div class="m-k">tooling</div><div class="m-v">pwntools, gdb, pwndbg</div></div>
        <div class="m-stat"><div class="m-k">techniques</div><div class="m-v">libc leak → ret2libc, ret2syscall</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>what I learned</h3>
      <ul class="m-list">
        <li>ASLR and PIE make things much harder. Leaking a libc address was usually the step that took the longest.</li>
        <li>Writing exploits as pwntools scripts saved a lot of time. Once a binary changed, I could re-run instead of redoing everything in gdb.</li>
        <li>Stack canaries are simple to add and would have blocked most of these overflows in production code.</li>
      </ul>
    </div>
  `;

  function renderBinStack(exploited) {
    const slots = exploited
      ? [
          { addr: '0x7ffe5670', data: '0x4006f0', label: 'return addr', cls: 'return-addr exploited' },
          { addr: '0x7ffe5668', data: '0x4141414141414141', label: 'saved rbp', cls: 'exploited' },
          { addr: '0x7ffe5660', data: '0x4141414141414141', label: 'buf[24..32]', cls: 'exploited' },
          { addr: '0x7ffe5658', data: '0x4141414141414141', label: 'buf[16..24]', cls: 'exploited' },
          { addr: '0x7ffe5650', data: '0x4141414141414141', label: 'buf[8..16]', cls: 'exploited' },
          { addr: '0x7ffe5648', data: '0x4141414141414141', label: 'buf[0..8]',  cls: 'exploited' },
        ]
      : [
          { addr: '0x7ffe5670', data: '0x4007a0',     label: 'return addr', cls: 'return-addr' },
          { addr: '0x7ffe5668', data: '0x7ffe5690',   label: 'saved rbp',   cls: '' },
          { addr: '0x7ffe5660', data: '0x0000000000', label: 'buf[24..32]', cls: '' },
          { addr: '0x7ffe5658', data: '0x0000000000', label: 'buf[16..24]', cls: '' },
          { addr: '0x7ffe5650', data: '0x0000000000', label: 'buf[8..16]',  cls: '' },
          { addr: '0x7ffe5648', data: '"hello\\0"',    label: 'buf[0..8]',  cls: '' },
        ];

    return slots.map((s) => `
      <div class="bin-slot ${s.cls}" data-slot="${s.label}">
        <span class="bin-addr">${s.addr}</span>
        <span class="bin-data">${escapeHtml(s.data)}</span>
        <span class="bin-label">${escapeHtml(s.label)}</span>
      </div>
    `).join('');
  }

  function mountBinExploit() {
    const stack = $('#bin-stack');
    stack.innerHTML = renderBinStack(false);

    $('#bin-reset').addEventListener('click', () => {
      stack.innerHTML = renderBinStack(false);
    });

    $('#bin-exploit').addEventListener('click', () => {
      // animate slot-by-slot from bottom (b0) to top (return-addr)
      stack.innerHTML = renderBinStack(false);
      const slots = $$('#bin-stack .bin-slot');
      const order = slots.slice().reverse(); // b0 first → return-addr last
      order.forEach((slot, i) => {
        setTimeout(() => {
          slot.classList.add('exploited');
          const data = slot.querySelector('.bin-data');
          if (slot.classList.contains('return-addr')) data.textContent = '0x4006f0';
          else                                         data.textContent = '0x4141414141414141';
        }, reduceMotion ? 0 : i * 180);
      });
    });
  }


  /* ====================================================================
     CASE-002 — Healthcare Pentest (abstract, non-sensitive visuals)
     ==================================================================== */
  const CAPSTONE_HTML = `
    <div class="m-section">
      <p>My M.S. capstone project. We did a security assessment on a healthcare web app used by a pharmacy partner, with the work shaped around HIPAA. The team scoped the engagement, ran the tests, mapped findings back to HIPAA controls, and put together an incident response plan so the platform team would be more ready for a real breach.</p>
      <p style="font-size:12.5px;color:var(--text-muted);margin-top:8px;">The architecture and specifics of the engagement are under NDA, so this page sticks to the shape of the work.</p>
    </div>

    <div class="m-section">
      <h3>engagement phases</h3>
      <div class="phase-strip">
        <div class="ph">
          <span class="ph-n">01 · scope</span>
          <span class="ph-l">define the perimeter and rules of engagement</span>
        </div>
        <div class="ph">
          <span class="ph-n">02 · test</span>
          <span class="ph-l">manual and automated testing against the web app</span>
        </div>
        <div class="ph">
          <span class="ph-n">03 · report</span>
          <span class="ph-l">findings with severity, CVSS, and remediation steps</span>
        </div>
        <div class="ph">
          <span class="ph-n">04 · ir plan</span>
          <span class="ph-l">incident response playbook tied to HIPAA controls</span>
        </div>
      </div>
    </div>

    <div class="m-section">
      <h3>findings by severity</h3>
      <div class="sev-bars">
        <div class="sev-bar">
          <span class="sev-bar-k sev-crit">critical</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-crit" style="width: 22%"></div></div>
          <span class="sev-bar-v">2</span>
        </div>
        <div class="sev-bar">
          <span class="sev-bar-k" style="color:var(--high)">high</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-high" style="width: 44%"></div></div>
          <span class="sev-bar-v">4</span>
        </div>
        <div class="sev-bar">
          <span class="sev-bar-k sev-warn">medium</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-warn" style="width: 100%"></div></div>
          <span class="sev-bar-v">9</span>
        </div>
        <div class="sev-bar">
          <span class="sev-bar-k sev-info">low</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-info" style="width: 66%"></div></div>
          <span class="sev-bar-v">6</span>
        </div>
      </div>
    </div>

    <div class="m-section">
      <h3>what we tested</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">access control</div><div class="m-v">authn, authz, session handling</div></div>
        <div class="m-stat"><div class="m-k">input handling</div><div class="m-v">injection, XSS, file upload</div></div>
        <div class="m-stat"><div class="m-k">crypto</div><div class="m-v">TLS config, data at rest, key storage</div></div>
        <div class="m-stat"><div class="m-k">api</div><div class="m-v">authz on every endpoint, rate limits</div></div>
        <div class="m-stat"><div class="m-k">config</div><div class="m-v">headers, error pages, defaults</div></div>
        <div class="m-stat"><div class="m-k">logging</div><div class="m-v">retention, PII in logs, audit trail</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>artifacts</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">framework</div><div class="m-v">HIPAA, OWASP ASVS</div></div>
        <div class="m-stat"><div class="m-k">deliverables</div><div class="m-v">pentest report, IR plan</div></div>
        <div class="m-stat"><div class="m-k">team</div><div class="m-v">3 people, 10 weeks</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>what I learned</h3>
      <ul class="m-list">
        <li>HIPAA is more about documentation and process than specific technical controls. Mapping every finding to a control made the report much more useful for the platform team.</li>
        <li>Most of the impactful findings came from boring places: missing authz checks, weak session handling, and TLS misconfig. The fancy stuff almost never came up.</li>
        <li>The IR plan was the deliverable the partner cared about most. A list of bugs is useful, but knowing what to do at 3am is more useful.</li>
      </ul>
    </div>
  `;


  /* ====================================================================
     CASE-003 — LogForge ELK
     ==================================================================== */
  const LOGFORGE_HTML = `
    <div class="m-section">
      <p>A log analysis pipeline I built using a Dockerized ELK stack. Filebeat collects logs and sends them to Logstash, where Grok filters parse each event and tag it with the matching MITRE ATT&amp;CK technique from a YAML mapping. Elasticsearch indexes everything, and Kibana shows dashboards for things like brute-force attempts and IAM misuse.</p>
    </div>

    <div class="m-section">
      <h3>pipeline</h3>
      <div class="bin-viz">
        <pre style="margin:0;color:var(--text);font-size:12px;line-height:1.8">
  <span class="sev-info">filebeat</span>      ──ship──▶  <span class="sev-info">logstash</span>      ──parse──▶  <span class="sev-info">elasticsearch</span>  ──query──▶  <span class="sev-info">kibana</span>
       │                  │ (grok + mitre.yml)         │                       │
       │                  │                            │                       └─ dashboards, alerts
       │                  └─ enrich: tactic, technique, severity
       └─ /var/log/auth, /var/log/nginx, app logs</pre>
      </div>
    </div>

    <div class="m-section">
      <h3>parser · ssh brute-force example</h3>
      <div class="lf-grid">
        <div class="lf-panel lf-grok">
          <h4>grok pattern</h4>
<pre><span class="grok-pat">%{TIMESTAMP_ISO8601:</span><span class="grok-key">ts</span><span class="grok-pat">}</span> <span class="grok-pat">%{HOSTNAME:</span><span class="grok-key">host</span><span class="grok-pat">}</span> sshd\\[<span class="grok-pat">%{INT:</span><span class="grok-key">pid</span><span class="grok-pat">}</span>\\]: Failed password for <span class="grok-pat">%{USERNAME:</span><span class="grok-key">user</span><span class="grok-pat">}</span> from <span class="grok-pat">%{IP:</span><span class="grok-key">src_ip</span><span class="grok-pat">}</span> port <span class="grok-pat">%{INT:</span><span class="grok-key">src_port</span><span class="grok-pat">}</span></pre>
        </div>
        <div class="lf-panel lf-parsed">
          <h4>parsed event <span class="lf-tag">T1110.001</span></h4>
<pre>{
  <span class="json-key">"ts"</span>:        <span class="json-str">"2025-07-10T03:14:22Z"</span>,
  <span class="json-key">"host"</span>:      <span class="json-str">"edge-01"</span>,
  <span class="json-key">"pid"</span>:       <span class="json-num">28471</span>,
  <span class="json-key">"user"</span>:      <span class="json-str">"root"</span>,
  <span class="json-key">"src_ip"</span>:    <span class="json-str">"203.0.113.42"</span>,
  <span class="json-key">"src_port"</span>:  <span class="json-num">52311</span>,
  <span class="json-key">"mitre"</span>: {
    <span class="json-key">"technique"</span>: <span class="json-str">"T1110.001"</span>,
    <span class="json-key">"tactic"</span>:    <span class="json-str">"credential_access"</span>
  },
  <span class="json-key">"severity"</span>:  <span class="json-str">"high"</span>
}</pre>
        </div>
      </div>
    </div>

    <div class="m-section">
      <h3>artifacts</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">stack</div><div class="m-v">elasticsearch, logstash, kibana, filebeat</div></div>
        <div class="m-stat"><div class="m-k">detections</div><div class="m-v">brute-force, IAM misuse, port scan</div></div>
        <div class="m-stat"><div class="m-k">enrichment</div><div class="m-v">grok + mitre.yml mappings</div></div>
      </div>
    </div>
  `;

  /* ====================================================================
     CASE-004 — IR Playbooks for SOC Automation
     ==================================================================== */
  const IR_PLAYBOOKS_HTML = `
    <div class="m-section">
      <p>I wrote a set of incident response playbooks for a SOC, aimed at speeding up triage and response. The playbooks cover common scenarios like SQL injection attempts and connections from blacklisted IPs over VPN, and they're built around the tools the SOC was already using: QRadar for SIEM, Nessus for vulnerability scans, Suricata for IDS, and Fortinet WAF for blocking.</p>
      <p>Everything follows NIST 800-61, which gives a clean four-phase structure: detect, contain, eradicate, recover.</p>
    </div>

    <div class="m-section">
      <h3>nist 800-61 lifecycle</h3>
      <div class="phase-strip">
        <div class="ph">
          <span class="ph-n">01 · detect</span>
          <span class="ph-l">alert correlation in QRadar, IDS hits in Suricata</span>
        </div>
        <div class="ph">
          <span class="ph-n">02 · contain</span>
          <span class="ph-l">isolate hosts, block IPs at the Fortinet WAF</span>
        </div>
        <div class="ph">
          <span class="ph-n">03 · eradicate</span>
          <span class="ph-l">patch, rotate creds, run Nessus to confirm</span>
        </div>
        <div class="ph">
          <span class="ph-n">04 · recover</span>
          <span class="ph-l">restore service, monitor, write up lessons</span>
        </div>
      </div>
    </div>

    <div class="m-section">
      <h3>example scenarios</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">scenario 01</div><div class="m-v">SQL injection attempt on the login form</div></div>
        <div class="m-stat"><div class="m-k">scenario 02</div><div class="m-v">VPN access from a blacklisted IP</div></div>
        <div class="m-stat"><div class="m-k">scenario 03</div><div class="m-v">unusual privilege escalation in cloud IAM</div></div>
        <div class="m-stat"><div class="m-k">scenario 04</div><div class="m-v">phishing email with malicious attachment</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>artifacts</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">tooling</div><div class="m-v">QRadar, Nessus, Suricata, Fortinet WAF</div></div>
        <div class="m-stat"><div class="m-k">framework</div><div class="m-v">NIST 800-61</div></div>
        <div class="m-stat"><div class="m-k">deliverables</div><div class="m-v">runbooks, escalation matrix, comms templates</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>what I learned</h3>
      <ul class="m-list">
        <li>The hard part isn't the technical steps. It's writing them so an analyst on a 3am shift can actually follow them without thinking too hard.</li>
        <li>Each scenario needed a clear escalation path. Without one, analysts default to either over-paging or under-paging.</li>
        <li>Compliance language and operational language are different. The playbooks needed both, so I wrote one version for each audience.</li>
      </ul>
    </div>
  `;


  /* ====================================================================
     CASE-005 — WebGuard (OWASP Top 10)
     ==================================================================== */
  const WEBGUARD_HTML = `
    <div class="m-section">
      <p>I ran a series of pentests on intentionally vulnerable web apps (like DVWA and OWASP Juice Shop) and a couple of real ones I had permission to test. The focus was the OWASP Top 10. For each finding I wrote up severity, impact, and a remediation path. The team I worked with said the changes brought their app security posture up by around 40 percent.</p>
    </div>

    <div class="m-section">
      <h3>owasp top 10 coverage</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">A01</div><div class="m-v">broken access control</div></div>
        <div class="m-stat"><div class="m-k">A02</div><div class="m-v">cryptographic failures</div></div>
        <div class="m-stat"><div class="m-k">A03</div><div class="m-v">injection (SQLi, XSS)</div></div>
        <div class="m-stat"><div class="m-k">A05</div><div class="m-v">security misconfiguration</div></div>
        <div class="m-stat"><div class="m-k">A07</div><div class="m-v">identification &amp; auth failures</div></div>
        <div class="m-stat"><div class="m-k">A08</div><div class="m-v">software &amp; data integrity</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>findings by severity</h3>
      <div class="sev-bars">
        <div class="sev-bar">
          <span class="sev-bar-k sev-crit">critical</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-crit" style="width: 25%"></div></div>
          <span class="sev-bar-v">3</span>
        </div>
        <div class="sev-bar">
          <span class="sev-bar-k" style="color:var(--high)">high</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-high" style="width: 58%"></div></div>
          <span class="sev-bar-v">7</span>
        </div>
        <div class="sev-bar">
          <span class="sev-bar-k sev-warn">medium</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-warn" style="width: 100%"></div></div>
          <span class="sev-bar-v">12</span>
        </div>
        <div class="sev-bar">
          <span class="sev-bar-k sev-info">low</span>
          <div class="sev-bar-track"><div class="sev-bar-fill sev-bar-info" style="width: 42%"></div></div>
          <span class="sev-bar-v">5</span>
        </div>
      </div>
    </div>

    <div class="m-section">
      <h3>artifacts</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">tools</div><div class="m-v">Burp Suite, OWASP ZAP, sqlmap, Python</div></div>
        <div class="m-stat"><div class="m-k">impact</div><div class="m-v">~40% improvement in app security posture</div></div>
        <div class="m-stat"><div class="m-k">deliverables</div><div class="m-v">findings report with severity and fixes</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>what I learned</h3>
      <ul class="m-list">
        <li>A finding without a clear remediation path tends to get ignored. Writing the fix matters as much as finding the bug.</li>
        <li>Severity is a conversation, not a constant. The same bug in a public endpoint and an admin-only endpoint are not the same severity.</li>
        <li>Automated scanners (ZAP, sqlmap) find a lot, but they miss the business-logic bugs every time. Manual testing is still the most useful part.</li>
      </ul>
    </div>
  `;


  /* ====================================================================
     CASE-006 — System Monitoring Keylogger
     ==================================================================== */
  const KEYLOGGER_HTML = `
    <div class="m-section">
      <p>A Python keylogger built for controlled lab environments. It captures keystrokes, clipboard contents, and basic system metadata, encrypts the captured data with AES, and sends the encrypted file over SMTP for offline analysis.</p>
      <p>I built it as a forensics exercise. Understanding how this kind of monitoring works on the offensive side helps a lot when you're trying to spot it from the defensive side.</p>
      <p style="font-size:12px;color:var(--text-muted);">For use on systems you own or have explicit written permission to monitor. This is not a tool for spying on people.</p>
    </div>

    <div class="m-section">
      <h3>capture pipeline</h3>
      <div class="bin-viz">
<pre style="margin:0;color:var(--text);font-size:12px;line-height:1.8">
  <span class="sev-info">[capture]</span>     ──▶  <span class="sev-info">[serialize]</span>   ──▶  <span class="sev-info">[aes-256]</span>   ──▶  <span class="sev-info">[smtp]</span>
   keystrokes        json blob           encrypted        sent to
   clipboard         + timestamp         payload          analyst inbox
   metadata</pre>
      </div>
    </div>

    <div class="m-section">
      <h3>what gets captured</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">keystrokes</div><div class="m-v">via pynput, including modifier keys</div></div>
        <div class="m-stat"><div class="m-k">clipboard</div><div class="m-v">polled on change, deduplicated</div></div>
        <div class="m-stat"><div class="m-k">metadata</div><div class="m-v">hostname, user, timestamp, active window</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>artifacts</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">language</div><div class="m-v">Python 3</div></div>
        <div class="m-stat"><div class="m-k">libs</div><div class="m-v">pynput, pycryptodome, smtplib</div></div>
        <div class="m-stat"><div class="m-k">crypto</div><div class="m-v">AES-256 (CBC) with random IV per batch</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>what I learned</h3>
      <ul class="m-list">
        <li>Encrypting captured data at rest changes everything about what an EDR or DLP tool sees. A keylogger that exfils plaintext is easy to flag. One that exfils encrypted bundles over SMTP is much harder.</li>
        <li>Polling the clipboard turned out to be the most invasive part. People paste passwords there all the time.</li>
        <li>Writing this clarified what defensive signals matter most: unusual SMTP traffic, unsigned binaries with persistence hooks, and processes that hook input events.</li>
      </ul>
    </div>
  `;


  /* ====================================================================
     CASE-007 — Secure Group File Sharing (ECDH + ECC)
     ==================================================================== */
  const ECDH_HTML = `
    <div class="m-section">
      <p>A Bash tool I wrote for encrypting and signing files so they can be shared with multiple recipients securely. Each recipient gets their own ECDH-derived shared secret, the file is encrypted with AES-256, and signatures are done with ECDSA. The result is that confidentiality, integrity, and authenticity are all covered without needing a centralized key server.</p>
    </div>

    <div class="m-section">
      <h3>key exchange flow</h3>
      <div class="bin-viz">
<pre style="margin:0;color:var(--text);font-size:12px;line-height:1.8">
  <span class="sev-info">alice</span>  ──(ECDH curve25519)──  <span class="sev-info">bob</span>           per recipient
                  │
                  ▼
        <span class="sev-success">shared secret (32 bytes)</span>
                  │
        derive key with hkdf-sha256
                  │
                  ▼
   ┌──────────────────────────────────┐
   │  encrypt file: <span class="sev-warn">aes-256-cbc</span>         │
   │  sign payload: <span class="sev-warn">ecdsa over sha-256</span>  │
   └──────────────────────────────────┘</pre>
      </div>
    </div>

    <div class="m-section">
      <h3>crypto primitives</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">key exchange</div><div class="m-v">ECDH on curve25519</div></div>
        <div class="m-stat"><div class="m-k">symmetric enc</div><div class="m-v">AES-256-CBC + random IV</div></div>
        <div class="m-stat"><div class="m-k">integrity</div><div class="m-v">SHA-256 hash, HMAC for ciphertext</div></div>
        <div class="m-stat"><div class="m-k">signing</div><div class="m-v">ECDSA over the file hash</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>artifacts</h3>
      <div class="m-grid">
        <div class="m-stat"><div class="m-k">language</div><div class="m-v">Bash</div></div>
        <div class="m-stat"><div class="m-k">tooling</div><div class="m-v">openssl, gpg-style key management</div></div>
        <div class="m-stat"><div class="m-k">supports</div><div class="m-v">multi-recipient encryption, detached signatures</div></div>
      </div>
    </div>

    <div class="m-section">
      <h3>what I learned</h3>
      <ul class="m-list">
        <li>Elliptic curve crypto is much cheaper than RSA for the same security level. The key sizes are smaller and the operations are faster, which matters when you're encrypting for many recipients.</li>
        <li>Doing crypto in Bash forced me to think about what openssl is actually doing on each call. Most languages hide all of that behind a high-level API.</li>
        <li>Authenticity is easy to forget. Encryption alone proves nothing about who sent the file. Signing every payload was the part that took the longest to get right.</li>
      </ul>
    </div>
  `;


  /* ====================================================================
     CASES registry
     ==================================================================== */
  const CASES = {
    binexp: {
      id: 'CASE-001', title: 'binary exploitation',
      body: STACK_HTML, onMount: mountBinExploit,
    },
    capstone: {
      id: 'CASE-002', title: 'healthcare web app pentest (capstone)',
      body: CAPSTONE_HTML, onMount: null,
    },
    logforge: {
      id: 'CASE-003', title: 'logforge — elk stack pipeline',
      body: LOGFORGE_HTML, onMount: null,
    },
    'ir-playbooks': {
      id: 'CASE-004', title: 'ir playbooks for soc automation',
      body: IR_PLAYBOOKS_HTML, onMount: null,
    },
    webguard: {
      id: 'CASE-005', title: 'webguard — owasp top 10 pentesting',
      body: WEBGUARD_HTML, onMount: null,
    },
    keylogger: {
      id: 'CASE-006', title: 'system monitoring keylogger',
      body: KEYLOGGER_HTML, onMount: null,
    },
    ecdh: {
      id: 'CASE-007', title: 'secure group file sharing with ecdh + ecc',
      body: ECDH_HTML, onMount: null,
    },
  };


  /* ====================================================================
     KONAMI CODE
     ==================================================================== */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) return;
    const want = KONAMI[konamiIdx];
    const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (got === want) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        document.body.classList.add('konami-active');
        setTimeout(() => openCase('binexp'), 600);
        setTimeout(() => document.body.classList.remove('konami-active'), 4400);
      }
    } else {
      konamiIdx = 0;
    }
  });


  /* ====================================================================
     MAIL COMPOSE BUTTON
     ==================================================================== */
  $('#send-msg').addEventListener('click', () => {
    const from    = ($('#from').value || '').trim();
    const subject = ($('#subject').value || 'hello manav').trim();
    const body    = ($('#body').value || '').trim();
    const sigBody = body + (from ? `\n\n— ${from}` : '');
    const url = `mailto:asnani.ma@northeastern.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(sigBody)}`;
    location.href = url;
  });


  /* ====================================================================
     RAIL ACTIVE SECTION  (IntersectionObserver)
     ==================================================================== */
  const railItems = $$('.rail-item');
  const railById = Object.fromEntries(railItems.map((i) => [i.dataset.target, i]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          railItems.forEach((i) => i.classList.remove('is-active'));
          railById[entry.target.id]?.classList.add('is-active');
        }
      });
    }, { rootMargin: '-30% 0% -60% 0%', threshold: 0 });
    $$('.section').forEach((s) => io.observe(s));
  }


  /* ====================================================================
     REVEAL ON SCROLL  (light, opt-in)
     ==================================================================== */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const elements = $$('.panel, .case-card, .log-event, .nmap');
    elements.forEach((el) => el.setAttribute('data-reveal', ''));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    elements.forEach((el) => io.observe(el));
  }


  /* ====================================================================
     METRIC COUNT-UP (the .metric spans in operations)
     ==================================================================== */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const metrics = $$('.metric');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const m = el.textContent.match(/(\d+)/);
        if (!m) { io.unobserve(el); return; }
        const target = parseInt(m[1], 10);
        const suffix = el.textContent.replace(m[1], '').trim();
        let n = 0;
        const start = performance.now();
        const dur = 700;
        function step(t) {
          const p = Math.min((t - start) / dur, 1);
          n = Math.round(p * target);
          el.textContent = n + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    metrics.forEach((m) => io.observe(m));
  }

})();
