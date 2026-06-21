/* ============================================================
   Offensive Security Portfolio — interactions
   - i18n: English / 日本語 / 繁體中文 (switch in header)
   - persistent shell + client-side router (#view swaps)
   - boot/login sequence, interactive terminal, reveals, matrix, form, live progress
   Code-like tokens (commands, tool names, prompts, IPs) stay in English on purpose.
============================================================ */
(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============================================================
       i18n
    ============================================================ */
    var LANG = 'en';
    try { LANG = localStorage.getItem('lang') || 'en'; } catch (e) {}
    if (['en', 'ja', 'zh'].indexOf(LANG) === -1) LANG = 'en';
    document.documentElement.lang = LANG === 'zh' ? 'zh-Hant' : LANG;

    /* ------------------------------------------------------------------
       HOW TO UPDATE  (see HOW-TO-UPDATE.md for step-by-step examples)
       • English is the source of truth. To add or change content, just edit
         the English text in the .html pages — it shows in every language.
       • Translating is OPTIONAL. Untranslated text simply shows in English.
       • To translate one piece of text: tag the element with
         data-i18n="my.key" in the HTML, then add a line below:
             'my.key': { ja: '日本語', zh: '繁體中文' }
         (no 'en' needed for page text — that comes from the HTML.)
       • Terminal command output is the TXT object further down (edit .en).
    ------------------------------------------------------------------ */
    var I18N = {
        // ---- nav + chrome ----
        'nav.home':        { en: 'home',         ja: 'ホーム',         zh: '首頁' },
        'nav.whoami':      { en: 'whoami',       ja: '自己紹介',       zh: '關於我' },
        'nav.current_ops': { en: 'current_ops',  ja: '進行中の作戦',   zh: '進行中專案' },
        'nav.learning':    { en: 'learning',     ja: '学習',           zh: '學習' },
        'nav.progress':    { en: 'progress',     ja: '進捗',           zh: '進度' },
        'nav.arsenal':     { en: 'arsenal',      ja: '武器庫',         zh: '工具庫' },
        'nav.roadmap':     { en: 'roadmap',      ja: 'ロードマップ',   zh: '路線圖' },
        'nav.contact':     { en: 'contact',      ja: '連絡先',         zh: '聯絡' },
        'nav.blog':        { en: 'blog',         ja: 'ブログ',         zh: '部落格' },
        'footer.echo':     { en: 'stay curious, stay ethical', ja: '好奇心を持ち、倫理を守れ', zh: '保持好奇，恪守道德' },
        'footer.hint':     { en: 'switch pages',  ja: 'ページ切替',    zh: '切換頁面' },
        'footer.copy':     { en: 'built in the terminal. all exploits authorized.',
                             ja: 'ターミナルで構築。全エクスプロイト承認済み。',
                             zh: '於終端機打造。所有滲透測試皆經授權。' },

        // ---- hero ----
        'hero.hint': {
            en: 'interactive shell — type <span class="accent">help</span> and hit <span class="accent">enter</span>, or use the menu above',
            ja: '対話型シェル — <span class="accent">help</span> と入力して <span class="accent">enter</span>、または上のメニューから選択',
            zh: '互動式終端 — 輸入 <span class="accent">help</span> 後按 <span class="accent">enter</span>，或使用上方選單'
        },

        // ---- section subtitles ----
        'ops.sub':      { en: '// what I\'m working on right now', ja: '// 今取り組んでいること', zh: '// 我目前正在進行的工作' },
        'arsenal.sub':  { en: '// tools &amp; tech',  ja: '// ツールと技術',     zh: '// 工具與技術' },
        'roadmap.sub':  { en: '// certifications &amp; goals', ja: '// 資格と目標', zh: '// 證照與目標' },
        'progress.sub': { en: '// live training stats', ja: '// リアルタイム学習統計', zh: '// 即時訓練數據' },

        // ---- current ops (cards): status tags, the "progress" label, and per-op title/desc ----
        'ops.done':     { ja: '✓ 完了',   zh: '✓ 完成' },
        'ops.active':   { ja: '● 進行中', zh: '● 進行中' },
        'ops.progress': { ja: '進捗',     zh: '進度' },
        'ops.op1.title': { ja: 'HTB CJCA 対策', zh: 'HTB CJCA 準備' },
        'ops.op1.desc': {
            ja: 'HTB Certified Junior Cybersecurity Associate (HTB CJCA) は、受験者のセキュリティ評価スキルを問う実践重視の資格です。保有者は攻撃・防御の両面にわたる基礎的な技術力を示し、一般的な脆弱性の特定、基本的な（ポスト）エクスプロイト、潜在的なセキュリティ上の弱点の認識ができます。さらに SIEM を用いたセキュリティ監視、ネットワークトラフィックやログの分析、侵入検知も行えます。これらのハンズオン経験とハイブリッドなスキルセットにより、企業環境におけるセキュリティ課題の評価と報告が可能です。',
            zh: 'HTB Certified Junior Cybersecurity Associate (HTB CJCA) 是一項高度實作導向的認證，評估考生的資安評估能力。持證者展現橫跨攻擊與防禦領域的基礎技術能力，能夠辨識常見漏洞、執行基本的（後）滲透，並察覺潛在的安全缺口。他們也能進行 SIEM 輔助的安全監控、分析網路流量與日誌，以及偵測入侵。憑藉這些實作經驗與混合技能組合，能在企業環境中評估並回報資安問題。'
        },
        'ops.op2.title': { ja: 'Web アプリ診断ラボ', zh: 'Web 應用滲透實驗室' },
        'ops.op2.desc': {
            ja: 'OWASP Top 10（SQLi・XSS・SSRF・IDOR）を含む、意図的に脆弱な Web アプリを構築。',
            zh: '建立一個刻意設計含 OWASP Top 10（SQLi、XSS、SSRF、IDOR）漏洞的 Web 應用。'
        },
        'ops.op3.title': { ja: 'HTB Certified Offensive AI Expert 対策', zh: 'HTB Certified Offensive AI Expert 準備' },
        'ops.op3.desc': {
            ja: 'HTB COAE は、Google と共同開発したカリキュラムに基づき、AI・ML システムの脆弱性の特定と悪用に関する知識を問う実践型資格です。保有者は敵対的機械学習、LLM のプロンプトインジェクションとジェイルブレイク、LLM 出力の悪用、AI アプリケーション・システムのセキュリティ、AI 防御、AI プライバシーの能力を示します。カリキュラムは Google の SAIF、OWASP ML Security Top 10、OWASP Agentic Top 10、OWASP Top 10 for LLM Applications 2025 に準拠しています。保有者はプロフェッショナルな AI レッドチーム評価を実施し、クライアント向けのレポートを作成できます。',
            zh: 'HTB COAE 是一項實作型認證，依據與 Google 共同開發的課程，評估辨識與利用 AI 及 ML 系統漏洞的知識。持證者展現對抗式機器學習、LLM 提示注入與越獄、LLM 輸出利用、AI 應用與系統安全、AI 防禦及 AI 隱私等能力。課程對齊 Google 的 SAIF、OWASP ML Security Top 10、OWASP Agentic Top 10，以及 OWASP Top 10 for LLM Applications 2025。持證者也能執行專業的 AI 紅隊評估並撰寫可交付客戶的報告。'
        },
        'ops.op4.title': { ja: '脆弱な Web アプリ演習', zh: '漏洞 Web 應用練習' },
        'ops.op4.desc': {
            ja: '意図的に脆弱な Web アプリ（OWASP Juice Shop・DVWA・WebGoat）で実践演習を行い、OWASP Top 10 ——SQL インジェクション、XSS、CSRF、アクセス制御の不備、SSRF、安全でないデシリアライゼーション——を徹底的に練習。発見した内容と攻略記事はブログに反映。',
            zh: '在刻意設計的漏洞 Web 應用（OWASP Juice Shop、DVWA、WebGoat）上進行實戰練習，鑽研 OWASP Top 10：SQL injection、XSS、CSRF、存取控制失效、SSRF 與不安全的反序列化。發現與攻略筆記都會放上部落格。'
        },

        // ---- about ----
        'about.bio1': {
            en: 'Hi, I\'m <span class="accent">Tanathorn</span> — a security enthusiast transitioning into offensive security. I spend my time on Hack The Box &amp; HTB Academy, breaking down web apps, and documenting everything I learn.',
            ja: 'こんにちは、<span class="accent">Tanathorn</span> です — オフェンシブセキュリティを目指すセキュリティ愛好家です。Hack The Box と HTB Academy に没頭し、Web アプリを分解しながら学んだことをすべて記録しています。',
            zh: '嗨，我是 <span class="accent">Tanathorn</span> — 一位正轉向攻擊性資安的資安愛好者。我泡在 Hack The Box 與 HTB Academy，拆解 Web 應用程式，並記錄學到的每一件事。'
        },
        'about.bio2': {
            en: 'My objective is to become a professional penetration tester. I\'ve completed the <span class="accent">HTB CWES, CPTS, CJCA</span> learning paths and I\'m now working through the <span class="accent">HTB Certified Offensive AI Expert</span> path (exams + OSCP next). This website serves as my active lab notebook, documenting my attack strategies, ongoing research, and technical growth.',
            ja: '目標はプロのペネトレーションテスターになることです。<span class="accent">HTB CWES・CPTS・CJCA</span> の学習パスを修了し、現在は <span class="accent">HTB Certified Offensive AI Expert</span> パスに取り組んでいます（試験と OSCP はこれから）。このサイトは私のラボノート — 攻撃手法・継続的なリサーチ・技術的な成長を記録しています。',
            zh: '我的目標是成為專業滲透測試員。我已完成 <span class="accent">HTB CWES、CPTS、CJCA</span> 學習路線，目前正在進行 <span class="accent">HTB Certified Offensive AI Expert</span> 路線（考試與 OSCP 接下來）。這個網站是我的實驗筆記 — 記錄我的攻擊策略、持續研究與技術成長。'
        },
        'stat.boxes':    { en: 'boxes rooted',     ja: '攻略したマシン',   zh: '攻克的機器' },
        'stat.ctfs':     { en: 'CTFs played',      ja: '参加した CTF',     zh: '參加的 CTF' },
        'stat.writeups': { en: 'writeups',         ja: 'ライトアップ',     zh: '技術文章' },
        'stat.certs':    { en: 'certs in progress',ja: '取得中の資格',     zh: '進行中的證照' },

        // ---- ops ----
        'op.active':   { en: '● ACTIVE',  ja: '● 進行中', zh: '● 進行中' },
        'op.paused':   { en: '❚❚ PAUSED', ja: '❚❚ 一時停止', zh: '❚❚ 暫停' },
        'op.progress': { en: 'progress',  ja: '進捗',     zh: '進度' },
        'op.notes':    { en: '&gt; view notes', ja: '&gt; ノートを見る', zh: '&gt; 查看筆記' },
        'op.repo':     { en: '&gt; view repo',  ja: '&gt; リポジトリを見る', zh: '&gt; 查看儲存庫' },
        'op1.title':   { en: 'HTB Season Lab', ja: 'HTB シーズン・ラボ', zh: 'HTB 賽季實驗室' },
        'op1.desc':    { en: 'Rooting weekly Hack The Box machines, documenting privilege-escalation paths and building a personal methodology cheatsheet.',
                         ja: '毎週 Hack The Box のマシンを攻略し、権限昇格の手順を記録して、自分用の方法論チートシートを作成しています。',
                         zh: '每週攻克 Hack The Box 機器，記錄提權路徑，並建立個人方法論小抄。' },
        'op2.title':   { en: 'Web App Pentest Lab', ja: 'Web アプリ診断ラボ', zh: 'Web 應用滲透實驗' },
        'op2.desc':    { en: 'Building a deliberately vulnerable web app + writing my own exploit scripts for OWASP Top 10 (SQLi, XSS, SSRF, IDOR).',
                         ja: '意図的に脆弱な Web アプリを構築し、OWASP Top 10（SQLi、XSS、SSRF、IDOR）向けの自作エクスプロイトを書いています。',
                         zh: '打造刻意設計的脆弱 Web 應用，並針對 OWASP Top 10（SQLi、XSS、SSRF、IDOR）撰寫自己的攻擊腳本。' },
        'op3.title':   { en: 'Home AD Lab', ja: '自宅 AD ラボ', zh: '家用 AD 實驗' },
        'op3.desc':    { en: 'Active Directory attack lab in VirtualBox — Kerberoasting, AS-REP roasting, lateral movement, and BloodHound mapping.',
                         ja: 'VirtualBox 上の Active Directory 攻撃ラボ — Kerberoasting、AS-REP roasting、横展開、BloodHound マッピング。',
                         zh: '在 VirtualBox 中的 Active Directory 攻擊實驗 — Kerberoasting、AS-REP roasting、橫向移動與 BloodHound 對應。' },

        // ---- learning modules + board ----
        'mod.ad':      { en: 'Active Directory Enumeration &amp; Attacks', ja: 'Active Directory の列挙と攻撃', zh: 'Active Directory 列舉與攻擊' },
        'mod.services':{ en: 'Attacking Common Services', ja: '一般的なサービスへの攻撃', zh: '攻擊常見服務' },
        'mod.privesc': { en: 'Privilege Escalation — Linux &amp; Windows', ja: '権限昇格 — Linux と Windows', zh: '提權 — Linux 與 Windows' },
        'mod.web':     { en: 'Web Attacks &amp; SQL Injection', ja: 'Web 攻撃と SQL インジェクション', zh: 'Web 攻擊與 SQL Injection' },
        'mod.pivot':   { en: 'Pivoting, Tunneling &amp; Port Forwarding', ja: 'ピボット・トンネリング・ポート転送', zh: '樞紐跳板、隧道與通訊埠轉送' },
        'mod.report':  { en: 'Documentation &amp; Reporting', ja: 'ドキュメント作成とレポート', zh: '文件撰寫與報告' },
        'board.now':   { en: 'now',  ja: '進行中',   zh: '進行中' },
        'board.next':  { en: 'next', ja: '次に',     zh: '接下來' },
        'board.done':  { en: 'done', ja: '完了',     zh: '已完成' },
        'board.now2':  { en: 'CPTS exam prep — full lab walkthroughs', ja: 'CPTS 試験対策 — ラボの完全攻略', zh: 'CPTS 考試準備 — 完整實驗演練' },
        'board.done1': { en: 'Network Enumeration with Nmap', ja: 'Nmap によるネットワーク列挙', zh: '使用 Nmap 進行網路列舉' },
        'board.done2': { en: 'Footprinting &amp; Password Attacks', ja: 'フットプリンティングとパスワード攻撃', zh: '足跡偵查與密碼攻擊' },

        // ---- arsenal categories ----
        'ars.recon':   { en: 'recon &amp; scanning', ja: '偵察とスキャン', zh: '偵察與掃描' },
        'ars.exploit': { en: 'exploitation', ja: 'エクスプロイト', zh: '漏洞利用' },
        'ars.post':    { en: 'post-exploitation', ja: 'ポストエクスプロイト', zh: '後滲透' },
        'ars.lang':    { en: 'languages &amp; os', ja: '言語と OS', zh: '語言與作業系統' },

        // ---- roadmap ----
        'rm.completed':  { en: '✓ COMPLETED', ja: '✓ 完了', zh: '✓ 已完成' },
        'rm.inprogress': { en: '● IN PROGRESS', ja: '● 進行中', zh: '● 進行中' },
        'rm.studied':    { en: '◐ COMPLETED — EXAM NEXT', ja: '◐ 修了 — 試験はこれから', zh: '◐ 已完成 — 尚未考試' },
        'rm.planned':    { en: '○ PLANNED', ja: '○ 予定', zh: '○ 計畫中' },
        'rm1.title': { en: 'HTB Academy — Foundational Modules', ja: 'HTB Academy — 基礎モジュール', zh: 'HTB Academy — 基礎模組' },
        'rm1.desc':  { en: 'Getting started, network enumeration with Nmap, footprinting, and password attacks.',
                       ja: '入門、Nmap によるネットワーク列挙、フットプリンティング、パスワード攻撃。',
                       zh: '入門、使用 Nmap 進行網路列舉、足跡偵查與密碼攻擊。' },
        'rm2.desc':  { en: 'Completed the HTB Academy Penetration Tester learning path — preparing for the hands-on exam.',
                       ja: 'HTB Academy のペネトレーションテスター学習パスを修了 — 実技試験に向けて準備中。',
                       zh: '完成 HTB Academy 滲透測試員學習路線 — 正在準備實作考試。' },
        'rm3.desc':  { en: 'The big one. 24-hour hands-on exam. Goal for next year.',
                       ja: '本命。24 時間の実技試験。来年の目標。',
                       zh: '重頭戲。24 小時實作考試。明年的目標。' },
        'rm4.title': { en: 'CRTP / Red Team Path', ja: 'CRTP / レッドチーム・パス', zh: 'CRTP / 紅隊路線' },
        'rm4.desc':  { en: 'Active Directory &amp; red-team specialization after OSCP.',
                       ja: 'OSCP 後に Active Directory とレッドチームを専門に。',
                       zh: 'OSCP 之後專精 Active Directory 與紅隊。' },

        // ---- contact ----
        'contact.intro': { en: 'Open to CTF teams, study buddies, and junior pentest roles. Drop a message:',
                           ja: 'CTF チーム、勉強仲間、ジュニアのペンテスト職に興味があります。メッセージをどうぞ：',
                           zh: '歡迎 CTF 團隊、學習夥伴與初階滲透測試職缺。留個訊息給我：' },
        'field.name':    { en: 'name',    ja: '名前',     zh: '名稱' },
        'field.email':   { en: 'email',   ja: 'メール',   zh: '電子郵件' },
        'field.message': { en: 'message', ja: 'メッセージ', zh: '訊息' },
        'contact.send':  { en: '&gt; send transmission', ja: '&gt; 送信する', zh: '&gt; 送出訊息' },
        'ph.name':       { en: 'enter your name', ja: '名前を入力', zh: '輸入你的名稱' },
        'ph.message':    { en: 'type your message...', ja: 'メッセージを入力...', zh: '輸入你的訊息...' },

        // ---- progress (rendered by JS) ----
        'prog.liveFrom':     { en: 'live from', ja: 'ライブ取得元', zh: '即時來源' },
        'prog.lastUpdated':  { en: 'last updated', ja: '最終更新', zh: '最後更新' },
        'prog.pathProgress': { en: 'path progress', ja: 'パス進捗', zh: '路線進度' },
        'prog.modules':      { en: 'modules', ja: 'モジュール', zh: '模組' },
        'prog.cubes':        { en: 'cubes', ja: 'キューブ', zh: 'cubes' },
        'prog.path':         { en: 'path', ja: 'パス', zh: '路線' },
        'prog.recentModules':{ en: 'recent modules', ja: '最近のモジュール', zh: '最近的模組' },
        'prog.labsSolved':   { en: 'labs solved', ja: '解いたラボ', zh: '已解實驗' },
        'prog.webacademy':   { en: 'Web Security Academy labs', ja: 'Web Security Academy のラボ', zh: 'Web Security Academy 實驗' },
        'prog.htbMachines':  { en: 'HTB Machines', ja: 'HTB マシン', zh: 'HTB 機器' },
        'prog.htbLabsSub':   { en: 'Hack The Box — labs pwned', ja: 'Hack The Box — 攻略したマシン', zh: 'Hack The Box — 已攻克機器' },
        'prog.owned':        { en: 'owned', ja: '攻略', zh: '攻克' },
        'prog.user':         { en: 'user', ja: 'ユーザー', zh: 'user' },
        'prog.system':       { en: 'system', ja: 'システム', zh: 'system' },
        'prog.recentPwned':  { en: 'recently pwned', ja: '最近攻略', zh: '最近攻克' },
        'prog.pathsDone':    { en: 'paths completed', ja: '修了パス', zh: '完成路線' },
        'prog.kpiLabs':      { en: 'PortSwigger labs', ja: 'PortSwigger ラボ', zh: 'PortSwigger 實驗' },
        'prog.kpiBoxes':     { en: 'machines owned', ja: '攻略マシン', zh: '攻克機器' },
        'prog.learnPaths':   { en: 'Learning Paths', ja: '学習パス', zh: '學習路線' },
        'prog.learnPathsSub':{ en: 'HTB Academy job-role paths', ja: 'HTB Academy 職務別パス', zh: 'HTB Academy 職務路線' },
        'prog.topicsDone':   { en: 'topics 100%', ja: '完了トピック', zh: '完成主題' },
        'prog.byTopic':      { en: 'labs by topic', ja: 'トピック別ラボ', zh: '依主題分類' },
        'prog.syncing':      { en: 'syncing stats…', ja: '統計を同期中…', zh: '同步數據中…' },
        'prog.loadFail':     { en: 'could not load <span class="accent">data/progress.json</span>. serve over http (not file://).',
                               ja: '<span class="accent">data/progress.json</span> を読み込めませんでした。http で配信してください（file:// 不可）。',
                               zh: '無法載入 <span class="accent">data/progress.json</span>。請以 http 提供（非 file://）。' },

        // ---- terminal dynamic ----
        'term.notfound':  { en: 'command not found: ', ja: 'コマンドが見つかりません: ', zh: '找不到指令：' },
        'term.typehelp':  { en: 'type <span class="accent">help</span> for commands', ja: '<span class="accent">help</span> でコマンド一覧', zh: '輸入 <span class="accent">help</span> 查看指令' },
        'term.opening':   { en: 'opening', ja: '開いています', zh: '正在開啟' },
        'term.unknownsec':{ en: 'unknown section: ', ja: '不明なセクション: ', zh: '未知區段：' },
        'term.sudo':      { en: 'nice try — visitor has no root here 😏', ja: 'いい試みだ — 訪問者に root 権限はない 😏', zh: '想得美 — 訪客在這裡沒有 root 權限 😏' },
        'term.exit':      { en: 'connection kept alive. you can\'t leave that easily ;)', ja: '接続は維持されている。そう簡単には抜け出せない ;)', zh: '連線仍保持。你沒那麼容易離開 ;)' },
        'term.target':    { en: 'target acquired', ja: 'ターゲット捕捉', zh: '已鎖定目標' },
        'term.logged':    { en: 'you\'re already being logged.', ja: 'すでに記録されている。', zh: '你已被記錄。' },
        'term.try':       { en: 'try', ja: '試せ', zh: '試試' },
        'boot.watched':   { en: 'you are being watched.', ja: '監視されている。', zh: '你正被監視。' },
        'boot.granted':   { en: '⚠  ACCESS GRANTED  ⚠', ja: '⚠  アクセス許可  ⚠', zh: '⚠  存取已授權  ⚠' }
    };
    function t(key) {
        var e = I18N[key];
        if (!e) return key;
        return e[LANG] || e.en || key;
    }
    // English = whatever is written in the HTML (the source of truth). For ja/zh we
    // overlay a translation IF one exists; otherwise the English text stays. So you can
    // add/edit English freely and translating is always optional.
    function applyI18n(root) {
        if (LANG === 'en') return;
        root = root || document;
        root.querySelectorAll('[data-i18n]').forEach(function (el) {
            var v = I18N[el.getAttribute('data-i18n')];
            if (v && v[LANG]) el.textContent = v[LANG];
        });
        root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var v = I18N[el.getAttribute('data-i18n-html')];
            if (v && v[LANG]) el.innerHTML = v[LANG];
        });
        root.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
            var v = I18N[el.getAttribute('data-i18n-ph')];
            if (v && v[LANG]) el.setAttribute('placeholder', v[LANG]);
        });
    }

    /* ============================================================
       shared chrome (nav · background · footer) — built ONCE, persists
    ============================================================ */
    var NAV_ITEMS = [
        ['index.html', 'home'],
        ['about.html', 'whoami'],
        ['ops.html', 'current_ops'],
        ['learning.html', 'learning'],
        ['progress.html', 'progress'],
        ['arsenal.html', 'arsenal'],
        ['roadmap.html', 'roadmap'],
        ['blog.html', 'blog'],
        ['contact.html', 'contact']
    ];
    var LANGS = [['en', 'EN', 'English'], ['ja', '日本語', '日本語'], ['zh', '繁中', '繁體中文']];

    function buildChrome() {
        var navLinks = NAV_ITEMS.map(function (it) {
            return '<li><a href="' + it[0] + '">' + t('nav.' + it[1]) + '</a></li>';
        }).join('');
        var curLang = LANGS.filter(function (l) { return l[0] === LANG; })[0] || LANGS[0];
        var langOpts = LANGS.map(function (l) {
            return '<li><button class="lang-opt' + (l[0] === LANG ? ' active' : '') + '" data-lang="' + l[0] + '">' + l[2] + '</button></li>';
        }).join('');
        var langSelect = '<div class="lang-select" id="lang-select">' +
            '<button class="lang-current" aria-haspopup="true" aria-expanded="false">[ <span class="lang-label">' + curLang[1] + '</span> <span class="lang-caret">▾</span> ]</button>' +
            '<ul class="lang-menu">' + langOpts + '</ul></div>';
        var bg = '<canvas id="matrix"></canvas><div class="scanlines"></div>' +
            '<div class="noise"></div><div class="crt"></div>' +
            '<div class="glitch-overlay" aria-hidden="true"></div>';
        var header = '<header class="site-header"><nav class="navbar"><div class="container nav-inner">' +
            '<a href="index.html" class="logo"><span class="logo-prompt">root@tanathorn</span>:<span class="logo-path">~</span>$</a>' +
            '<div class="nav-right">' +
            '<ul class="nav-links">' + navLinks + '</ul>' +
            langSelect +
            '<button class="nav-toggle" aria-label="Toggle navigation">[ ::: ]</button>' +
            '</div></div></nav></header>';
        var footer = '<footer class="footer"><div class="container footer-inner">' +
            '<p class="footer-line"><span class="muted">$</span> echo "' + t('footer.echo') + '" <span class="cursor">█</span></p>' +
            '<p class="footer-hint"><span class="kbd">←</span> <span class="kbd">→</span> ' + t('footer.hint') + '</p>' +
            '<p class="footer-copy">&copy; <span id="year"></span> tanathorn // ' + t('footer.copy') + '</p>' +
            '</div></footer>';
        document.body.insertAdjacentHTML('afterbegin', bg + header);
        document.body.insertAdjacentHTML('beforeend', footer);
        var y = document.getElementById('year');
        if (y) y.textContent = new Date().getFullYear();

        var toggle = document.querySelector('.nav-toggle');
        var links = document.querySelector('.nav-links');
        if (toggle && links) {
            toggle.addEventListener('click', function () { links.classList.toggle('open'); });
            links.addEventListener('click', function (e) { if (e.target.closest('a')) links.classList.remove('open'); });
        }
        // language dropdown → open/close, then save + reload on select
        var langSel = document.getElementById('lang-select');
        if (langSel) {
            var curBtn = langSel.querySelector('.lang-current');
            curBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                langSel.classList.toggle('open');
                curBtn.setAttribute('aria-expanded', langSel.classList.contains('open'));
            });
            langSel.querySelectorAll('.lang-opt').forEach(function (b) {
                b.addEventListener('click', function () {
                    var lng = b.getAttribute('data-lang');
                    if (lng === LANG) { langSel.classList.remove('open'); return; }
                    try { localStorage.setItem('lang', lng); } catch (e) {}
                    location.reload();
                });
            });
            document.addEventListener('click', function () { langSel.classList.remove('open'); });
        }
    }

    function setActiveNav() {
        var page = location.pathname.split('/').pop() || 'index.html';
        if (/\/posts\//.test(location.pathname)) page = 'blog.html'; // post pages keep "blog" highlighted
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === page);
        });
    }

    /* ============================================================
       CLIENT-SIDE ROUTER
    ============================================================ */
    function loadView(url, push) {
        var view = document.getElementById('view');
        if (!view) { window.location.href = url; return; }
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
                if (consoleEl) startIntro();
            }, reduced ? 0 : 230);
        }).catch(function () { window.location.href = url; });
    }

    function setupRouter() {
        document.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            var a = e.target.closest && e.target.closest('a');
            if (!a || a.target === '_blank') return;
            var href = a.getAttribute('href') || '';
            if (!href || href.charAt(0) === '#') return;
            if (/^[a-z]+:/i.test(href) || href.indexOf('//') === 0) return;
            if (href.indexOf('/') !== -1) return; // subfolder links (posts/) load fully so their <base> applies
            if (!/\.html(\?|#|$)/.test(href)) return;
            e.preventDefault();
            loadView(href, true);
        });
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
            var n = e.key === 'ArrowRight' ? (idx + 1) % pages.length : (idx - 1 + pages.length) % pages.length;
            loadView(pages[n], true);
        });
        window.addEventListener('popstate', function () {
            loadView(location.pathname.split('/').pop() || 'index.html', false);
        });
    }

    /* ============================================================
       REVEAL + COUNTERS
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
        var raw = el.getAttribute('data-count') || '';
        var target = parseInt(raw, 10) || 0;
        var suffix = raw.replace(/^-?\d+\.?\d*/, ''); // keep any trailing text, e.g. "+" or "%"
        var dur = 1200, start = performance.now();
        (function tick(now) {
            var p = Math.min((now - start) / dur, 1);
            var n = (p < 1) ? Math.round(target * (1 - Math.pow(1 - p, 3))) : target;
            el.textContent = n + suffix;
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    // Clamp long .op-desc text to a few lines; add a "read more" toggle only when it overflows.
    function initReadMore() {
        var run = function () {
            document.querySelectorAll('.op-desc:not([data-rm])').forEach(function (desc) {
                desc.dataset.rm = '1';
                desc.classList.add('clamp');
                if (desc.scrollHeight - desc.clientHeight < 2) return; // fits in the clamp, no toggle needed
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'op-readmore';
                btn.textContent = 'read more ▾';
                desc.insertAdjacentElement('afterend', btn);
                btn.addEventListener('click', function () {
                    var clamped = desc.classList.toggle('clamp');
                    btn.textContent = clamped ? 'read more ▾' : 'read less ▴';
                });
            });
        };
        if (document.fonts && document.fonts.ready) { document.fonts.ready.then(run); }
        else { requestAnimationFrame(run); }
    }

    // Show each cert track's overall % (average of its module percentages).
    function initTrackPct() {
        document.querySelectorAll('.learn-track').forEach(function (track) {
            var out = track.querySelector('[data-track-pct]');
            var pcts = [].map.call(track.querySelectorAll('.learn-pct'), function (el) {
                return parseInt(el.textContent, 10) || 0;
            });
            if (!out || !pcts.length) return;
            var avg = Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length);
            out.textContent = avg + '%';
        });
    }

    /* ============================================================
       INTERACTIVE TERMINAL
    ============================================================ */
    var PAGES = {
        home: 'index.html', hero: 'index.html',
        about: 'about.html', whoami: 'about.html',
        ops: 'ops.html', projects: 'ops.html', current_ops: 'ops.html',
        learning: 'learning.html',
        progress: 'progress.html', stats: 'progress.html', htb: 'progress.html', portswigger: 'progress.html',
        skills: 'arsenal.html', arsenal: 'arsenal.html',
        certs: 'roadmap.html', roadmap: 'roadmap.html',
        blog: 'blog.html', writeups: 'blog.html', research: 'blog.html',
        contact: 'contact.html'
    };

    // terminal command output, per language
    var TXT = {
        HELP: {
            en: [
                '<span class="accent">available commands</span>',
                '  <span class="key">help</span> ........ this menu',
                '  <span class="key">whoami</span> ...... identity',
                '  <span class="key">about</span> ....... background / bio',
                '  <span class="key">ops</span> ......... current projects',
                '  <span class="key">learning</span> .... what I\'m studying',
                '  <span class="key">progress</span> .... live training stats',
                '  <span class="key">skills</span> ...... tools &amp; tech',
                '  <span class="key">certs</span> ....... certification roadmap',
                '  <span class="key">blog</span> ........ notes &amp; research',
                '  <span class="key">contact</span> ..... how to reach me',
                '  <span class="key">trace</span> ....... fingerprint the visitor (you)',
                '  <span class="muted">extras:</span> ls · date · echo · clear · history · sudo',
                '<span class="muted">tip: type</span> goto ops <span class="muted">to open that page.</span>'
            ],
            ja: [
                '<span class="accent">利用可能なコマンド</span>',
                '  <span class="key">help</span> ........ このメニュー',
                '  <span class="key">whoami</span> ...... 自己紹介',
                '  <span class="key">about</span> ....... 経歴 / プロフィール',
                '  <span class="key">ops</span> ......... 進行中のプロジェクト',
                '  <span class="key">learning</span> .... 学習中の内容',
                '  <span class="key">progress</span> .... リアルタイム学習統計',
                '  <span class="key">skills</span> ...... ツールと技術',
                '  <span class="key">certs</span> ....... 資格ロードマップ',
                '  <span class="key">blog</span> ........ メモと研究',
                '  <span class="key">contact</span> ..... 連絡方法',
                '  <span class="key">trace</span> ....... 訪問者（あなた）を解析',
                '  <span class="muted">その他:</span> ls · date · echo · clear · history · sudo',
                '<span class="muted">ヒント:</span> goto ops <span class="muted">でそのページを開く。</span>'
            ],
            zh: [
                '<span class="accent">可用指令</span>',
                '  <span class="key">help</span> ........ 這份選單',
                '  <span class="key">whoami</span> ...... 身分',
                '  <span class="key">about</span> ....... 背景 / 簡介',
                '  <span class="key">ops</span> ......... 進行中專案',
                '  <span class="key">learning</span> .... 我正在學的東西',
                '  <span class="key">progress</span> .... 即時訓練數據',
                '  <span class="key">skills</span> ...... 工具與技術',
                '  <span class="key">certs</span> ....... 證照路線圖',
                '  <span class="key">blog</span> ........ 筆記與研究',
                '  <span class="key">contact</span> ..... 如何聯絡我',
                '  <span class="key">trace</span> ....... 對訪客（你）取得指紋',
                '  <span class="muted">其他:</span> ls · date · echo · clear · history · sudo',
                '<span class="muted">提示：輸入</span> goto ops <span class="muted">開啟該頁。</span>'
            ]
        },
        WHOAMI: {
            en: ['tanathorn <span class="muted">::</span> offensive security / penetration tester',
                 '<span class="muted">Finished CWES, CPTS &amp; CJCA — now on HTB Certified Offensive AI Expert. I break web apps, AD, and boxes for sport.</span>'],
            ja: ['tanathorn <span class="muted">::</span> オフェンシブセキュリティ / ペネトレーションテスター',
                 '<span class="muted">CWES・CPTS・CJCA 修了 — 現在は HTB Certified Offensive AI Expert。Web アプリ、AD、マシンを趣味で攻略中。</span>'],
            zh: ['tanathorn <span class="muted">::</span> 攻擊性資安 / 滲透測試員',
                 '<span class="muted">完成 CWES、CPTS 與 CJCA — 目前正攻 HTB Certified Offensive AI Expert。把破解 Web 應用、AD 與機器當興趣。</span>']
        },
        ABOUT: {
            en: ['<span class="muted">$ cat about.txt</span>',
                 'Security enthusiast transitioning into offensive security.',
                 'I live on Hack The Box &amp; HTB Academy, dismantle web apps,',
                 'and document every exploit. CJCA path done — now Offensive AI Expert &rarr; OSCP.',
                 '<span class="muted">&rarr; run</span> goto about'],
            ja: ['<span class="muted">$ cat about.txt</span>',
                 'オフェンシブセキュリティを目指すセキュリティ愛好家。',
                 'Hack The Box と HTB Academy に没頭し、Web アプリを分解して、',
                 '全エクスプロイトを記録。CJCA パス修了 — 現在 Offensive AI Expert &rarr; OSCP。',
                 '<span class="muted">&rarr; 実行</span> goto about'],
            zh: ['<span class="muted">$ cat about.txt</span>',
                 '正轉向攻擊性資安的資安愛好者。',
                 '我泡在 Hack The Box 與 HTB Academy，拆解 Web 應用，',
                 '並記錄每個漏洞利用。CJCA 路線完成 — 目前 Offensive AI Expert &rarr; OSCP。',
                 '<span class="muted">&rarr; 執行</span> goto about']
        },
        OPS: {
            en: ['<span class="accent">CURRENT OPERATIONS</span> <span class="muted">// what I\'m on right now</span>',
                 '<span class="ok">●</span> OP-001  HTB Season Lab          <span class="muted">[active]</span>  65%',
                 '<span class="ok">●</span> OP-002  Web App Pentest Lab      <span class="muted">[active]</span>  40%',
                 '<span style="color:var(--amber)">❚❚</span> OP-003  Home AD Lab             <span class="muted">[paused]</span>  25%',
                 '<span class="muted">&rarr; run</span> goto ops'],
            ja: ['<span class="accent">進行中の作戦</span> <span class="muted">// 今やっていること</span>',
                 '<span class="ok">●</span> OP-001  HTB シーズン・ラボ      <span class="muted">[進行中]</span>  65%',
                 '<span class="ok">●</span> OP-002  Web アプリ診断ラボ      <span class="muted">[進行中]</span>  40%',
                 '<span style="color:var(--amber)">❚❚</span> OP-003  自宅 AD ラボ           <span class="muted">[一時停止]</span>  25%',
                 '<span class="muted">&rarr; 実行</span> goto ops'],
            zh: ['<span class="accent">進行中專案</span> <span class="muted">// 我現在在做的事</span>',
                 '<span class="ok">●</span> OP-001  HTB 賽季實驗室          <span class="muted">[進行中]</span>  65%',
                 '<span class="ok">●</span> OP-002  Web 應用滲透實驗        <span class="muted">[進行中]</span>  40%',
                 '<span style="color:var(--amber)">❚❚</span> OP-003  家用 AD 實驗           <span class="muted">[暫停]</span>  25%',
                 '<span class="muted">&rarr; 執行</span> goto ops']
        },
        LEARNING: {
            en: ['<span class="accent">LEARNING</span> <span class="muted">// HTB Academy · CWES + CPTS + CJCA · COAE</span>',
                 'HTB CWES — Web Exploitation ....... 100%',
                 'HTB CPTS — Penetration Tester ..... 100%',
                 'HTB CJCA — Junior Cybersecurity ... 100%',
                 'HTB COAE — Offensive AI Expert .... 0%',
                 '<span class="muted">&rarr; run</span> goto learning'],
            ja: ['<span class="accent">学習中</span> <span class="muted">// HTB Academy · CWES + CPTS + CJCA · COAE</span>',
                 'HTB CWES — Web エクスプロイト ... 100%',
                 'HTB CPTS — ペネトレーションテスター ... 100%',
                 'HTB CJCA — ジュニア・サイバーセキュリティ ... 100%',
                 'HTB COAE — オフェンシブ AI エキスパート ... 0%',
                 '<span class="muted">&rarr; 実行</span> goto learning'],
            zh: ['<span class="accent">學習中</span> <span class="muted">// HTB Academy · CWES + CPTS + CJCA · COAE</span>',
                 'HTB CWES — Web 漏洞利用 .......... 100%',
                 'HTB CPTS — 滲透測試員 ............. 100%',
                 'HTB CJCA — 初級資安 .............. 100%',
                 'HTB COAE — 攻擊性 AI 專家 ......... 0%',
                 '<span class="muted">&rarr; 執行</span> goto learning']
        },
        SKILLS: {
            en: ['<span class="accent">ARSENAL</span>',
                 'recon      nmap masscan gobuster ffuf amass nuclei',
                 'exploit    metasploit burp sqlmap hydra john hashcat',
                 'post-exp   mimikatz bloodhound impacket linpeas winpeas',
                 'lang/os    python bash powershell kali c',
                 '<span class="muted">&rarr; run</span> goto arsenal'],
            ja: ['<span class="accent">武器庫</span>',
                 '偵察      nmap masscan gobuster ffuf amass nuclei',
                 '攻撃      metasploit burp sqlmap hydra john hashcat',
                 'ポスト    mimikatz bloodhound impacket linpeas winpeas',
                 '言語/OS   python bash powershell kali c',
                 '<span class="muted">&rarr; 実行</span> goto arsenal'],
            zh: ['<span class="accent">工具庫</span>',
                 '偵察      nmap masscan gobuster ffuf amass nuclei',
                 '利用      metasploit burp sqlmap hydra john hashcat',
                 '後滲透    mimikatz bloodhound impacket linpeas winpeas',
                 '語言/OS   python bash powershell kali c',
                 '<span class="muted">&rarr; 執行</span> goto arsenal']
        },
        CERTS: {
            en: ['<span class="accent">ROADMAP</span>',
                 '<span class="ok">[✓]</span> HTB Academy — Foundational Modules',
                 '<span class="accent">[●]</span> HTB COAE — Offensive AI Expert, in progress',
                 '<span class="accent">[●]</span> HTB CJCA — path done, exam next',
                 '<span class="accent">[●]</span> HTB CPTS — path done, exam next',
                 '<span class="muted">[ ]</span> OSCP — planned',
                 '<span class="muted">[ ]</span> CRTP / Red Team — planned',
                 '<span class="muted">&rarr; run</span> goto certs'],
            ja: ['<span class="accent">ロードマップ</span>',
                 '<span class="ok">[✓]</span> HTB Academy — 基礎モジュール',
                 '<span class="accent">[●]</span> HTB COAE — オフェンシブ AI エキスパート、進行中',
                 '<span class="accent">[●]</span> HTB CJCA — パス修了・試験はこれから',
                 '<span class="accent">[●]</span> HTB CPTS — パス修了・試験はこれから',
                 '<span class="muted">[ ]</span> OSCP — 予定',
                 '<span class="muted">[ ]</span> CRTP / レッドチーム — 予定',
                 '<span class="muted">&rarr; 実行</span> goto certs'],
            zh: ['<span class="accent">路線圖</span>',
                 '<span class="ok">[✓]</span> HTB Academy — 基礎模組',
                 '<span class="accent">[●]</span> HTB COAE — 攻擊性 AI 專家，進行中',
                 '<span class="accent">[●]</span> HTB CJCA — 路線完成・尚未考試',
                 '<span class="accent">[●]</span> HTB CPTS — 路線完成・尚未考試',
                 '<span class="muted">[ ]</span> OSCP — 計畫中',
                 '<span class="muted">[ ]</span> CRTP / 紅隊 — 計畫中',
                 '<span class="muted">&rarr; 執行</span> goto certs']
        },
        CONTACT: {
            en: ['<span class="muted">$ ./contact.sh</span>',
                 'email   <a href="mailto:so.tanathorn@gmail.com">so.tanathorn@gmail.com</a>',
                 'github  <a href="https://github.com/Tanathorn-Rin" target="_blank" rel="noopener">@Tanathorn-Rin</a>',
                 'status  <span class="ok">available for CTFs &amp; collabs</span>',
                 '<span class="muted">&rarr; run</span> goto contact'],
            ja: ['<span class="muted">$ ./contact.sh</span>',
                 'メール  <a href="mailto:so.tanathorn@gmail.com">so.tanathorn@gmail.com</a>',
                 'github  <a href="https://github.com/Tanathorn-Rin" target="_blank" rel="noopener">@Tanathorn-Rin</a>',
                 '状態    <span class="ok">CTF・コラボ募集中</span>',
                 '<span class="muted">&rarr; 実行</span> goto contact'],
            zh: ['<span class="muted">$ ./contact.sh</span>',
                 'email   <a href="mailto:so.tanathorn@gmail.com">so.tanathorn@gmail.com</a>',
                 'github  <a href="https://github.com/Tanathorn-Rin" target="_blank" rel="noopener">@Tanathorn-Rin</a>',
                 '狀態    <span class="ok">歡迎 CTF 與合作</span>',
                 '<span class="muted">&rarr; 執行</span> goto contact']
        },
        BLOG: {
            en: ['<span class="accent">BLOG</span> <span class="muted">// write-ups &amp; notes</span>',
                 '<span class="ok">[HTB]</span> Cap ........................ easy · linux',
                 '<span class="accent">[CTF]</span> picoCTF — more cookies',
                 '<span style="color:#ffb000">[NOTES]</span> XSS — how it works',
                 '<span class="muted">&rarr; run</span> goto blog'],
            ja: ['<span class="accent">ブログ</span> <span class="muted">// ライトアップとノート</span>',
                 '<span class="ok">[HTB]</span> Cap ........................ easy · linux',
                 '<span class="accent">[CTF]</span> picoCTF — more cookies',
                 '<span style="color:#ffb000">[NOTES]</span> XSS の仕組み',
                 '<span class="muted">&rarr; 実行</span> goto blog'],
            zh: ['<span class="accent">部落格</span> <span class="muted">// 技術文章與筆記</span>',
                 '<span class="ok">[HTB]</span> Cap ........................ easy · linux',
                 '<span class="accent">[CTF]</span> picoCTF — more cookies',
                 '<span style="color:#ffb000">[NOTES]</span> XSS 的運作原理',
                 '<span class="muted">&rarr; 執行</span> goto blog']
        },
        SECRETS: {
            en: ['<span class="muted"># .secrets — you actually looked. respect.</span>',
                 'curiosity like this is the whole job: read the source, poke the',
                 'inputs, keep digging. if that is you, we would get along.',
                 '<span class="accent">hiring or building a team?</span> I am open to junior pentest roles,',
                 'CTF squads, and collabs &rarr; <a href="mailto:so.tanathorn@gmail.com">so.tanathorn@gmail.com</a>',
                 '<span class="ok">// stay curious, stay ethical.</span>'],
            ja: ['<span class="muted"># .secrets — 本当に見つけたね。敬意を表する。</span>',
                 'この好奇心こそが仕事の本質：ソースを読み、入力をいじり、',
                 '掘り続ける。それが君なら、きっと気が合う。',
                 '<span class="accent">採用・チーム作り？</span> ジュニアのペンテスト職、CTF チーム、',
                 'コラボ歓迎です &rarr; <a href="mailto:so.tanathorn@gmail.com">so.tanathorn@gmail.com</a>',
                 '<span class="ok">// 好奇心を持ち、倫理を守れ。</span>'],
            zh: ['<span class="muted"># .secrets — 你真的找到了。佩服。</span>',
                 '這種好奇心正是這份工作的本質：讀原始碼、戳輸入、',
                 '持續挖掘。如果這就是你，我們一定合得來。',
                 '<span class="accent">在招人或組隊？</span> 我開放初級滲透測試職缺、CTF 隊伍與合作，',
                 '歡迎聯絡 &rarr; <a href="mailto:so.tanathorn@gmail.com">so.tanathorn@gmail.com</a>',
                 '<span class="ok">// 保持好奇，恪守道德。</span>']
        },
        LS: {
            en: ['<span class="accent">about.txt</span>   <span class="accent">ops/</span>   <span class="accent">learning/</span>   <span class="accent">progress/</span>   <span class="accent">arsenal/</span>   <span class="accent">roadmap/</span>   <span class="accent">blog/</span>   <span class="accent">contact.sh</span>'],
            ja: ['<span class="accent">about.txt</span>   <span class="accent">ops/</span>   <span class="accent">learning/</span>   <span class="accent">progress/</span>   <span class="accent">arsenal/</span>   <span class="accent">roadmap/</span>   <span class="accent">blog/</span>   <span class="accent">contact.sh</span>'],
            zh: ['<span class="accent">about.txt</span>   <span class="accent">ops/</span>   <span class="accent">learning/</span>   <span class="accent">progress/</span>   <span class="accent">arsenal/</span>   <span class="accent">roadmap/</span>   <span class="accent">blog/</span>   <span class="accent">contact.sh</span>']
        }
    };
    function L(name) { return TXT[name][LANG] || TXT[name].en; }

    var COMMAND_NAMES = ['help', 'whoami', 'about', 'ops', 'learning', 'progress', 'skills', 'certs',
        'blog', 'contact', 'trace', 'ls', 'cat', 'date', 'echo', 'clear', 'history', 'sudo', 'goto'];

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
            case 'help': printLines(L('HELP')); break;
            case 'whoami': printLines(L('WHOAMI')); break;
            case 'about': printLines(L('ABOUT')); break;
            case 'ops': case 'projects': printLines(L('OPS')); break;
            case 'learning': printLines(L('LEARNING')); break;
            case 'skills': case 'arsenal': printLines(L('SKILLS')); break;
            case 'certs': case 'roadmap': printLines(L('CERTS')); break;
            case 'contact': case 'social': printLines(L('CONTACT')); break;
            case 'blog': case 'writeups': case 'research': printLines(L('BLOG')); break;
            case 'ls': case 'dir':
                printLines(L('LS'));
                if (args.some(function (a) { return a.charAt(0) === '-' && a.indexOf('a') !== -1; }))
                    out('<span class="muted">.</span>   <span class="muted">..</span>   <span class="muted">.secrets</span>');
                break;
            case 'cat':
                if (args[0] === '.secrets' || args[0] === 'secrets') printLines(L('SECRETS'));
                else if (!args.length) out('<span style="color:var(--amber)">cat:</span> usage: cat &lt;file&gt; <span class="muted">(hint: run</span> ls<span class="muted">)</span>');
                else out('<span style="color:var(--amber)">cat:</span> ' + esc(args[0]) + ': permission denied <span class="muted">— nice try ;)</span>');
                break;
            case 'date': out(new Date().toString()); break;
            case 'pwd': out('/home/visitor'); break;
            case 'echo': out(esc(args.join(' '))); break;
            case 'clear': case 'cls': output.innerHTML = ''; break;
            case 'history':
                printLines(historyArr.map(function (h, i) { return '  ' + (i + 1) + '  ' + esc(h); }));
                break;
            case 'sudo':
                out('<span style="color:var(--amber)">[sudo]</span> ' + t('term.sudo'));
                break;
            case 'trace': case 'track': case 'fingerprint':
                var f = fpGet();
                printLines([
                    '<span class="accent">' + t('term.target').toUpperCase() + '</span>',
                    'host ........ ' + esc(f.plat) + '  (' + f.res + ', ' + f.cores + ' cores)',
                    'agent ....... ' + esc(f.br),
                    'timezone .... ' + esc(f.tz),
                    'local time .. ' + f.time,
                    '<span style="color:var(--amber)">' + t('term.logged') + '</span>'
                ]);
                break;
            case 'goto': case 'cd': case 'open':
                var tg = (args[0] || '').toLowerCase();
                if (PAGES[tg]) {
                    out('<span class="muted">' + t('term.opening') + '</span> ' + esc(PAGES[tg]) + ' ...');
                    setTimeout(function () { loadView(PAGES[tg], true); }, 220);
                } else out('<span style="color:var(--amber)">' + t('term.unknownsec') + esc(tg) + '</span>');
                break;
            case 'home': loadView('index.html', true); break;
            case 'exit': case 'quit':
                out('<span class="muted">' + t('term.exit') + '</span>'); break;
            default:
                out('<span style="color:var(--amber)">' + t('term.notfound') + esc(name) + '</span>');
                out('<span class="muted">' + t('term.typehelp') + '</span>');
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
        if (!consoleEl || !input) return;
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
                out('<span class="muted">// ' + t('term.target') + ': ' + esc(_f.plat) + ' — ' + t('term.logged') + ' ' + t('term.try') + '</span> <span class="accent">trace</span>');
                input.readOnly = false; focusInput();
            });
        });
    }

    /* ============================================================
       CONTACT FORM
    ============================================================ */
    var FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxabcd'
    // ====================================================================
    //  reading the source? good — that's the first move of any decent
    //  pentester. heads up: the contact form below is a tiny CTF. it never
    //  sends mail — it just watches for the payloads you'd actually throw at
    //  a contact form (header injection · SSTI · CSV/formula · stored XSS)
    //  and fires back a cheeky note. nothing executes; input is only
    //  regex-matched, then printed with textContent. go type {{7*7}} in the
    //  message box and say hi. ;)
    // ====================================================================
    var CTF_TRAPS = [
        { // email header injection -> spam relay (CRLF + Bcc/Cc/To: with an address)
          test: function (f) {
              return /(?:\r|\n)\s*(?:bcc|cc|to)\s*:\s*[^\s@]+@/i.test(f.all) ||
                     /\b(?:bcc|cc)\s*:\s*[^\s@]+@/i.test(f.all) ||
                     /(?:%0d%0a|%0a|%0d)\s*[a-z][\w-]*\s*:/i.test(f.all);
          },
          note: 'oh — email header injection. on a real backend that newline + Bcc: would smuggle in extra recipients and turn this form into a spam relay. but this form has no backend, so nothing is sent.'
        },
        { // SSTI -> often RCE  ({{ }}, ${ }, {% %}, #{ })
          test: function (f) { return /\{\{.+?\}\}|\$\{.+?\}|\{%.+?%\}|#\{.+?\}/.test(f.all); },
          note: function (f) {
              var m = f.all.match(/\{\{\s*(\d+)\s*\*\s*(\d+)\s*\}\}/);
              var a = m ? +m[1] : 7, b = m ? +m[2] : 7;
              return 'What? Are you trying to inject SSTI? a vulnerable template engine would evaluate {{' + a + '*' + b + '}} into ' + (a * b) + ' server-side, and it is usually a path to full RCE. But nothing is rendered here, so don\'t expect it to work. nice try!';
          }
        },
        { // CSV / formula injection (a field that starts with = + - @ and looks like a formula)
          test: function (f) { return f.list.some(function (v) { return /^\s*[=+\-@][A-Za-z(]/.test(v) && /[(|]/.test(v); }); },
          note: 'clever — you know about formula injection? if these messages were exported to a CSV, that leading = would run as a formula the moment the file opened in Excel. but nothing here is stored or exported.'
        },
        { // stored XSS — fires in the admin inbox, not the visitor's browser
          test: function (f) { return /<script\b|<svg\b|<iframe\b|<img\b|on(?:error|load|click|mouseover)\s*=/i.test(f.all); },
          note: 'Really? are you trying to inject stored XSS? — on a real site this would be saved and later fire in the admin\'s browser when they open the message. here it is not working, so it never runs.'
        }
    ];
    function initForm() {
        var form = document.getElementById('contact-form');
        if (!form) return;
        var msg = document.getElementById('form-message');
        function showMsg(text, type) { if (msg) { msg.textContent = text; msg.className = 'form-message ' + type; } }
        function ctfCheck(name, email, message) {
            var f = { list: [name, email, message], all: [name, email, message].join('\n') };
            for (var i = 0; i < CTF_TRAPS.length; i++) {
                var trap = CTF_TRAPS[i];
                if (trap.test(f)) {
                    var note = typeof trap.note === 'function' ? trap.note(f) : trap.note;
                    showMsg(note, 'flag');
                    return true;
                }
            }
            return false;
        }
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var message = document.getElementById('message').value.trim();
            if (ctfCheck(name, email, message)) return; // easter egg wins — nothing is sent
            if (!name || !email || !message) { showMsg('! all fields required', 'err'); return; }
            if (FORM_ENDPOINT) {
                fetch(FORM_ENDPOINT, {
                    method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
                }).then(function (r) {
                    if (r.ok) { showMsg('> transmission sent. I\'ll reply soon.', 'ok'); form.reset(); }
                    else showMsg('! send failed — try email instead', 'err');
                }).catch(function () { showMsg('! network error — try email instead', 'err'); });
            } else {
                showMsg('! this form isn\'t hooked up — email me directly at so.tanathorn@gmail.com', 'err');
            }
        });
    }

    /* ============================================================
       LIVE PROGRESS TRACKER (renders data/progress.json)
    ============================================================ */
    function bar(pct) {
        pct = Math.max(0, Math.min(100, pct || 0));
        return '<div class="bar"><span class="fill animate" style="--w:' + pct + '%"></span></div>';
    }
    function kpi(val, label) {
        return '<div class="kpi"><span class="kpi-num">' + val + '</span><span class="kpi-lbl">' + label + '</span></div>';
    }
    function renderProgress(root, d) {
        // shared PortSwigger totals (overall auto-summed from by_topic)
        var ps = d.portswigger || {};
        var psTopics = ps.by_topic || [];
        var psSolved = ps.solved || 0, psTotal = ps.total || 0;
        if (psTopics.length) {
            psSolved = psTopics.reduce(function (s, x) { return s + (x.solved || 0); }, 0);
            psTotal  = psTopics.reduce(function (s, x) { return s + (x.total  || 0); }, 0);
        }
        var psPct = psTotal ? Math.round(psSolved / psTotal * 100) : (ps.progress || 0);
        var aRef = d.htb_academy || {}, lRef = d.htb_labs || {};

        var h = '<p class="prog-updated">' +
            (d.updated ? t('prog.lastUpdated') + ' <span class="accent">' + esc(d.updated) + '</span>' : '') + '</p>';

        h += '<div class="prog-kpis">';
        if (d.paths_done != null) h += kpi(d.paths_done, t('prog.pathsDone'));
        if (aRef.path_progress != null) h += kpi(aRef.path_progress + '%', esc(aRef.cert || '') + ' ' + t('prog.path'));
        if (psTotal) h += kpi(psSolved + '<span class="muted">/' + psTotal + '</span>', t('prog.kpiLabs'));
        if (lRef.machines_owned != null) h += kpi(lRef.machines_owned, t('prog.kpiBoxes'));
        h += '</div>';

        h += '<div class="prog-grid">';

        var a = d.htb_academy;
        if (a) {
            h += '<article class="prog-card reveal">';
            h += '<div class="prog-head"><h3>HTB Academy</h3>' +
                (a.cert ? '<span class="prog-badge">' + esc(a.cert) + '</span>' : '') + '</div>';
            if (a.cert_full) h += '<p class="prog-sub">' + esc(a.cert_full) + ' ' + t('prog.path') + '</p>';
            var ap = a.path_progress || 0;
            h += '<div class="prog-row"><span>' + t('prog.pathProgress') + '</span><span class="accent">' + ap + '%</span></div>' + bar(ap);
            h += '<div class="prog-stats">';
            if (a.modules_done != null) h += '<div><span class="num">' + a.modules_done +
                (a.modules_total ? '<span class="muted">/' + a.modules_total + '</span>' : '') + '</span><span class="lbl">' + t('prog.modules') + '</span></div>';
            if (a.cubes != null) h += '<div><span class="num">' + a.cubes + '</span><span class="lbl">' + t('prog.cubes') + '</span></div>';
            h += '</div>';
            if (a.recent_modules && a.recent_modules.length) {
                h += '<p class="prog-mini">' + t('prog.recentModules') + '</p><ul class="prog-list">';
                a.recent_modules.forEach(function (m) { h += '<li>' + esc(m) + '</li>'; });
                h += '</ul>';
            }
            h += '</article>';
        }

        var lp = d.learning_paths;
        if (lp && lp.length) {
            var lpDone = lp.filter(function (x) { return (x.progress || 0) >= 100; }).length;
            h += '<article class="prog-card reveal">';
            h += '<div class="prog-head"><h3>' + t('prog.learnPaths') + '</h3><span class="prog-badge">' + lpDone + '/' + lp.length + '</span></div>';
            h += '<p class="prog-sub">' + t('prog.learnPathsSub') + '</p>';
            h += '<div class="prog-topics">';
            lp.forEach(function (x) {
                var pv = x.progress || 0;
                h += '<div class="topic' + (pv >= 100 ? ' done' : '') + '"><div class="prog-row"><span>' + esc(x.name) +
                    '</span><span class="' + (pv >= 100 ? 'muted' : 'accent') + '">' + pv + '%</span></div>' + bar(pv) + '</div>';
            });
            h += '</div>';
            h += '</article>';
        }

        var l = d.htb_labs;
        if (l) {
            h += '<article class="prog-card reveal">';
            h += '<div class="prog-head"><h3>' + t('prog.htbMachines') + '</h3>' +
                (l.rank ? '<span class="prog-badge">' + esc(l.rank) + '</span>' : '') + '</div>';
            h += '<p class="prog-sub">' + t('prog.htbLabsSub') + '</p>';
            h += '<div class="prog-stats wide">';
            if (l.machines_owned != null) h += '<div><span class="num">' + l.machines_owned + '</span><span class="lbl">' + t('prog.owned') + '</span></div>';
            if (l.user_owns != null) h += '<div><span class="num">' + l.user_owns + '</span><span class="lbl">' + t('prog.user') + '</span></div>';
            if (l.system_owns != null) h += '<div><span class="num">' + l.system_owns + '</span><span class="lbl">' + t('prog.system') + '</span></div>';
            h += '</div>';
            if (l.recent && l.recent.length) {
                h += '<p class="prog-mini">' + t('prog.recentPwned') + '</p><ul class="prog-machines">';
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

        if (psTopics.length) {
            h += '<article class="prog-card wide-card reveal">';
            h += '<div class="prog-head"><h3>PortSwigger <span class="muted">// ' + t('prog.byTopic') + '</span></h3>' +
                '<span class="prog-badge">' + psSolved + '/' + psTotal + '</span></div>';
            h += '<div class="prog-row"><span>' + t('prog.labsSolved') + '</span><span class="accent">' + psPct + '%</span></div>' + bar(psPct);
            h += '<div class="prog-topics">';
            psTopics.forEach(function (topic) {
                var ts = topic.solved || 0, tt = topic.total || 0;
                var tp = tt ? Math.round(ts / tt * 100) : 0;
                h += '<div class="topic' + (tp >= 100 ? ' done' : '') + '"><div class="prog-row"><span>' + esc(topic.name) +
                    '</span><span class="muted">' + ts + '/' + tt + '</span></div>' + bar(tp) + '</div>';
            });
            h += '</div>';
            h += '</article>';
        }

        h += '</div>';
        root.innerHTML = h;
        observeReveals();
    }
    function initProgress() {
        var root = document.getElementById('progress-root');
        if (!root) return;
        root.innerHTML = '<p class="muted">' + t('prog.syncing') + '</p>';
        fetch('data/progress.json', { cache: 'no-store' })
            .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
            .then(function (d) { renderProgress(root, d); })
            .catch(function () { root.innerHTML = '<p class="muted">' + t('prog.loadFail') + '</p>'; });
    }

    /* ---------- per-view setup ---------- */
    // show only the current language's .lang-block (blog post pages); fall back to English
    function applyLangBlocks(root) {
        root = root || document;
        var blocks = root.querySelectorAll('.lang-block');
        if (!blocks.length) return;
        var hasCur = false;
        blocks.forEach(function (b) { if (b.getAttribute('data-lang') === LANG) hasCur = true; });
        var show = hasCur ? LANG : 'en';
        blocks.forEach(function (b) { b.style.display = (b.getAttribute('data-lang') === show) ? 'block' : 'none'; });
    }
    // blog: wire the filter bar (all / htb / ctf / research) to show/hide cards by data-type
    function initBlog() {
        var bar = document.querySelector('.wu-filter');
        if (!bar || bar.dataset.wired) return;
        bar.dataset.wired = '1';
        var cards = [].slice.call(document.querySelectorAll('.wu-card'));
        bar.addEventListener('click', function (e) {
            var btn = e.target.closest('.wu-fbtn');
            if (!btn) return;
            var f = btn.getAttribute('data-filter');
            bar.querySelectorAll('.wu-fbtn').forEach(function (b) { b.classList.toggle('active', b === btn); });
            cards.forEach(function (c) {
                c.style.display = (f === 'all' || c.getAttribute('data-type') === f) ? '' : 'none';
            });
        });
    }
    /* arsenal: short "what it does" blurb shown when a tool tag is clicked.
       Keyed by the tag's lowercased text. Tool names stay in English; the
       description is shown in the active language (falls back to English). */
    var TOOL_INFO = {
        'nmap': {
            en: 'Network mapper. Scans hosts for open ports, running services, version info, and OS fingerprints — usually the first recon step.',
            ja: 'ネットワークマッパー。ホストの開放ポート・稼働中のサービス・バージョン情報・OSフィンガープリントをスキャンする。偵察の最初のステップとして使うことが多い。',
            zh: '網路掃描器。掃描主機的開放埠、執行中的服務、版本資訊與作業系統指紋，通常是偵查的第一步。'
        },
        'gobuster': {
            en: 'Brute-forces hidden web directories, files, DNS subdomains, and virtual hosts using wordlists.',
            ja: 'ワードリストを使い、隠れたWebディレクトリ・ファイル・DNSサブドメイン・バーチャルホストを総当たりで探し出す。',
            zh: '使用字典檔暴力列舉隱藏的網頁目錄、檔案、DNS 子網域與虛擬主機。'
        },
        'ffuf': {
            en: '"Fuzz Faster U Fool" — a fast web fuzzer for finding directories, parameters, and vhosts.',
            ja: '「Fuzz Faster U Fool」。ディレクトリ・パラメータ・vhostを高速に探索するWebファザー。',
            zh: '「Fuzz Faster U Fool」——快速的網頁模糊測試工具，用於尋找目錄、參數與虛擬主機。'
        },
        'amass': {
            en: 'Maps an organization’s external attack surface through deep DNS enumeration and OSINT.',
            ja: '深いDNS列挙とOSINTにより、組織の外部攻撃面をマッピングする。',
            zh: '透過深度 DNS 列舉與 OSINT，繪製組織的外部攻擊面。'
        },
        'burp suite': {
            en: 'Intercepting web proxy. Inspect, modify, and replay HTTP(S) traffic — the core tool for web app testing.',
            ja: '中間者型のWebプロキシ。HTTP(S)通信を傍受・改ざん・再送できる、Webアプリ診断の中核ツール。',
            zh: '攔截式網頁代理。可檢視、修改並重送 HTTP(S) 流量，是網頁應用測試的核心工具。'
        },
        'metasploit': {
            en: 'Exploitation framework with a large library of exploits, payloads, and post-exploitation modules.',
            ja: '多数のエクスプロイト・ペイロード・ポストエクスプロイトモジュールを備えた攻撃フレームワーク。',
            zh: '攻擊框架，內建大量的漏洞利用、酬載與後滲透模組。'
        },
        'sqlmap': {
            en: 'Automates detecting and exploiting SQL injection to dump databases and pop shells.',
            ja: 'SQLインジェクションの検出と悪用を自動化し、データベースのダンプやシェル奪取を行う。',
            zh: '自動化偵測與利用 SQL injection，可傾印資料庫並取得 shell。'
        },
        'hydra': {
            en: 'Fast network login brute-forcer supporting SSH, FTP, HTTP, RDP, and many other protocols.',
            ja: 'SSH・FTP・HTTP・RDPなど多数のプロトコルに対応した高速ログイン総当たりツール。',
            zh: '快速的網路登入暴力破解工具，支援 SSH、FTP、HTTP、RDP 等多種協定。'
        },
        'john': {
            en: 'John the Ripper — offline password-hash cracker using dictionary and rule-based attacks.',
            ja: 'John the Ripper。辞書攻撃とルールベース攻撃を使うオフラインのパスワードハッシュ解析ツール。',
            zh: 'John the Ripper——使用字典與規則攻擊的離線密碼雜湊破解工具。'
        },
        'hashcat': {
            en: 'GPU-accelerated password cracker — recovers hashes at high speed across many algorithms.',
            ja: 'GPUを活用したパスワード解析ツール。多数のアルゴリズムのハッシュを高速にクラックする。',
            zh: 'GPU 加速的密碼破解工具，可高速破解多種演算法的雜湊。'
        },
        'linpeas': {
            en: 'Linux Privilege Escalation Awesome Script — enumerates a Linux host for privesc paths.',
            ja: 'Linux Privilege Escalation Awesome Script。Linuxホストの権限昇格経路を列挙する。',
            zh: 'Linux Privilege Escalation Awesome Script——列舉 Linux 主機的提權路徑。'
        },
        'winpeas': {
            en: 'The Windows counterpart of linpeas — hunts for Windows privilege-escalation vectors.',
            ja: 'linpeasのWindows版。Windowsの権限昇格の糸口を探し出す。',
            zh: 'linpeas 的 Windows 版本——搜尋 Windows 的提權途徑。'
        },
        'bloodhound': {
            en: 'Maps Active Directory relationships as a graph to reveal hidden attack paths to Domain Admin.',
            ja: 'Active Directoryの関係性をグラフ化し、Domain Adminへの隠れた攻撃経路を可視化する。',
            zh: '將 Active Directory 的關係繪製成圖，揭露通往 Domain Admin 的隱藏攻擊路徑。'
        },
        'mimikatz': {
            en: 'Extracts plaintext passwords, hashes, and Kerberos tickets straight from Windows memory.',
            ja: 'Windowsのメモリから平文パスワード・ハッシュ・Kerberosチケットを抽出する。',
            zh: '直接從 Windows 記憶體中擷取明文密碼、雜湊與 Kerberos 票證。'
        },
        'kali linux': {
            en: 'Debian-based distro preloaded with hundreds of pentesting and forensics tools.',
            ja: '数百ものペンテスト・フォレンジックツールを標準搭載したDebianベースのディストリビューション。',
            zh: '以 Debian 為基礎的發行版，預載數百種滲透測試與鑑識工具。'
        },
        'python': {
            en: 'Go-to scripting language for writing exploits, automation, and custom tooling.',
            ja: 'エクスプロイト作成・自動化・ツール開発に使われる定番のスクリプト言語。',
            zh: '撰寫漏洞利用、自動化與自製工具的首選腳本語言。'
        },
        'bash': {
            en: 'Unix shell for scripting, automation, and chaining tools together on Linux.',
            ja: 'スクリプト作成や自動化、Linux上でのツール連携に使うUnixシェル。',
            zh: '用於腳本撰寫、自動化以及在 Linux 上串接工具的 Unix shell。'
        },
        'powershell': {
            en: 'Windows scripting shell — heavily used for AD enumeration and post-exploitation.',
            ja: 'Windowsのスクリプトシェル。AD列挙やポストエクスプロイトで多用される。',
            zh: 'Windows 的腳本 shell——常用於 AD 列舉與後滲透。'
        },
        'c': {
            en: 'Low-level language for understanding memory, writing exploits, and crafting shellcode.',
            ja: 'メモリの理解、エクスプロイトやシェルコードの作成に使う低水準言語。',
            zh: '低階語言，用於理解記憶體、撰寫漏洞利用與 shellcode。'
        }
    };

    // Build (once) the modal used to explain a tool, and return it.
    function toolModal() {
        var m = document.getElementById('tool-modal');
        if (m) return m;
        m = document.createElement('div');
        m.id = 'tool-modal';
        m.className = 'tool-modal';
        m.setAttribute('hidden', '');
        m.innerHTML =
            '<div class="tool-modal-backdrop" data-close></div>' +
            '<div class="tool-modal-box" role="dialog" aria-modal="true" aria-labelledby="tool-modal-name">' +
                '<div class="tool-modal-bar">' +
                    '<span class="tool-modal-dots"><i></i><i></i><i></i></span>' +
                    '<span class="tool-modal-title">man</span>' +
                    '<button type="button" class="tool-modal-close" data-close aria-label="close">✕</button>' +
                '</div>' +
                '<div class="tool-modal-body">' +
                    '<p class="tool-modal-cmd"><span class="accent">$</span> man <span id="tool-modal-name"></span></p>' +
                    '<p class="tool-modal-desc"></p>' +
                '</div>' +
            '</div>';
        document.body.appendChild(m);
        var prevFocus = null;
        function close() {
            m.setAttribute('hidden', '');
            document.removeEventListener('keydown', onKey);
            if (prevFocus && prevFocus.focus) prevFocus.focus();
        }
        function onKey(e) { if (e.key === 'Escape') close(); }
        m.addEventListener('click', function (e) {
            if (e.target.closest('[data-close]')) close();
        });
        m.open = function (name, desc) {
            prevFocus = document.activeElement;
            m.querySelector('#tool-modal-name').textContent = name;
            m.querySelector('.tool-modal-desc').textContent = desc;
            m.removeAttribute('hidden');
            document.addEventListener('keydown', onKey);
            m.querySelector('.tool-modal-close').focus();
        };
        return m;
    }

    // Make each arsenal tool tag clickable so it explains what the tool does.
    function initArsenal() {
        var tags = document.querySelectorAll('.arsenal-grid .tag');
        if (!tags.length) return;
        tags.forEach(function (tag) {
            if (tag.dataset.info) return;
            var key = tag.textContent.trim().toLowerCase();
            var info = TOOL_INFO[key];
            if (!info) return;
            var desc = info[LANG] || info.en;
            tag.dataset.info = '1';
            tag.classList.add('tag-info');
            tag.setAttribute('role', 'button');
            tag.setAttribute('tabindex', '0');
            tag.setAttribute('aria-label', key + ' — what it does');
            var open = function () { toolModal().open(tag.textContent.trim(), desc); };
            tag.addEventListener('click', open);
            tag.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
            });
        });
    }

    function initView() {
        setActiveNav();
        applyI18n(document);
        applyLangBlocks(document);
        observeReveals();
        initReadMore();
        initBlog();
        initTrackPct();
        initArsenal();
        initTerminal();
        initForm();
        initProgress();
    }

    /* ============================================================
       BOOT / LOGIN SEQUENCE
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
            '<span class="bad">[WARN]</span> ' + t('boot.watched'),
            '<span class="ok">[ OK ]</span> spawning /bin/zsh',
            '',
            '<span class="granted">' + t('boot.granted') + '</span>'
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
       BACKGROUND FX
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
    buildChrome();
    setupRouter();
    initGlitch();
    initMatrix();
    initView();
    runBootOrIntro();
})();
