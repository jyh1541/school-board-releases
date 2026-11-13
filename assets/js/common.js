// 두 페이지(메인·기능 설명서)가 함께 쓰는 동작: 영상·화면 크게 보기, 다운로드, 버전 표시, 설치 도움말 탭, 알림
(function () {
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  window.SB = { $: $, $$: $$, esc: esc };

  // ---------- 영상·화면 크게 보기 ----------
  var viewer = $('#viewer'), box = $('#viewer-box'), vTitle = $('#viewer-title'), vOut = $('#viewer-out');
  var canDialog = !!(viewer && typeof viewer.showModal === 'function');
  function openViewer(kind, html, title, out) {
    if (!canDialog) return false;
    viewer.className = 'viewer' + (kind === 'short' ? ' is-short' : kind === 'image' ? ' is-image' : '');
    box.innerHTML = html;
    vTitle.textContent = title || '';
    if (out) { vOut.href = out; vOut.hidden = false; } else vOut.hidden = true;
    viewer.showModal();
    return true;
  }
  function closeViewer() { if (viewer.open) viewer.close(); }
  if (canDialog) {
    viewer.addEventListener('close', function () { box.innerHTML = ''; });
    viewer.addEventListener('click', function (e) { if (e.target === viewer) closeViewer(); });
    $('#viewer-close').addEventListener('click', closeViewer);
  }
  // 유튜브 퍼가기는 어느 사이트에서 틀었는지(Referer)를 받아야 재생된다.
  // 파일을 더블클릭해 연 페이지(file://)는 이 정보가 없어 오류 153이 나므로 유튜브로 바로 연다.
  var canEmbed = /^https?:$/.test(location.protocol);
  function playVideo(id, title, isShort) {
    var watch = isShort ? 'https://www.youtube.com/shorts/' + id : 'https://www.youtube.com/watch?v=' + id;
    if (!canEmbed) { window.open(watch, '_blank', 'noopener'); return; }
    var html = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1" title="' + esc(title) + ' 영상" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    if (!openViewer(isShort ? 'short' : 'video', html, title, watch)) window.open(watch, '_blank', 'noopener');
  }
  document.addEventListener('click', function (e) {
    var v = e.target.closest('[data-yt]');
    if (v) {
      e.preventDefault();
      playVideo(v.getAttribute('data-yt'), v.getAttribute('data-title') || '', v.hasAttribute('data-short'));
      return;
    }
    var z = e.target.closest('[data-zoom]');
    if (z) {
      e.preventDefault();
      var img = $('img', z), src = z.getAttribute('data-zoom');
      var html = '<img src="' + esc(src) + '" alt="' + esc(img ? img.alt : '') + '">';
      if (!openViewer('image', html, img ? img.alt : '', '')) window.open(src, '_blank', 'noopener');
    }
  });

  // ---------- 알림 ----------
  var toast = $('#toast'), toastTimer = null;
  function showToast(html) {
    if (!toast) return;
    toast.innerHTML = html;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 9000);
  }

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
    if (!release || !release.tag_name) return;
    var v = release.tag_name.replace(/^v?/, 'v');
    $$('#latest-version').forEach(function (el) { el.textContent = '최신 버전 ' + v; });
    $$('.js-version').forEach(function (el) { el.textContent = v; });
  });

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
  if (/Edg\//.test(navigator.userAgent) && segTabs[1]) selectSeg(segTabs[1], false);
})();
