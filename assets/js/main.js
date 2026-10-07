// 3D 장면 밖의 동작: 메뉴, 다운로드, 선생님의 하루, 도구상자, 휴대폰, 업데이트, 영상, 설치 도움말
(function () {
  var SITE = window.SITE || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // ---------- 화면 이미지 ----------
  function desktopImg(name, alt) {
    return '<img src="assets/shots/desktop/' + name + '-1080.webp" srcset="assets/shots/desktop/' + name + '-1080.webp 1080w, assets/shots/desktop/' + name + '-2160.webp 2160w"' +
      ' sizes="(max-width: 980px) 92vw, 58vw" width="1600" height="1000" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">';
  }
  function phoneHtml(name, alt) {
    return '<div class="phone"><img src="assets/shots/mobile/' + name + '-780.webp" width="390" height="844" alt="' + esc(alt || '') + '" loading="lazy" decoding="async"></div>';
  }
  // 깔끔한 빨간펜 표시: 타원(ellipse), 알약(pill), 둥근 사각형(rect). 좌표는 % → 1600x1000 기준
  function markHtml(mark) {
    if (!mark) return '';
    var r = mark.rect, x = r[0] * 16, y = r[1] * 10, w = r[2] * 16, h = r[3] * 10, shape;
    if (mark.shape === 'ellipse') shape = '<ellipse pathLength="1" cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + (w / 2 + 14) + '" ry="' + (h / 2 + 12) + '"/>';
    else shape = '<rect pathLength="1" x="' + (x - 8) + '" y="' + (y - 8) + '" width="' + (w + 16) + '" height="' + (h + 16) + '" rx="' + (mark.shape === 'pill' ? (h + 16) / 2 : 18) + '"/>';
    return '<svg class="mark" viewBox="0 0 1600 1000" aria-hidden="true">' + shape + '</svg>' +
      '<span class="mark-note" style="left:' + mark.at[0] + '%;top:' + mark.at[1] + '%" aria-hidden="true">' + esc(mark.note) + '</span>';
  }

  // ---------- 3D가 오래 안 뜨면 정지 이미지 첫 화면으로 ----------
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (!window.__stage3dLoaded) document.documentElement.classList.add('no-webgl');
    }, 8000);
  });

  // ---------- 다운로드: GitHub 최신 릴리스의 설치 파일로 바로 연결 ----------
  var GITHUB_API = 'https://api.github.com/repos/jyh1541/school-board-releases/releases/latest';
  var RELEASES_PAGE = 'https://github.com/jyh1541/school-board-releases/releases/latest';
  var releasePromise = null;
  function fetchLatestRelease() {
    if (!releasePromise) {
      releasePromise = fetch(GITHUB_API)
        .then(function (res) { return res.ok ? res.json() : null; })
        .catch(function () { return null; });
    }
    return releasePromise;
  }

  var toast = $('#toast'), toastTimer = null;
  function showToast(html) {
    toast.innerHTML = html;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 9000);
  }

  $$('.js-download').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var label = $('.js-download-label', btn) || btn;
      var original = label.textContent;
      label.textContent = '다운로드 준비 중…';
      fetchLatestRelease().then(function (release) {
        label.textContent = original;
        var asset = release && release.assets && release.assets.find(function (a) { return /Setup.*\.exe$/i.test(a.name); });
        if (asset) {
          window.location.href = asset.browser_download_url;
          showToast('<span>다운로드를 시작했어요. 경고 창이 뜨면 설치 도움말을 확인해 주세요.</span><a href="#help">설치 도움말</a>');
        } else {
          window.open(RELEASES_PAGE, '_blank', 'noopener');
        }
      });
    });
  });
  fetchLatestRelease().then(function (release) {
    var el = $('#latest-version');
    if (el && release && release.tag_name) el.textContent = '최신 버전 ' + release.tag_name.replace(/^v?/, 'v');
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

  // ---------- 선생님의 하루 ----------
  var slotList = $('#day-slots'), frame = $('#day-frame');
  (SITE.slots || []).forEach(function (s) {
    var shot = s.shot;
    var shotHtml = shot.phone ? phoneHtml(shot.phone, shot.alt) : desktopImg(shot.name, shot.alt) + markHtml(shot.mark);
    var li = document.createElement('li');
    li.className = 'slot';
    li.innerHTML = '<time class="slot-time" datetime="' + s.time + '">' + s.time + '</time>' +
      '<h3>' + s.title + '</h3><p>' + esc(s.body) + '</p>' +
      '<p class="slot-uses"><b>쓰는 기능</b>' + esc(s.uses) + '</p>' +
      '<figure class="slot-shot' + (shot.phone ? ' shot-phone' : '') + '">' + shotHtml + '</figure>';
    slotList.appendChild(li);
    var fig = document.createElement('figure');
    fig.className = 'shot' + (shot.phone ? ' shot-phone' : '');
    fig.innerHTML = shotHtml;
    frame.appendChild(fig);
  });

  var slots = $$('.slot'), shots = $$('.shot', frame), current = -1, ticking = false;
  function eager(fig) { if (fig) $$('img', fig).forEach(function (img) { img.loading = 'eager'; }); }
  function activate(i) {
    slots.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    shots.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    eager(shots[i]); eager(shots[i + 1]);
  }
  // 화면 60% 높이를 지난 마지막 시간대가 지금 시간대
  function pickSlot() {
    ticking = false;
    var line = window.innerHeight * 0.6, next = 0;
    slots.forEach(function (s, k) { if (s.getBoundingClientRect().top < line) next = k; });
    if (next !== current) { current = next; activate(next); }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(pickSlot); }
  }, { passive: true });
  window.addEventListener('resize', pickSlot);
  pickSlot();
  // 하루 구간에 가까워지면 첫 화면을 미리 불러 둔다
  if ('IntersectionObserver' in window) {
    var pre = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { eager(shots[0]); pre.disconnect(); } }, { rootMargin: '600px 0px' });
    pre.observe($('#day'));
    // 좁은 화면: 각 시간대 아래 화면이 보이면 표시를 그린다
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-shown'); seen.unobserve(en.target); } });
    }, { threshold: 0.5 });
    $$('.slot-shot').forEach(function (f) { seen.observe(f); });
  }

  // ---------- 도구상자 ----------
  var list = $('#tool-list'), preview = $('#tool-preview');
  var tools = SITE.tools || [];
  tools.forEach(function (t, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tool-tab';
    btn.id = 'tool-tab-' + t.id;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'tool-panel-' + t.id);
    btn.innerHTML = '<strong>' + esc(t.name) + '</strong>' + (t.badge ? '<em>' + esc(t.badge) + '</em>' : '') + '<span>' + esc(t.desc) + '</span>';
    list.appendChild(btn);
    var panel = document.createElement('figure');
    panel.className = 'shot';
    panel.id = 'tool-panel-' + t.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', btn.id);
    panel.innerHTML = desktopImg(t.shot, t.name + ' 화면') + '<figcaption class="tool-desc">' + esc(t.desc) + '</figcaption>';
    preview.appendChild(panel);
    btn.addEventListener('click', function () { selectTool(i, false); });
    btn.addEventListener('pointerenter', function () { eager(panel); });
  });
  var tabs = $$('.tool-tab', list), panels = $$('.shot', preview);
  function selectTool(i, focus) {
    tabs.forEach(function (b, k) {
      var on = k === i;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('is-active', on);
    });
    eager(panels[i]);
    if (focus) tabs[i].focus();
  }
  list.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (keys[e.key]) { e.preventDefault(); selectTool((i + keys[e.key] + tabs.length) % tabs.length, true); }
    if (e.key === 'Home') { e.preventDefault(); selectTool(0, true); }
    if (e.key === 'End') { e.preventDefault(); selectTool(tabs.length - 1, true); }
  });
  if (tabs.length) selectTool(0, false);
  var more = $('#tools-more');
  if (more && SITE.toolsMore) more.innerHTML = '<b>그 밖에</b> ' + SITE.toolsMore.map(esc).join(', ') + '까지 모두 ' + (tools.length + SITE.toolsMore.length) + '가지 도구가 들어 있어요.';

  // ---------- 휴대폰 ----------
  var phones = $('#phones');
  if (phones) phones.innerHTML = (SITE.phones || []).map(function (p) { return phoneHtml(p.name, p.alt); }).join('');

  // ---------- 업데이트 ----------
  var updateList = $('#update-list');
  function renderUpdates(entries) {
    updateList.innerHTML = entries.slice(0, 3).map(function (v, idx) {
      var all = [];
      (Array.isArray(v.changes) ? v.changes : []).forEach(function (g) { (g.items || []).forEach(function (it) { all.push(it.title); }); });
      var shown = all.slice(0, 4), rest = all.length - shown.length;
      var date = String(v.date || '').replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, function (_, y, m, d) { return y + '년 ' + Number(m) + '월 ' + Number(d) + '일'; });
      return '<li class="update' + (idx === 0 ? ' is-latest' : '') + '">' +
        '<div class="update-ver">v' + esc(v.version) + '<time datetime="' + esc(v.date) + '">' + esc(date) + '</time></div>' +
        '<div><h3>' + esc(v.title) + '</h3><ul>' + shown.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
        (rest > 0 ? '<li>그 밖에 ' + rest + '가지 개선</li>' : '') + '</ul></div></li>';
    }).join('');
  }
  if (updateList) {
    renderUpdates(SITE.changelogFallback || []);
    var src = SITE.changelogSource;
    if (src && window.fetch) {
      fetch(src.url, { headers: { apikey: src.key, Authorization: 'Bearer ' + src.key } })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (rows) { if (Array.isArray(rows) && rows.length) renderUpdates(rows); })
        .catch(function () {});
    }
  }

  // ---------- 영상 ----------
  var player = $('#guide-player'), guideList = $('#guide-list');
  var videos = SITE.videos || [];
  function play(id, title) {
    player.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1" title="' + esc(title) + ' 사용법 영상" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  }
  function poster(id, title) {
    player.innerHTML = '<button class="guide-poster" type="button"><img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" width="480" height="360" loading="lazy">' +
      '<span class="play" aria-hidden="true"></span><span class="sr-only">' + esc(title) + ' 영상 재생</span></button>';
    $('.guide-poster', player).addEventListener('click', function () { play(id, title); });
  }
  if (player && guideList && videos.length) {
    guideList.innerHTML = videos.map(function (v, i) {
      return '<li><button type="button" data-i="' + i + '"' + (i === 0 ? ' aria-current="true"' : '') + '><span>' + String(i + 1).padStart(2, '0') + '</span>' + esc(v[1]) + '</button></li>';
    }).join('');
    poster(videos[0][0], videos[0][1]);
    guideList.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      var v = videos[Number(b.dataset.i)];
      $$('button', guideList).forEach(function (x) { x.removeAttribute('aria-current'); });
      b.setAttribute('aria-current', 'true');
      play(v[0], v[1]);
    });
  }

  // ---------- 설치 도움말: 브라우저 탭 ----------
  var segTabs = $$('.seg [role="tab"]');
  function selectSeg(btn, focus) {
    segTabs.forEach(function (t) {
      var on = t === btn;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) btn.focus();
  }
  segTabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectSeg(t, false); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); selectSeg(segTabs[(i + 1) % segTabs.length], true); }
    });
  });
  // Edge로 들어오면 Edge 안내를 먼저 보여 준다
  if (/Edg\//.test(navigator.userAgent) && segTabs[1]) selectSeg(segTabs[1], false);
})();
