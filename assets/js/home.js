// 메인 페이지 동작: 상단 메뉴, 나타나기, 숫자 올라가기, 업데이트 타임라인
// 영상·화면 크게 보기, 다운로드, 설치 도움말 탭은 common.js / 3D 첫 화면은 hero3d.js
(function () {
  var $ = SB.$, $$ = SB.$$, esc = SB.esc;
  var DATA = window.CATALOG || {};
  var root = document.documentElement;

  // 3D가 오래 안 뜨면(모듈을 못 받는 학교망 등) 정지 첫 화면으로
  window.addEventListener('load', function () {
    setTimeout(function () { if (!window.__hero3d) root.classList.add('no-webgl'); }, 7000);
  });

  // ---------- 상단 메뉴 ----------
  var nav = $('#nav'), toggle = $('.nav-toggle');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('#nav-links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ---------- 숫자 올라가기 ----------
  var reduce = root.classList.contains('reduce-motion');
  function countUp(el) {
    var target = Number(el.getAttribute('data-count'));
    if (reduce || !target) return;
    var start = performance.now(), dur = 1600;
    function tick(now) {
      var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * e).toLocaleString('ko-KR');
      if (t < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  }

  // ---------- 업데이트 타임라인 ----------
  var releases = DATA.releases || [];
  var tl = $('#timeline');
  if (tl && releases.length) {
    var t0 = Date.parse('2026-03-01'), t1 = Date.parse('2026-12-01');
    var pos = function (d) { return ((Date.parse(d) - t0) / (t1 - t0) * 100).toFixed(2) + '%'; };
    var months = [];
    for (var m = 3; m <= 11; m++) months.push('<span class="tl-month" style="left:' + pos('2026-' + String(m).padStart(2, '0') + '-01') + '">' + m + '월</span>');
    var last = releases.length - 1;
    tl.innerHTML = '<div class="tl-track"><div class="tl-fill"></div></div>' + months.join('') +
      releases.map(function (r, i) {
        return '<button type="button" class="tl-dot' + (i === last ? ' is-big' : '') + '" style="left:' + pos(r[1]) + ';--d:' + (0.3 + i * 0.07).toFixed(2) + 's" data-i="' + i + '" aria-label="v' + esc(r[0]) + ' ' + esc(r[1]) + ' ' + esc(r[2]) + '"></button>';
      }).join('') + '<div class="tl-tip" id="tl-tip" role="status"></div>';
    var tip = $('#tl-tip', tl);
    function showTip(btn) {
      var r = releases[Number(btn.getAttribute('data-i'))];
      var d = r[1].replace(/^\d{4}-(\d{2})-(\d{2})$/, function (_, mm, dd) { return Number(mm) + '월 ' + Number(dd) + '일'; });
      tip.innerHTML = '<b>v' + esc(r[0]) + '</b>' + esc(d) + '<br>' + esc(r[2]);
      var x = parseFloat(btn.style.left), w = tl.clientWidth;
      // 양 끝에서는 말풍선이 밖으로 나가지 않게
      var px = Math.min(Math.max(x / 100 * w, 120), w - 120);
      tip.style.left = px + 'px';
      tip.classList.add('is-on');
    }
    function hideTip() { tip.classList.remove('is-on'); }
    $$('.tl-dot', tl).forEach(function (b) {
      b.addEventListener('mouseenter', function () { showTip(b); });
      b.addEventListener('focus', function () { showTip(b); });
      b.addEventListener('click', function () { showTip(b); });
      b.addEventListener('mouseleave', hideTip);
      b.addEventListener('blur', hideTip);
    });
  }

  // ---------- 최신 업데이트 3개 ----------
  var latest = $('#latest-releases');
  function renderLatest(entries) {
    latest.innerHTML = entries.slice(0, 3).map(function (v) {
      var all = [];
      (Array.isArray(v.changes) ? v.changes : []).forEach(function (g) { (g.items || []).forEach(function (it) { all.push(it.title); }); });
      var date = String(v.date || '').replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, function (_, y, mm, dd) { return y + '년 ' + Number(mm) + '월 ' + Number(dd) + '일'; });
      return '<li><span class="ver">v' + esc(v.version) + '</span><time datetime="' + esc(v.date) + '">' + esc(date) + '</time>' +
        '<h3>' + esc(v.title) + '</h3><ul>' + all.slice(0, 4).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></li>';
    }).join('');
  }
  if (latest) {
    renderLatest(DATA.changelogFallback || []);
    var src = DATA.changelogSource;
    if (src && window.fetch) {
      fetch(src.url, { headers: { apikey: src.key, Authorization: 'Bearer ' + src.key } })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (rows) { if (Array.isArray(rows) && rows.length) renderLatest(rows); })
        .catch(function () {});
    }
  }

  // ---------- 나타나기 ----------
  // 같은 줄에 놓인 칸은 조금씩 늦게
  $$('.level-grid, .bento, .safe-grid, .shorts, .proof-grid').forEach(function (g) {
    $$('.reveal', g).forEach(function (el, i) { el.style.setProperty('--d', (i * 0.08).toFixed(2) + 's'); });
  });
  var targets = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();
