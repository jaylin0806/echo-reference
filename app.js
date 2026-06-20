(function () {
  const app = document.getElementById('app');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const HOME_TITLE = '心臟超音波查閱卡';
  const HOME_SUBTITLE = 'EF / 瓣膜 / 舒張功能 公式與分級速查';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderHome() {
    pageTitle.textContent = HOME_TITLE;
    pageSubtitle.textContent = HOME_SUBTITLE;

    const tiles = Object.values(ECHO_DATA).map((cat) => `
      <a class="category-tile" href="#${cat.key}">
        <span class="tile-icon">${cat.icon}</span>
        <span class="tile-name">${escapeHtml(cat.name)}</span>
        <span class="tile-desc">${escapeHtml(cat.shortDesc)}</span>
      </a>
    `).join('');

    app.innerHTML = `<div class="category-grid">${tiles}</div>`;
  }

  function renderGradingTable(rows) {
    if (!rows || !rows.length) return '';
    const trs = rows.map((r) => `
      <tr data-severity="${r.severity}">
        <td class="severity-cell"><span class="severity-dot"></span>${escapeHtml(r.label)}</td>
        <td>${escapeHtml(r.range)}</td>
      </tr>
    `).join('');
    return `
      <table class="grading-table">
        <thead><tr><th>分級</th><th>數值範圍</th></tr></thead>
        <tbody>${trs}</tbody>
      </table>
    `;
  }

  function renderParamCard(p) {
    const metas = (p.metas || []).map((m) => `
      <span class="param-meta"><b>${escapeHtml(m.label)}</b>${escapeHtml(m.value)}</span>
    `).join('');

    return `
      <section class="card param-card">
        <h2>${escapeHtml(p.name)}</h2>
        <div class="param-formula">${escapeHtml(p.formula)}</div>
        <div class="param-meta-row">
          <span class="param-meta"><b>正常值</b>${escapeHtml(p.normalRange)}</span>
          ${metas}
        </div>
        ${renderGradingTable(p.gradingTable)}
        <p class="param-note"><span class="label">量測重點：</span>${escapeHtml(p.probeNote)}</p>
        <p class="source-note">${escapeHtml(p.sourceNote)}</p>
      </section>
    `;
  }

  function renderCategory(key) {
    const cat = ECHO_DATA[key];
    if (!cat) {
      renderNotFound();
      return;
    }

    pageTitle.textContent = `${cat.icon} ${cat.name}`;
    pageSubtitle.textContent = cat.shortDesc;

    const cards = cat.params.map(renderParamCard).join('');

    app.innerHTML = `
      <a class="back-link" href="#home">← 回到分類首頁</a>
      <p class="category-intro">${escapeHtml(cat.intro)}</p>
      ${cards}
    `;
  }

  function renderNotFound() {
    pageTitle.textContent = HOME_TITLE;
    pageSubtitle.textContent = HOME_SUBTITLE;
    app.innerHTML = `
      <a class="back-link" href="#home">← 回到分類首頁</a>
      <section class="card"><p>找不到這個分類。</p></section>
    `;
  }

  function route() {
    const hash = (location.hash || '#home').replace(/^#/, '');
    window.scrollTo(0, 0);
    if (hash === '' || hash === 'home') {
      renderHome();
    } else {
      renderCategory(hash);
    }
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
  route();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
