/* 数据驱动内容填充：读取 data/*.json，按 data-field 填充页面文本与图片 */
(function () {
  document.documentElement.classList.add('js');

  var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var file = page === 'index' ? 'data/site.json' : 'data/cases/' + page + '.json';

  fetch(file)
    .then(function (r) { if (!r.ok) throw new Error('load fail'); return r.json(); })
    .then(function (data) {
      fillFields(data);
      renderLists(data);
    })
    .catch(function () { /* 数据加载失败时保留 HTML 默认内容 */ });

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* 子目录（case-studies/）下把相对路径补成 ../ */
  function fixPath(src) {
    if (typeof src !== 'string' || !src) return src;
    var inSub = /(^|\/)case-studies(\/|$)/.test(location.pathname);
    var external = /^(https?:)?\/\//i.test(src) || src.charAt(0) === '/';
    var already = src.indexOf('../') === 0;
    if (inSub && !external && !already) return '../' + src;
    return src;
  }

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }

  function fillFields(data) {
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var v = get(data, el.getAttribute('data-field'));
      if (v === undefined || v === null) return;
      if (el.tagName === 'IMG') { el.src = fixPath(v); return; }
      el.innerHTML = v;
    });
  }

  function renderLists(data) {
    /* 专业能力 */
    var skills = document.querySelector('.bilingual-list');
    if (skills && Array.isArray(data.skills)) {
      skills.innerHTML = data.skills.map(function (s) {
        return '<div><b>' + esc(s.index) + '</b><span>' + esc(s.name) + ' <small>' + esc(s.en) + '</small></span></div>';
      }).join('');
    }
    /* 精选项目 */
    var proj = document.getElementById('projects');
    if (proj && Array.isArray(data.projects)) {
      proj.querySelectorAll('a.project, article.project').forEach(function (n) { n.remove(); });
      data.projects.forEach(function (p) {
        var el = document.createElement(p.href ? 'a' : 'article');
        el.className = 'project' + (p.offset ? ' offset' : '');
        if (p.href) el.href = p.href;
        el.innerHTML =
          '<small>' + esc(p.index) + '</small>' +
          '<h2>' + esc(p.title) + '</h2>' +
          '<p>' + esc(p.subtitle) + ' <span>' + esc(p.role) + '</span></p>' +
          '<div><img src="' + esc(fixPath(p.image)) + '" alt="' + esc(p.alt || p.title) + '" loading="lazy"></div>';
        proj.appendChild(el);
      });
    }
    /* 工作方法 */
    var proc = document.querySelector('.process');
    if (proc && Array.isArray(data.process)) {
      proc.innerHTML = data.process.map(function (p) {
        return '<div><span class="process-cn">' + esc(p.cn) + '</span><strong>' + esc(p.en) + '</strong><small>' + esc(p.note) + '</small></div>';
      }).join('');
    }
  }
})();
