/* 数据驱动内容填充：读取 data/*.json，按 data-field 填充页面文本与图片 */
(function () {
  document.documentElement.classList.add('js');

  var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var inSub = /(^|\/)case-studies(\/|$)/.test(location.pathname);
  var base = inSub ? '../' : '';
  var file = page === 'index' ? base + 'data/site.json' : base + 'data/cases/' + page + '.json';

  fetch(file + '?v=' + Date.now())
    .then(function (r) { if (!r.ok) throw new Error('load fail'); return r.json(); })
    .then(function (data) {
      fillFields(data);
      renderLists(data);
      renderCategories(data);
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
    /* 工作方法 */
    var proc = document.querySelector('.process');
    if (proc && Array.isArray(data.process)) {
      proc.innerHTML = data.process.map(function (p) {
        return '<div><span class="process-cn">' + esc(p.cn) + '</span><strong>' + esc(p.en) + '</strong><small>' + esc(p.note) + '</small></div>';
      }).join('');
    }
  }

  /* 分类杂志目录：每类一节，含中文/英文大标题与项目卡片 */
  function renderCategories(data) {
    var root = document.getElementById('categories');
    if (!root || !Array.isArray(data.categories)) return;
    root.innerHTML = data.categories.map(function (cat, ci) {
      var cards = (cat.projects || []).map(function (p, i) {
        var img = p.image
          ? '<div class="cat-img"><img src="' + esc(fixPath(p.image)) + '" alt="' + esc(p.alt || p.title) + '" loading="lazy"></div>'
          : '<div class="cat-img cat-img-empty"><span>图片待补充 / IMAGE PENDING</span></div>';
        var tag = p.href ? '<a class="cat-card" href="' + esc(p.href) + '">' : '<article class="cat-card">';
        var end = p.href ? '</a>' : '</article>';
        return tag +
          img +
          '<div class="cat-card-body">' +
            '<small class="cat-index">' + esc(p.index) + '</small>' +
            '<h3>' + esc(p.title) + '</h3>' +
            (p.title_en ? '<small class="cat-title-en">' + esc(p.title_en) + '</small>' : '') +
            (p.address ? '<p class="cat-meta">项目地址：' + esc(p.address) + '<br>项目状态：' + esc(p.status || '') + '<br>职责定位：' + esc(p.role_cn || '') + '</p>'
                       : '<p>' + esc(p.subtitle) + ' <span>' + esc(p.role) + '</span></p>') +
          '</div>' +
          end;
      }).join('');
      return '<div class="cat-block">' +
        '<div class="cat-head">' +
          '<span class="cat-no">' + esc(String(ci + 1).padStart(2, '0')) + '</span>' +
          '<h2>' + esc(cat.name) + ' <em>' + esc(cat.en) + '</em></h2>' +
          '<p>' + esc(cat.desc || '') + '</p>' +
        '</div>' +
        '<div class="cat-grid">' + cards + '</div>' +
      '</div>';
    }).join('');
  }
})();
