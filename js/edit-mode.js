// js/edit-mode.js
(function () {
  // =========================
  // 0) فهرس عكسي سياسة -> دليل (احتياطي عبر الـ hash)
  // =========================
  let policyToManual = {};
  try {
    if (typeof classificationData === 'object' && classificationData) {
      const map = {};
      for (const domain of Object.values(classificationData)) {
        if (!domain || !domain.manuals) continue;
        for (const manual of Object.values(domain.manuals)) {
          if (!manual) continue;
          const manualCode = manual.code; // مثل "PMO-Manual"
          const policies = manual.policies || [];
          policies.forEach(p => { if (p && p.code) map[p.code] = manualCode; });
        }
      }
      policyToManual = map;
    }
  } catch {}

  // =========================
  // 1) طرق معرفة الوثيقة المعروضة
  // =========================
  function getFromActiveHeader() {
    const active = document.querySelector('.manual-header.active');
    if (!active) return null;
    const manualCode = active.dataset.manualCode;
    if (!manualCode) return null;
    return { manualCode, path: `policies/${manualCode}.html` };
  }

  function getFromHash() {
    const hash = (location.hash || '').replace(/^#/, '').trim();
    if (!hash) return null;
    const manualCode = policyToManual[hash];
    if (!manualCode) return null;
    return { manualCode, path: `policies/${manualCode}.html` };
  }

  function resolveCurrentDoc(contentContainer) {
    // أولوية 1: إن كان مضبوطًا مسبقًا على عنصر الحاوية
    if (contentContainer && contentContainer.dataset.currentPath) {
      const manualCode = contentContainer.dataset.currentManual || null;
      return { manualCode, path: contentContainer.dataset.currentPath };
    }
    // أولوية 2: من الشجرة (العنصر النشط)
    const byActive = getFromActiveHeader();
    if (byActive) return byActive;
    // أولوية 3: من الـ hash
    const byHash = getFromHash();
    if (byHash) return byHash;
    return null;
  }

  // =========================
  // 2) لفّ دالة التحميل لتسجيل المسار تلقائيًا (أقل تغيير ممكن)
  // =========================
  if (typeof window.loadPolicyContent === 'function') {
    const _orig = window.loadPolicyContent;
    window.loadPolicyContent = function (manualCode, contentContainer, ...rest) {
      if (contentContainer && manualCode) {
        contentContainer.dataset.currentManual = manualCode;
        contentContainer.dataset.currentPath   = `policies/${manualCode}.html`;
      }
      return _orig.apply(this, [manualCode, contentContainer, ...rest]);
    };
  }

  // احتياطي إضافي: لو تغيّر محتوى الحاوية بدون المرور بالدالة
  const container = document.getElementById('content-container');
  if (container) {
    const mo = new MutationObserver(() => {
      const cur = resolveCurrentDoc(container);
      if (cur && !container.dataset.currentPath) {
        container.dataset.currentManual = cur.manualCode || '';
        container.dataset.currentPath   = cur.path;
      }
    });
    mo.observe(container, { childList: true, subtree: true });
  }

  // =========================
  // 3) عناصر واجهة وضع التحرير
  // =========================
  const content = document.getElementById('content-container');
  const btn = document.getElementById('edit-toggle-btn');
  if (!content || !btn) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'edit-toolbar';
  toolbar.style.cssText = `
    position: fixed; top: 12px; left: 12px; z-index: 2000;
    display: none; gap: 8px; background: #111827; color: #fff;
    padding: 10px 12px; border-radius: 10px; box-shadow: 0 6px 18px rgba(0,0,0,.25);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans Arabic', Arial, sans-serif;
  `;
  toolbar.innerHTML = `
    <button id="save-edit-btn" class="px-3 py-1 rounded" style="background:#16a34a">حفظ</button>
    <button id="cancel-edit-btn" class="px-3 py-1 rounded" style="background:#6b7280">إلغاء</button>
  `;
  document.body.appendChild(toolbar);

  const style = document.createElement('style');
  style.textContent = `
    body.editing #content-container[contenteditable="true"] { outline: 2px dashed #f59e0b; outline-offset: 4px; }
    body.editing #content-container a { pointer-events: none; }
    .non-editable { user-select: none; }
    .edit-highlight { animation: editFlash 1.2s ease-in-out 1; }
    @keyframes editFlash { 0% { background: rgba(245,158,11,.25);} 100% { background: transparent; } }
  `;
  document.head.appendChild(style);

  let isEditing = false;
  let snapshotHTML = '';
  let onHashWhileEditing = null;

  function prevent(e) { e.preventDefault(); e.stopPropagation(); }

  // ========= تمكين/تعطيل تحرير خلايا الجداول =========
  function enableTableCellEditing(root) {
    root.querySelectorAll('table').forEach(tbl => {
      tbl.removeAttribute('contenteditable');
      tbl.querySelectorAll('td, th').forEach(cell => {
        cell.setAttribute('contenteditable', 'true');
      });
    });
  }

  function disableTableCellEditing(root) {
    root.querySelectorAll('table td[contenteditable], table th[contenteditable]').forEach(cell => {
      cell.removeAttribute('contenteditable');
    });
  }

  // ========= لصق كنص عادي داخل أي منطقة قابلة للتحرير =========
  function installPlainTextPaste(root) {
    root.addEventListener('paste', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('[contenteditable="true"]')) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        // إدراج النص في الموضع الحالي
        document.execCommand('insertText', false, text);
      }
    });
  }

  btn.addEventListener('click', () => isEditing ? disableEditMode() : enableEditMode());

  function enableEditMode() {
    const cur = resolveCurrentDoc(content);
    if (!cur || !cur.path) {
      alert('تعذّر تحديد الوثيقة الحالية. افتح دليلاً من الشجرة أو استخدم رابطًا به hash صالح.');
      return;
    }

    isEditing = true;
    document.body.classList.add('editing');
    btn.textContent = 'إيقاف التحرير';

    snapshotHTML = content.innerHTML;
    content.setAttribute('contenteditable', 'true');

    // منع تحرير عناصر بعينها (مع السماح للجداول)
    content.querySelectorAll('pre, code, .mermaid').forEach(el => {
      el.setAttribute('contenteditable', 'false');
      el.classList.add('non-editable');
    });

    // تفعيل تحرير خلايا الجداول
    enableTableCellEditing(content);

    // تعطيل الروابط أثناء التحرير
    content.querySelectorAll('a').forEach(a => a.addEventListener('click', prevent, true));

    // منع تغيير المحتوى بسبب تغيّر الهاش أثناء التحرير
    onHashWhileEditing = (ev) => { ev.preventDefault(); ev.stopImmediatePropagation(); history.replaceState(null, '', ' '); };
    window.addEventListener('hashchange', onHashWhileEditing, true);

    // لصق نص عادي
    installPlainTextPaste(content);

    toolbar.style.display = 'flex';
    content.classList.add('edit-highlight');
    setTimeout(() => content.classList.remove('edit-highlight'), 1200);
  }

  function disableEditMode() {
    isEditing = false;
    document.body.classList.remove('editing');
    btn.textContent = 'وضع التحرير';

    disableTableCellEditing(content);

    content.removeAttribute('contenteditable');
    content.querySelectorAll('[contenteditable="false"]').forEach(el => {
      el.removeAttribute('contenteditable');
      el.classList.remove('non-editable');
    });

    content.querySelectorAll('a').forEach(a => a.removeEventListener('click', prevent, true));

    if (onHashWhileEditing) {
      window.removeEventListener('hashchange', onHashWhileEditing, true);
      onHashWhileEditing = null;
    }
    toolbar.style.display = 'none';
  }

  // إلغاء
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    if (!isEditing) return;
    if (!confirm('سيتم تجاهل التعديلات غير المحفوظة. متابعة؟')) return;
    content.innerHTML = snapshotHTML;
    disableEditMode();
  });

  // حفظ
  document.getElementById('save-edit-btn').addEventListener('click', async () => {
    if (!isEditing) return;

    const cur = resolveCurrentDoc(content);
    if (!cur || !cur.path) {
      alert('تعذّر تحديد مسار الملف للحفظ.');
      return;
    }

    // نلتقط جذر الوثيقة الحقيقي فقط
    const liveRoot = content.querySelector('.policy-content') || content;
    const working = liveRoot.cloneNode(true);

    // تنظيف: إزالة contenteditable / العناصر الديناميكية / السكربتات
    try {
      working.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
      working.querySelectorAll('.ai-search-wrapper, .search-input, .search-results').forEach(n => n.remove());
      working.querySelectorAll('script').forEach(n => n.remove());
    } catch {}

    const cleanedHTML = liveRoot.classList.contains('policy-content')
      ? working.outerHTML    // نحفظ الجذر كما هو (مع wrapper .policy-content)
      : working.innerHTML;   // أو كامل محتوى #content-container إن لم يوجد wrapper

    try {
      const resp = await fetch('/api/save-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: cur.path, html: cleanedHTML })
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`فشل الحفظ: ${resp.status} ${txt}`);
      }

      alert('تم الحفظ بنجاح ✅');
      disableEditMode();
    } catch (err) {
      console.error(err);
      alert('تعذر الحفظ:\n' + (err?.message || String(err)));
    }
  });
})();
