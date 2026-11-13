// 기능 설명서 페이지 동작: 목차(현재 위치·찾기·서랍), 없는 화면 숨기기, 업데이트, 영상 목록
// 영상·화면 크게 보기, 다운로드, 설치 도움말 탭은 common.js
(function () {
  var DATA = window.CATALOG || {};
  var $ = SB.$, $$ = SB.$$, esc = SB.esc;
  var narrow = window.matchMedia('(max-width: 1100px)');

  // ---------- 목차: 서랍(좁은 화면) ----------
  var side = $('#side'), backdrop = $('#side-backdrop'), menuBtn = $('.menu-btn'), search = $('#side-search');
  function setDrawer(open) {
    side.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var cur = $('.side-nav a[aria-current="true"]');
      if (cur) cur.scrollIntoView({ block: 'center' });
    }
  }
  menuBtn.addEventListener('click', function () { setDrawer(!side.classList.contains('is-open')); });
  backdrop.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && side.classList.contains('is-open')) setDrawer(false); });
  side.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]') && narrow.matches) setDrawer(false); });
  narrow.addEventListener('change', function () { if (!narrow.matches) setDrawer(false); });

  // ---------- 목차: 지금 읽는 곳 표시 ----------
  var links = $$('.side-nav a[href^="#"]');
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  // 목차에 있는 칸 + 묶음 머리(바로 뒤 첫 기능으로 표시)
  var targets = $$('#main section[id], #main .group-intro[id]');
  targets.forEach(function (el) {
    var next = el;
    while (next && !byId[next.id]) next = next.nextElementSibling;
    el._nav = next ? next.id : null;
  });
  targets = targets.filter(function (el) { return el._nav; });
  var nowLabel = $('#topbar-now'), currentId = null, ticking = false;

  function setCurrent(id) {
    if (id === currentId) return;
    currentId = id;
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
    var a = byId[id];
    if (!a) return;
    a.setAttribute('aria-current', 'true');
    if (nowLabel) nowLabel.textContent = id === 'overview' ? '' : a.childNodes[0].textContent.trim();
    // 목차 안에서 보이게 (페이지는 움직이지 않음)
    var nav = $('#side-nav');
    if (!narrow.matches && nav) {
      var top = a.offsetTop - nav.offsetTop, bottom = top + a.offsetHeight;
      if (top < nav.scrollTop + 40 || bottom > nav.scrollTop + nav.clientHeight - 40) {
        nav.scrollTo({ top: top - nav.clientHeight / 2, behavior: 'smooth' });
      }
    }
  }
  // 화면 위에서 30% 선을 지난 마지막 칸이 지금 칸
  function pick() {
    ticking = false;
    var line = window.innerHeight * 0.3, id = targets[0] && targets[0]._nav;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].getBoundingClientRect().top <= line) id = targets[i]._nav; else break;
    }
    // 맨 아래까지 내렸으면 마지막 칸
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = targets[targets.length - 1]._nav;
    setCurrent(id);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }, { passive: true });
  window.addEventListener('resize', pick);
  pick();

  // ---------- 목차: 기능 찾기 ----------
  var groups = $$('.nav-group'), emptyMsg = $('#nav-empty');
  var norm = function (s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); };
  links.forEach(function (a) { a._k = norm(a.textContent + ' ' + (a.getAttribute('data-k') || '')); });
  function filter() {
    var q = norm(search.value), any = false;
    groups.forEach(function (g) {
      var shown = 0;
      $$('a', g).forEach(function (a) {
        var hit = !q || a._k.indexOf(q) > -1;
        a.hidden = !hit;
        if (hit) shown++;
      });
      g.hidden = shown === 0;
      if (shown) any = true;
    });
    emptyMsg.hidden = any;
  }
  search.addEventListener('input', filter);
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var first = links.filter(function (a) { return !a.hidden; })[0];
      if (first) { e.preventDefault(); first.click(); location.hash = first.getAttribute('href'); search.blur(); }
    }
    if (e.key === 'Escape') { search.value = ''; filter(); }
  });

  // ---------- 아직 안 찍힌 화면 이미지는 칸째 숨긴다(영상 칩은 남김) ----------
  $$('.feat-media .shot img').forEach(function (img) {
    function drop() {
      var fig = img.closest('.feat-media'), body = img.closest('.feat-body');
      if (fig) fig.remove();
      if (body) body.classList.add('no-media');
    }
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) drop();
    else img.addEventListener('error', drop);
  });

  // ---------- 업데이트 ----------
  var updateList = $('#update-list');
  function renderUpdates(entries) {
    updateList.innerHTML = entries.slice(0, 4).map(function (v, idx) {
      var all = [];
      (Array.isArray(v.changes) ? v.changes : []).forEach(function (g) { (g.items || []).forEach(function (it) { all.push(it.title); }); });
      var shown = all.slice(0, 8), rest = all.length - shown.length;
      var date = String(v.date || '').replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, function (_, y, m, d) { return y + '년 ' + Number(m) + '월 ' + Number(d) + '일'; });
      return '<li class="update' + (idx === 0 ? ' is-latest' : '') + '">' +
        '<div class="update-ver">v' + esc(v.version) + '<time datetime="' + esc(v.date) + '">' + esc(date) + '</time></div>' +
        '<div><h3>' + esc(v.title) + '</h3><ul>' + shown.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
        (rest > 0 ? '<li class="is-more">그 밖에 ' + rest + '가지</li>' : '') + '</ul></div></li>';
    }).join('');
  }
  if (updateList) {
    renderUpdates(DATA.changelogFallback || []);
    var src = DATA.changelogSource;
    if (src && window.fetch) {
      fetch(src.url, { headers: { apikey: src.key, Authorization: 'Bearer ' + src.key } })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (rows) { if (Array.isArray(rows) && rows.length) renderUpdates(rows); })
        .catch(function () {});
    }
  }

  // ---------- 영상 목록 ----------
  var titles = {};
  links.forEach(function (a) { titles[a.getAttribute('href').slice(1)] = a.childNodes[0].textContent.trim(); });
  function dur(s) { return s ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : ''; }
  var vg = $('#video-groups');
  if (vg && DATA.videoGroups) {
    vg.innerHTML = DATA.videoGroups.map(function (g) {
      return '<div class="vgroup"><h3>' + esc(g.title) + '<small>' + g.items.length + '편</small></h3><ul class="vgrid' + (g.short ? ' is-short' : '') + '">' +
        g.items.map(function (v) {
          var thumb = g.short ? 'https://i.ytimg.com/vi/' + v[0] + '/oar2.jpg' : 'https://i.ytimg.com/vi/' + v[0] + '/mqdefault.jpg';
          var anchor = v[3] && titles[v[3]] ? '<a class="vtile-link" href="#' + esc(v[3]) + '">' + esc(titles[v[3]]) + ' 소개 보기</a>' : '';
          return '<li><button class="vtile" type="button" data-yt="' + esc(v[0]) + '" data-title="' + esc(v[1]) + '"' + (g.short ? ' data-short' : '') + '>' +
            '<span class="vtile-thumb"><img src="' + thumb + '" alt="" loading="lazy" decoding="async"><span class="vcard-play" aria-hidden="true"></span>' +
            (v[2] ? '<span class="vtile-dur">' + dur(v[2]) + '</span>' : '') + '</span>' +
            '<span class="vtile-title">' + esc(v[1]) + '</span></button>' + anchor + '</li>';
        }).join('') + '</ul></div>';
    }).join('');
  }
  var ch = $('#channel-link');
  if (ch && DATA.channel) ch.href = DATA.channel;
})();
