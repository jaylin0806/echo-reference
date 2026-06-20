(function () {
  const app = document.getElementById('app');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const HOME_TITLE = '心臟超音波查閱卡';
  const HOME_SUBTITLE = 'EF / 瓣膜 / 舒張功能 公式與分級速查';
  const SEVERITY_RANK = { normal: 0, mild: 1, moderate: 2, severe: 3 };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fmtNum(n) {
    return Math.round(n * 100) / 100;
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

  function renderInputField(field, criterionIdx) {
    const unitText = field.unit ? `（${field.unit}）` : '';
    if (field.type === 'select') {
      const opts = field.options.map((o) => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('');
      return `
        <label class="calc-field">
          <span class="calc-field-label">${escapeHtml(field.label)}</span>
          <select data-field="${field.key}">${opts}</select>
        </label>
      `;
    }
    const attr = criterionIdx != null ? `data-criterion="${criterionIdx}"` : `data-field="${field.key}"`;
    return `
      <label class="calc-field">
        <span class="calc-field-label">${escapeHtml(field.label)}${escapeHtml(unitText)}</span>
        <input type="number" inputmode="decimal" step="${field.step || 'any'}" placeholder="${escapeHtml(field.placeholder || '')}" ${attr}>
      </label>
    `;
  }

  function renderCalculator(p, catKey, idx) {
    const cfg = p.calculator;
    if (!cfg) return '';
    let body = '';

    if (cfg.type === 'formula') {
      body = `
        <div class="calc-grid">${cfg.inputs.map((f) => renderInputField(f)).join('')}</div>
        <div class="calc-result severity-badge">尚未輸入足夠數值</div>
      `;
    } else if (cfg.type === 'multi') {
      body = `
        <div class="calc-criteria">
          ${cfg.criteria.map((c, i) => `
            <div class="calc-criterion-row">
              ${renderInputField({ label: c.label, unit: c.unit, step: c.step, placeholder: c.placeholder }, i)}
              <span class="calc-criterion-result" data-criterion-result="${i}">--</span>
            </div>
          `).join('')}
        </div>
        <div class="calc-result severity-badge">尚未輸入數值</div>
      `;
    } else if (cfg.type === 'checklist') {
      body = `
        <div class="calc-checklist">
          ${cfg.items.map((it, i) => `
            <label class="calc-checkbox-row">
              <input type="checkbox" data-checklist-item="${i}">
              <span>${escapeHtml(it.label)}</span>
            </label>
          `).join('')}
        </div>
        <div class="calc-result severity-badge">尚未勾選</div>
      `;
    }

    return `
      <button type="button" class="calc-toggle" aria-expanded="false">🧮 計算機</button>
      <div class="calculator" data-cat="${catKey}" data-param="${idx}" hidden>
        ${body}
      </div>
    `;
  }

  function renderParamCard(p, catKey, idx) {
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
        ${renderCalculator(p, catKey, idx)}
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

    const cards = cat.params.map((p, idx) => renderParamCard(p, key, idx)).join('');

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

  // ---------- Calculator interaction (event delegation) ----------

  function readFieldValue(input) {
    if (!input) return null;
    if (input.tagName === 'SELECT') return input.value;
    if (input.value === '') return null;
    const n = parseFloat(input.value);
    return Number.isNaN(n) ? null : n;
  }

  function getCalcConfig(calc) {
    const cat = ECHO_DATA[calc.dataset.cat];
    if (!cat) return null;
    const p = cat.params[Number(calc.dataset.param)];
    return p ? p.calculator : null;
  }

  function updateFormulaResult(calc, cfg) {
    const resultEl = calc.querySelector('.calc-result');
    const values = {};
    cfg.inputs.forEach((field) => {
      const input = calc.querySelector(`[data-field="${field.key}"]`);
      values[field.key] = readFieldValue(input);
    });

    const numericInputs = cfg.inputs.filter((f) => f.type !== 'select');
    const allFilled = numericInputs.every((f) => values[f.key] != null);
    if (!allFilled) {
      resultEl.removeAttribute('data-severity');
      resultEl.textContent = '尚未輸入足夠數值';
      return;
    }

    let val;
    try {
      val = cfg.compute(values);
    } catch (e) {
      val = null;
    }
    if (val == null || Number.isNaN(val) || !Number.isFinite(val)) {
      resultEl.removeAttribute('data-severity');
      resultEl.textContent = '數值無法計算，請確認輸入';
      return;
    }

    const cls = cfg.classify(val, values);
    resultEl.setAttribute('data-severity', cls.severity);
    resultEl.innerHTML = `${escapeHtml(cfg.resultLabel)} = <b>${fmtNum(val)}${escapeHtml(cfg.resultUnit || '')}</b>　<span class="severity-dot"></span>${escapeHtml(cls.label)}`;
  }

  function updateMultiResult(calc, cfg) {
    const rows = calc.querySelectorAll('.calc-criterion-row');
    let worst = null;
    let any = false;

    rows.forEach((row, i) => {
      const input = row.querySelector('[data-criterion]');
      const resEl = row.querySelector('[data-criterion-result]');
      const v = readFieldValue(input);
      if (v == null) {
        resEl.textContent = '--';
        resEl.removeAttribute('data-severity');
        return;
      }
      any = true;
      let cls;
      try {
        cls = cfg.criteria[i].classify(v);
      } catch (e) {
        cls = null;
      }
      if (!cls) {
        resEl.textContent = '--';
        resEl.removeAttribute('data-severity');
        return;
      }
      resEl.textContent = cls.label;
      resEl.setAttribute('data-severity', cls.severity);
      if (!worst || SEVERITY_RANK[cls.severity] > SEVERITY_RANK[worst.severity]) worst = cls;
    });

    const resultEl = calc.querySelector('.calc-result');
    if (!any || !worst) {
      resultEl.removeAttribute('data-severity');
      resultEl.textContent = '尚未輸入數值';
      return;
    }
    resultEl.setAttribute('data-severity', worst.severity);
    resultEl.innerHTML = `綜合判定：<span class="severity-dot"></span>${escapeHtml(worst.label)}`;
  }

  function updateChecklistResult(calc, cfg) {
    const boxes = calc.querySelectorAll('[data-checklist-item]');
    let count = 0;
    boxes.forEach((b) => { if (b.checked) count++; });
    const cls = cfg.classify(count);
    const resultEl = calc.querySelector('.calc-result');
    resultEl.setAttribute('data-severity', cls.severity);
    resultEl.innerHTML = `符合 ${count}/${boxes.length} 項　<span class="severity-dot"></span>${escapeHtml(cls.label)}`;
  }

  function handleCalcInputEvent(e) {
    const calc = e.target.closest('.calculator');
    if (!calc) return;
    const cfg = getCalcConfig(calc);
    if (!cfg) return;
    if (cfg.type === 'formula') updateFormulaResult(calc, cfg);
    else if (cfg.type === 'multi') updateMultiResult(calc, cfg);
    else if (cfg.type === 'checklist') updateChecklistResult(calc, cfg);
  }

  function handleAppClick(e) {
    const toggle = e.target.closest('.calc-toggle');
    if (toggle) {
      const card = toggle.closest('.param-card');
      const panel = card && card.querySelector('.calculator');
      if (!panel) return;
      panel.hidden = !panel.hidden;
      toggle.textContent = panel.hidden ? '🧮 計算機' : '🧮 收起計算機';
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
    }
  }

  app.addEventListener('input', handleCalcInputEvent);
  app.addEventListener('change', handleCalcInputEvent);
  app.addEventListener('click', handleAppClick);

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
  route();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
