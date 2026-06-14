/* ============================================================
   Offensive Security Portfolio — interactions
   - persistent shell (header/footer/background never reload)
   - client-side router: swaps only #view, with a fade
   - boot/login sequence, interactive terminal, reveals, matrix, form
============================================================ */
(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- shared chrome (nav · background · footer) — built ONCE, persists across pages ----------
       EDIT the nav here once and it updates everywhere. */
    var NAV_ITEMS = [
        ['index.html', 'home'],
        ['about.html', 'whoami'],
        ['ops.html', 'current_ops'],
        ['learning.html', 'learning'],
        ['progress.html', 'progress'],
        ['arsenal.html', 'arsenal'],
        ['roadmap.html', 'roadmap'],
        ['contact.html', 'contact']
    ];
    function buildChrome() {
        var navLinks = NAV_ITEMS.map(function (it) {
            return '<li><a href="' + it[0] + '">' + it[1] + '</a></li>';
        }).join('');
        var bg = '<canvas id="matrix"></canvas><div class="scanlines"></div>' +
            '<div class="noise"></div><div class="crt"></div>' +
            '<div class="glitch-overlay" aria-hidden="true"></div>';
        var header = '<header class="site-header"><nav class="navbar"><div class="container nav-inner">' +
            '<a href="index.html" class="logo"><span class="logo-prompt">root@tanathorn</span>:<span class="logo-path">~</span>$</a>' +
            '<button class="nav-toggle" aria-label="Toggle navigation">[ ::: ]</button>' +
            '<ul class="nav-links">' + navLinks + '</ul></div></nav></header>';
        var footer = '<footer class="footer"><div class="container footer-inner">' +
            '<p class="footer-line"><span class="muted">$</span> echo "stay curious, stay ethical" <span class="cursor">█</span></p>' +
            '<p class="footer-hint"><span class="kbd">←</span> <span class="kbd">→</span> switch pages</p>' +
            '<p class="footer-copy">&copy; <span id="year"></span> tanathorn // built in the terminal. all exploits authorized.</p>' +
            '</div></footer>';
        document.body.insertAdjacentHTML('afterbegin', bg + header);
        document.body.insertAdjacentHTML('beforeend', footer);
        var y = document.getElementById('year');
        if (y) y.textContent = new Date().getFullYear();
        // mobile nav toggle (header is persistent, so bind once)
        var toggle = document.querySelector('.nav-toggle');
        var links = document.querySelector('.nav-links');
        if (toggle && links) {
            toggle.addEventListener('click', function () { links.classList.toggle('open'); });
            links.addEventListener('click', function (e) {
                if (e.target.closest('a')) links.classList.remove('open');
            });
        }
    }

    function setActiveNav() {
        var page = location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === page);
        });
    }

    /* ============================================================
       CLIENT-SIDE ROUTER  (only #view changes; header/footer stay put)
    ============================================================ */
    function loadView(url, push) {
        var view = document.getElementById('view');
        if (!view) { window.location.href = url; return; }       // safety
        view.classList.add('view-leaving');
        fetch(url).then(function (r) {
            if (!r.ok) throw new Error('http ' + r.status);
            return r.text();
        }).then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var nv = doc.getElementById('view');
            var title = doc.querySelector('title');
            setTimeout(function () {
                view.innerHTML = nv ? nv.innerHTML : '';
                if (title) document.title = title.textContent;
                if (push) history.pushState({ url: url }, '', url);
                window.scrollTo(0, 0);
                view.classList.remove('view-leaving');
                initView();
                if (consoleEl) startIntro();      // re-run terminal intro when landing on home
            }, reduced ? 0 : 230);
        }).catch(function () {
            window.location.href = url;            // fallback (e.g. file:// where fetch is blocked)
        });
    }

    function setupRouter() {
        // intercept internal .html link clicks
        document.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            var a = e.target.closest && e.target.closest('a');
            if (!a || a.target === '_blank') return;
            var href = a.getAttribute('href') || '';
            if (!href || href.charAt(0) === '#') return;
            if (/^[a-z]+:/i.test(href) || href.indexOf('//') === 0) return;  // mailto:/http:/external
            if (!/\.html(\?|#|$)/.test(href)) return;
            e.preventDefault();
            loadView(href, true);
        });

        // ← / → arrow keys flip through pages in nav order
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
            var el = document.activeElement;
            if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
            var bootEl = document.getElementById('boot');
            if (bootEl && bootEl.style.display !== 'none' && !bootEl.classList.contains('done')) return;
            var pages = NAV_ITEMS.map(function (it) { return it[0]; });
            var current = location.pathname.split('/').pop() || 'index.html';
            var idx = pages.indexOf(current); if (idx === -1) idx = 0;
            var n = e.key === 'ArrowRight'
                ? (idx + 1) % pages.length
                : (idx - 1 + pages.length) % pages.length;
            loadView(pages[n], true);
        });

        // browser back/forward
        window.addEventListener('popstate', function () {
            loadView(location.pathname.split('/').pop() || 'index.html', false);
        });
    }

    /* ============================================================
       REVEAL ON SCROLL + COUNTERS
    ============================================================ */
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            el.classList.add('visible');
            el.querySelectorAll('.fill').forEach(function (f) { f.classList.add('animate'); });
            el.querySelectorAll('.stat-num[data-count]').forEach(animateCount);
            io.unobserve(el);
        });
    }, { threshold: 0.18 });
    function observeReveals() {
        document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) { io.observe(el); });
    }
    function animateCount(el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var dur = 1200, start = performance.now();
        (function tick(now) {
            var p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
        })(start);
    }

    /* ============================================================
       INTERACTIVE TERMINAL
    ============================================================ */
    // pages reachable via `goto`
    var PAGES = {
        home: 'index.html', hero: 'index.html',
        about: 'about.html', whoami: 'about.html',
        ops: 'ops.html', projects: 'ops.html', current_ops: 'ops.html',
        learning: 'learning.html',
        progress: 'progress.html', stats: 'progress.html', htb: 'progress.html', portswigger: 'progress.html',
        skills: 'arsenal.html', arsenal: 'arsenal.html',
        certs: 'roadmap.html', roadmap: 'roadmap.html',
        contact: 'contact.html'
    };

    // ---- command output content (EDIT freely) ----
    var HELP = [
        '<span class="accent">available commands</span>',
        '  <span class="key">help</span> ........ this menu',
        '  <span class="key">whoami</span> ...... identity',
        '  <span class="key">about</span> ....... background / bio',
        '  <span class="key">ops</span> ......... current projects (what I\'m on now)',
        '  <span class="key">learning</span> .... what I\'m studying + progress',
        '  <span class="key">skills</span> ...... tools &amp; tech',
        '  <span class="key">certs</span> ....... certification roadmap',
        '  <span class="key">contact</span> ..... how to reach me',
        '  <span class="key">trace</span> ....... fingerprint the current visitor (you)',
        '  <span class="muted">extras:</span> ls · date · echo · clear · history · sudo',
        '<span class="muted">tip: type a section name with</span> goto ops <span class="muted">to open that page.</span>'
    ];
    var WHOAMI = [
        'tanathorn <span class="muted">::</span> offensive security / penetration tester',
        '<span class="muted">aspiring OSCP — I break web apps, AD, and boxes for sport.</span>'
    ];
    var ABOUT = [
        '<span class="muted">$ cat about.txt</span>',
        'Security enthusiast transitioning into offensive security.',
        'I live on Hack The Box &amp; TryHackMe, dismantle web apps,',
        'and document every exploit. Goal: pro pentester + OSCP.',
        '<span class="muted">&rarr; run</span> goto about'
    ];
    var OPS = [
        '<span class="accent">CURRENT OPERATIONS</span> <span class="muted">// what I\'m on right now</span>',
        '<span class="ok">●</span> OP-001  HTB Season Lab          <span class="muted">[active]</span>  65%',
        '<span class="ok">●</span> OP-002  Web App Pentest Lab      <span class="muted">[active]</span>  40%',
        '<span style="color:var(--amber)">❚❚</span> OP-003  Home AD Lab             <span class="muted">[paused]</span>  25%',
        '<span class="muted">&rarr; run</span> goto ops <span class="muted">for the full page</span>'
    ];
    var LEARNING = [
        '<span class="accent">LEARNING</span> <span class="muted">// leveling up</span>',
        'Privilege Escalation (Linux) ...... 75%',
        'Web Exploitation .................. 60%',
        'Active Directory Attacks .......... 45%',
        'Python Offensive Tooling .......... 55%',
        'Binary Exploitation / Reversing ... 20%',
        '<span class="muted">&rarr; run</span> goto learning'
    ];
    var SKILLS = [
        '<span class="accent">ARSENAL</span>',
        'recon      nmap masscan gobuster ffuf amass nuclei',
        'exploit    metasploit burp sqlmap hydra john hashcat',
        'post-exp   mimikatz bloodhound impacket linpeas winpeas',
        'lang/os    python bash powershell kali c',
        '<span class="muted">&rarr; run</span> goto arsenal'
    ];
    var CERTS = [
        '<span class="accent">ROADMAP</span>',
        '<span class="ok">[✓]</span> TryHackMe Pre-Security &amp; Intro to Pentesting',
        '<span class="accent">[●]</span> eJPT — in progress (50%)',
        '<span class="muted">[ ]</span> OSCP — planned',
        '<span class="muted">[ ]</span> CRTP / Red Team — planned',
        '<span class="muted">&rarr; run</span> goto certs'
    ];
    var CONTACT = [
        '<span class="muted">$ ./contact.sh</span>',
        'email   <a href="mailto:so.tanathorn@gmail.com">so.tanathorn@gmail.com</a>',
        'github  <a href="https://github.com/Tanathorn-Rin" target="_blank" rel="noopener">@Tanathorn-Rin</a>',
        'status  <span class="ok">available for CTFs &amp; collabs</span>',
        '<span class="muted">&rarr; run</span> goto contact'
    ];
    var LS = [
        '<span class="accent">about.txt</span>   <span class="accent">ops/</span>   <span class="accent">learning/</span>   ' +
        '<span class="accent">arsenal/</span>   <span class="accent">roadmap/</span>   <span class="accent">contact.sh</span>   <span class="muted">.secrets</span>'
    ];

    var COMMAND_NAMES = ['help', 'whoami', 'about', 'ops', 'learning', 'progress', 'skills', 'certs',
        'contact', 'trace', 'ls', 'date', 'echo', 'clear', 'history', 'sudo', 'goto'];

    // terminal element refs (re-assigned each time the home view loads)
    var consoleEl, output, inputLine, input, sizer;
    var historyArr = [], hidx = null;

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }
    function scrollBottom() { if (consoleEl) consoleEl.scrollTop = consoleEl.scrollHeight; }
    function out(html) {
        if (!output) return;
        var div = document.createElement('div');
        div.className = 'line';
        div.innerHTML = html;
        output.appendChild(div);
        scrollBottom();
    }
    function printLines(arr) { arr.forEach(function (l) { out(l); }); }
    function echoCmd(cmd) {
        out('<span class="prompt">visitor@tanathorn<span class="muted">:</span>' +
            '<span class="key">~</span><span class="muted">$</span></span> ' + esc(cmd));
    }

    function process(name, args) {
        switch (name) {
            case 'help': printLines(HELP); break;
            case 'whoami': printLines(WHOAMI); break;
            case 'about': printLines(ABOUT); break;
            case 'ops': case 'projects': printLines(OPS); break;
            case 'learning': printLines(LEARNING); break;
            case 'skills': case 'arsenal': printLines(SKILLS); break;
            case 'certs': case 'roadmap': printLines(CERTS); break;
            case 'contact': printLines(CONTACT); break;
            case 'social': printLines(CONTACT); break;
            case 'ls': case 'dir': printLines(LS); break;
            case 'date': out(new Date().toString()); break;
            case 'pwd': out('/home/visitor'); break;
            case 'echo': out(esc(args.join(' '))); break;
            case 'clear': case 'cls': output.innerHTML = ''; break;
            case 'history':
                printLines(historyArr.map(function (h, i) { return '  ' + (i + 1) + '  ' + esc(h); }));
                break;
            case 'sudo':
                out('<span style="color:var(--amber)">[sudo]</span> nice try — visitor has no root here 😏');
                break;
            case 'trace': case 'track': case 'fingerprint':
                var f = fpGet();
                printLines([
                    '<span class="accent">TARGET FINGERPRINT</span> <span class="muted">// yes — you.</span>',
                    'host ........ ' + esc(f.plat) + '  (' + f.res + ', ' + f.cores + ' cores)',
                    'agent ....... ' + esc(f.br),
                    'timezone .... ' + esc(f.tz),
                    'local time .. ' + f.time,
                    '<span style="color:var(--amber)">this connection has been logged. have a nice day.</span>'
                ]);
                break;
            case 'goto': case 'cd': case 'open':
                var t = (args[0] || '').toLowerCase();
                if (PAGES[t]) {
                    out('<span class="muted">opening</span> ' + esc(PAGES[t]) + ' ...');
                    setTimeout(function () { loadView(PAGES[t], true); }, 220);
                } else out('<span style="color:var(--amber)">unknown section: ' + esc(t) + '</span>');
                break;
            case 'home': loadView('index.html', true); break;
            case 'exit': case 'quit':
                out('<span class="muted">connection kept alive. you can\'t leave that easily ;)</span>'); break;
            default:
                out('<span style="color:var(--amber)">command not found: ' + esc(name) + '</span>');
                out('<span class="muted">type</span> <span class="accent">help</span> <span class="muted">for commands</span>');
        }
    }

    function runSubmit(cmd) {
        echoCmd(cmd);
        var trimmed = cmd.trim();
        if (trimmed) historyArr.push(trimmed);
        hidx = null;
        if (!trimmed) return;
        var parts = trimmed.split(/\s+/);
        process(parts[0].toLowerCase(), parts.slice(1));
    }

    function resizeInput() {
        if (!input || !sizer) return;
        sizer.textContent = input.value;
        input.style.width = (sizer.offsetWidth + 2) + 'px';
    }
    function clearInput() { if (input) { input.value = ''; resizeInput(); } }
    function focusInput() { if (input) input.focus(); scrollBottom(); }

    function termKeydown(e) {
        if (input.readOnly) { e.preventDefault(); return; }
        if (e.key === 'Enter') {
            e.preventDefault();
            var cmd = input.value;
            clearInput();
            runSubmit(cmd);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!historyArr.length) return;
            hidx = hidx === null ? historyArr.length - 1 : Math.max(0, hidx - 1);
            input.value = historyArr[hidx]; resizeInput();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (hidx === null) return;
            hidx++;
            if (hidx >= historyArr.length) { hidx = null; input.value = ''; }
            else input.value = historyArr[hidx];
            resizeInput();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            var v = input.value.trim().toLowerCase();
            if (!v) return;
            var matches = COMMAND_NAMES.filter(function (c) { return c.indexOf(v) === 0; });
            if (matches.length === 1) { input.value = matches[0]; resizeInput(); }
            else if (matches.length > 1) { out('<span class="muted">' + matches.join('  ') + '</span>'); }
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault(); output.innerHTML = '';
        }
    }

    function initTerminal() {
        consoleEl = document.getElementById('console');
        output = document.getElementById('console-output');
        inputLine = document.getElementById('input-line');
        input = document.getElementById('console-input');
        sizer = document.getElementById('sizer');
        if (!consoleEl || !input) return;
        input.addEventListener('input', resizeInput);
        consoleEl.addEventListener('click', function () { if (!input.readOnly) input.focus(); });
        input.addEventListener('focus', function () { inputLine.classList.remove('blurred'); });
        input.addEventListener('blur', function () { inputLine.classList.add('blurred'); });
        input.addEventListener('keydown', termKeydown);
    }

    /* ---------- typing helpers (auto-intro) ---------- */
    function typeInto(text, done) {
        if (!input) return;
        if (reduced) { input.value = text; resizeInput(); return done(); }
        var i = 0;
        (function step() {
            if (!input) return;
            input.value = text.slice(0, i);
            resizeInput(); scrollBottom();
            if (i < text.length) { i++; setTimeout(step, 55); }
            else setTimeout(done, 320);
        })();
    }

    function startIntro() {
        if (!consoleEl || !input) return;     // terminal only exists on the home page
        inputLine.hidden = false;
        input.readOnly = true;
        if (reduced) {
            runSubmit('whoami'); runSubmit('help');
            input.readOnly = false; focusInput(); return;
        }
        typeInto('whoami', function () {
            runSubmit('whoami'); clearInput();
            typeInto('help', function () {
                runSubmit('help'); clearInput();
                out('<span class="muted">// target acquired: ' + esc(_f.plat) + ' — you\'re already being logged. try</span> <span class="accent">trace</span>');
                input.readOnly = false; focusInput();
            });
        });
    }

    /* ============================================================
       CONTACT FORM (front-end only; set FORM_ENDPOINT for real mail)
    ============================================================ */
    var FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxabcd'
    function initForm() {
        var form = document.getElementById('contact-form');
        if (!form) return;
        var msg = document.getElementById('form-message');
        function showMsg(text, type) { if (msg) { msg.textContent = text; msg.className = 'form-message ' + type; } }
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var message = document.getElementById('message').value.trim();
            if (!name || !email || !message) { showMsg('! all fields required', 'err'); return; }
            if (FORM_ENDPOINT) {
                fetch(FORM_ENDPOINT, {
                    method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
                }).then(function (r) {
                    if (r.ok) { showMsg('> transmission sent. I\'ll reply soon.', 'ok'); form.reset(); }
                    else showMsg('! send failed — try email instead', 'err');
                }).catch(function () { showMsg('! network error — try email instead', 'err'); });
            } else {
                showMsg('> message captured (demo). Set FORM_ENDPOINT to receive mail.', 'ok');
                form.reset();
            }
        });
    }

    /* ============================================================
       LIVE PROGRESS TRACKER  (renders data/progress.json)
       To update your stats, edit data/progress.json — the page always
       reflects that file. (HTB can be auto-updated via a GitHub Action.)
    ============================================================ */
    function bar(pct) {
        pct = Math.max(0, Math.min(100, pct || 0));
        return '<div class="bar"><span class="fill animate" style="--w:' + pct + '%"></span></div>';
    }
    function renderProgress(root, d) {
        var h = '<p class="prog-updated"><span class="live-dot"></span> live from ' +
            '<span class="accent">data/progress.json</span>' +
            (d.updated ? ' · last updated <span class="accent">' + esc(d.updated) + '</span>' : '') + '</p>';
        h += '<div class="prog-grid">';

        var a = d.htb_academy;
        if (a) {
            h += '<article class="prog-card reveal">';
            h += '<div class="prog-head"><h3>HTB Academy</h3>' +
                (a.cert ? '<span class="prog-badge">' + esc(a.cert) + '</span>' : '') + '</div>';
            if (a.cert_full) h += '<p class="prog-sub">' + esc(a.cert_full) + ' path</p>';
            var ap = a.path_progress || 0;
            h += '<div class="prog-row"><span>path progress</span><span class="accent">' + ap + '%</span></div>' + bar(ap);
            h += '<div class="prog-stats">';
            if (a.modules_done != null) h += '<div><span class="num">' + a.modules_done +
                (a.modules_total ? '<span class="muted">/' + a.modules_total + '</span>' : '') + '</span><span class="lbl">modules</span></div>';
            if (a.cubes != null) h += '<div><span class="num">' + a.cubes + '</span><span class="lbl">cubes</span></div>';
            h += '</div>';
            if (a.recent_modules && a.recent_modules.length) {
                h += '<p class="prog-mini">recent modules</p><ul class="prog-list">';
                a.recent_modules.forEach(function (m) { h += '<li>' + esc(m) + '</li>'; });
                h += '</ul>';
            }
            h += '</article>';
        }

        var p = d.portswigger;
        if (p) {
            h += '<article class="prog-card reveal">';
            h += '<div class="prog-head"><h3>PortSwigger</h3>' +
                (p.solved != null && p.total != null ? '<span class="prog-badge">' + p.solved + '/' + p.total + '</span>' : '') + '</div>';
            h += '<p class="prog-sub">Web Security Academy labs</p>';
            var pp = p.progress != null ? p.progress : (p.total ? Math.round(p.solved / p.total * 100) : 0);
            h += '<div class="prog-row"><span>labs solved</span><span class="accent">' + pp + '%</span></div>' + bar(pp);
            if (p.by_topic && p.by_topic.length) {
                h += '<div class="prog-topics">';
                p.by_topic.forEach(function (t) {
                    var tp = t.total ? Math.round(t.solved / t.total * 100) : 0;
                    h += '<div class="topic"><div class="prog-row"><span>' + esc(t.name) +
                        '</span><span class="muted">' + t.solved + '/' + t.total + '</span></div>' + bar(tp) + '</div>';
                });
                h += '</div>';
            }
            h += '</article>';
        }

        var l = d.htb_labs;
        if (l) {
            h += '<article class="prog-card reveal">';
            h += '<div class="prog-head"><h3>HTB Machines</h3>' +
                (l.rank ? '<span class="prog-badge">' + esc(l.rank) + '</span>' : '') + '</div>';
            h += '<p class="prog-sub">Hack The Box — labs pwned</p>';
            h += '<div class="prog-stats wide">';
            if (l.machines_owned != null) h += '<div><span class="num">' + l.machines_owned + '</span><span class="lbl">owned</span></div>';
            if (l.user_owns != null) h += '<div><span class="num">' + l.user_owns + '</span><span class="lbl">user</span></div>';
            if (l.system_owns != null) h += '<div><span class="num">' + l.system_owns + '</span><span class="lbl">system</span></div>';
            h += '</div>';
            if (l.recent && l.recent.length) {
                h += '<p class="prog-mini">recently pwned</p><ul class="prog-machines">';
                l.recent.forEach(function (m) {
                    h += '<li><span class="m-os m-' + esc(m.os || '') + '" title="' + esc(m.os || '') + '"></span>' +
                        '<span class="m-name">' + esc(m.name || '') + '</span>' +
                        '<span class="m-diff diff-' + esc(m.difficulty || '') + '">' + esc(m.difficulty || '') + '</span>' +
                        (m.date ? '<span class="m-date">' + esc(m.date) + '</span>' : '') + '</li>';
                });
                h += '</ul>';
            }
            h += '</article>';
        }

        h += '</div>';
        root.innerHTML = h;
        observeReveals();
    }
    function initProgress() {
        var root = document.getElementById('progress-root');
        if (!root) return;
        fetch('data/progress.json', { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
            .then(function (d) { renderProgress(root, d); })
            .catch(function () {
                root.innerHTML = '<p class="muted">could not load <span class="accent">data/progress.json</span>. ' +
                    'serve over http (not file://) and check the file exists.</p>';
            });
    }

    /* ---------- per-view setup (runs on first load + every router swap) ---------- */
    function initView() {
        setActiveNav();
        observeReveals();
        initTerminal();
        initForm();
        initProgress();
    }

    /* ============================================================
       BOOT / LOGIN SEQUENCE (first load only)
    ============================================================ */
    function fpGet() {
        var ua = navigator.userAgent || '';
        var plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || 'unknown';
        var m = ua.match(/(Firefox|Edg|OPR|Chrome|Safari)\/[\d.]+/);
        var br = m ? m[0].replace('Edg', 'Edge').replace('OPR', 'Opera') : 'unknown-agent';
        var tz = 'unknown';
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'; } catch (e) {}
        return {
            plat: plat, br: br, tz: tz,
            res: window.screen.width + 'x' + window.screen.height,
            time: new Date().toLocaleTimeString(),
            cores: navigator.hardwareConcurrency || '?'
        };
    }
    var _f = fpGet();

    function runBootOrIntro() {
        var boot = document.getElementById('boot');
        var bootLog = document.getElementById('boot-log');
        var bootDone = false;
        var BOOT_LINES = [
            '<span class="tag">[BOOT]</span> tanathorn_sec OS 4.8.0-kali (tty1)',
            '<span class="ok">[ OK ]</span> mounting /dev/secure',
            '<span class="ok">[ OK ]</span> loading modules: netfilter tun crypto',
            '<span class="ok">[ OK ]</span> starting service: tor.service',
            '<span class="ok">[ OK ]</span> starting service: openvpn@htb.service',
            '<span class="ok">[ OK ]</span> tun0 up — 10.10.14.7',
            '<span class="tag">[ ** ]</span> fingerprinting client ................. done',
            '<span class="bad">[ !! ]</span> host: ' + esc(_f.plat) + '  ·  ' + _f.res + '  ·  ' + _f.cores + ' cores',
            '<span class="bad">[ !! ]</span> agent: ' + esc(_f.br),
            '<span class="bad">[ !! ]</span> timezone: ' + esc(_f.tz) + '  ·  local time: ' + _f.time,
            '<span class="ok">[ OK ]</span> decrypting portfolio payload (AES-256-GCM)',
            '<span class="warn">[WARN]</span> intrusion countermeasures: DISABLED',
            '<span class="bad">[WARN]</span> you are being watched.',
            '<span class="ok">[ OK ]</span> spawning /bin/zsh',
            '',
            '<span class="granted">⚠  ACCESS GRANTED  ⚠</span>'
        ];
        function finishBoot() {
            if (bootDone) return;
            bootDone = true;
            try { sessionStorage.setItem('booted_v2', '1'); } catch (e) {}
            if (boot) {
                boot.classList.add('done');
                setTimeout(function () { boot.style.display = 'none'; }, 500);
            }
            startIntro();
        }
        function runBoot() {
            var i = 0;
            (function step() {
                if (bootDone) return;
                bootLog.innerHTML += BOOT_LINES[i] + '\n';
                i++;
                if (i < BOOT_LINES.length) setTimeout(step, i === BOOT_LINES.length - 1 ? 280 : 80);
                else setTimeout(finishBoot, 900);
            })();
        }
        var alreadyBooted = false;
        try { alreadyBooted = !!sessionStorage.getItem('booted_v2'); } catch (e) {}
        if (!boot || reduced || alreadyBooted) {
            if (boot) boot.style.display = 'none';
            startIntro();
        } else {
            boot.addEventListener('click', finishBoot);
            document.addEventListener('keydown', function once() {
                finishBoot();
                document.removeEventListener('keydown', once);
            });
            runBoot();
        }
    }

    /* ============================================================
       BACKGROUND FX (built once, persist)
    ============================================================ */
    function initGlitch() {
        if (reduced) return;
        (function glitchLoop() {
            var delay = 7000 + Math.random() * 9000;
            setTimeout(function () {
                if (!document.hidden) {
                    document.body.classList.add('glitching');
                    setTimeout(function () { document.body.classList.remove('glitching'); }, 360);
                }
                glitchLoop();
            }, delay);
        })();
    }
    function initMatrix() {
        var canvas = document.getElementById('matrix');
        if (!canvas || reduced) return;
        var ctx = canvas.getContext('2d');
        var glyphs = 'アイウエオカ01<>/{}[]#$%&*+=ABCDEFGHKLMNPRSTXYZ'.split('');
        var fontSize = 14, columns, drops;
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            drops = [];
            for (var i = 0; i < columns; i++) drops[i] = Math.random() * -100;
        }
        resize();
        window.addEventListener('resize', resize);
        setInterval(function () {
            ctx.fillStyle = 'rgba(10,10,11,0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = fontSize + 'px monospace';
            for (var i = 0; i < drops.length; i++) {
                var ch = glyphs[Math.floor(Math.random() * glyphs.length)];
                ctx.fillStyle = Math.random() > 0.97 ? '#ffffff' : '#ff003c';
                ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }, 55);
    }

    /* ============================================================
       STARTUP
    ============================================================ */
    buildChrome();      // persistent header / footer / background
    setupRouter();      // link + arrow + back-button handling
    initGlitch();
    initMatrix();
    initView();         // wire up the page that loaded
    runBootOrIntro();   // boot once on home, otherwise nothing visible
})();
