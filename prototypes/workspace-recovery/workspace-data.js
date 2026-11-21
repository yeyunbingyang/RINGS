(() => {
  const format = 'rings-workspace-backup-v1';
  const storageKeys = [
    'rings-data-v171', 'rings-review-v17', 'rings-event-log-v171',
    'rings-nav-config-v08', 'rings-app-preferences-v10', 'rings-planning-v08',
  ];
  const MB = 1024 * 1024;
  const validRecord = value => value && typeof value === 'object' && !Array.isArray(value);
  const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_.-]+$/.test(value) &&
    !['__proto__', 'constructor', 'prototype'].includes(value);
  const pendingFiles = new WeakMap();

  function download(name, contents, type = 'application/octet-stream') {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const link = Object.assign(document.createElement('a'), { href: url, download: name });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function exportBackup() {
    const data = Object.fromEntries(storageKeys.map(key => [key, JSON.parse(window.ringsStorage.get(key) || 'null')]));
    downloadBackup(data, 'RINGS-工作台备份.json');
  }

  function downloadBackup(data, name) {
    const complete = Object.fromEntries(storageKeys.map(key => [key, data[key] ?? null]));
    download(name, JSON.stringify({ format, exportedAt: new Date().toISOString(), data: complete }), 'application/json');
  }

  function parseBackup(text) {
    const incoming = JSON.parse(text);
    const data = incoming?.format === format ? incoming.data
      : incoming?.version === '1.2' ? { 'rings-data-v171': incoming } : null;
    if (incoming?.format === format && (!validRecord(data) ||
      !storageKeys.filter(key => key !== 'rings-planning-v08').every(key => Object.hasOwn(data, key)))) {
      throw new Error('完整备份缺少数据区块');
    }
    const core = data?.['rings-data-v171'];
    if (!validRecord(core) || !['tasks', 'habits', 'candidates', 'goals', 'plans'].every(key =>
      Array.isArray(core[key]) && core[key].every(item => validRecord(item) && validId(item.id)))) {
      throw new Error('备份格式或记录标识无效');
    }
    for (const key of ['trash', 'directions']) {
      if (core[key] !== undefined && (!Array.isArray(core[key]) ||
        !core[key].every(item => validRecord(item) && validId(item.id)))) throw new Error('备份数据结构无效');
    }
    if (core.trash?.some(item => !['task', 'habit', 'goal', 'candidate', 'event'].includes(item.type) ||
      !validRecord(item.record) || !validId(item.record.id) || typeof item.deletedAt !== 'string' ||
      !Array.isArray(item.linkedPlans) || !Array.isArray(item.links))) throw new Error('回收站记录无效');
    for (const nav of [core.navConfig, data['rings-nav-config-v08']]) {
      if (nav != null && (!validRecord(nav) || !['sidebar', 'top'].every(key =>
        Array.isArray(nav[key]) && nav[key].every(item => validRecord(item) && validId(item.id) &&
          typeof item.label === 'string' && !/[<>]/.test(item.label))))) throw new Error('导航配置结构无效');
    }
    const review = data['rings-review-v17'];
    if (review != null && (!validRecord(review) || !Array.isArray(review.records) || !Array.isArray(review.improvements))) {
      throw new Error('复盘数据结构无效');
    }
    if (data['rings-event-log-v171'] != null && !Array.isArray(data['rings-event-log-v171'])) {
      throw new Error('业务日志结构无效');
    }
    return { data, full: incoming.format === format };
  }

  function restoreBackup({ data, full }) {
    const keys = full ? storageKeys.filter(key => Object.hasOwn(data, key)) : ['rings-data-v171'];
    if (!window.ringsStorage.browserOnly) return window.ringsStorage.replace(data, keys);
    const old = keys.map(key => [key, localStorage.getItem(key)]);
    const write = (key, value) => value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value);
    try {
      for (const key of keys) localStorage.removeItem(key);
      for (const key of keys) write(key, data[key] == null ? null : JSON.stringify(data[key]));
    } catch (error) {
      for (const key of keys) localStorage.removeItem(key);
      for (const [key, value] of old) write(key, value);
      throw error;
    }
  }

  async function addFiles(files, draft, notify, owner) {
    pendingFiles.set(draft, (pendingFiles.get(draft) || 0) + 1);
    let accepted = 0;
    const rejected = [];
    const exceedsLimit = file => file.size > MB ||
      draft.reduce((total, item) => total + (item.data ? item.size : 0), 0) + file.size > 3 * MB;
    try {
      for (const file of Array.from(files || [])) {
        if (exceedsLimit(file)) { rejected.push(file.name); continue; }
        try {
          const data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result));
            reader.addEventListener('error', () => reject(reader.error));
            reader.readAsDataURL(file);
          });
          if (exceedsLimit(file)) { rejected.push(file.name); continue; }
          draft.push({ id: newCandidatePartId(), checklistItemId: owner(), kind: 'file', name: file.name, size: file.size, mime: file.type, data });
          accepted++;
        } catch {
          rejected.push(file.name);
        }
      }
    } finally {
      pendingFiles.set(draft, pendingFiles.get(draft) - 1);
    }
    if (accepted || rejected.length) notify(`已添加 ${accepted} 项${rejected.length ? `，${rejected.length} 项未添加。单文件限 1 MB，单事项合计限 3 MB。大文件可添加路径引用。` : ''}`);
  }

  function newCandidatePartId() {
    return crypto.randomUUID();
  }

  function normalizeCandidateParts(candidate = {}) {
    function withId(item, used) {
      const id = validId(item.id) && !used.has(item.id) ? item.id : newCandidatePartId();
      used.add(id);
      return { ...item, id };
    }
    const checklistIds = new Set();
    const materialIds = new Set();
    const rows = Array.isArray(candidate.checklist) ? candidate.checklist : [];
    const items = Array.isArray(candidate.materials) ? candidate.materials : [];
    const checklist = rows.flatMap(row => {
      const item = typeof row === 'string' ? { title: row } : row;
      return typeof item?.title === 'string' && item.title.trim() ? [withId(item, checklistIds)] : [];
    });
    const materials = items.filter(validRecord).map(item => withId({
      ...item,
      checklistItemId: checklistIds.has(item.checklistItemId) ? item.checklistItemId : null,
      role: item.role === 'target' ? 'target' : 'source',
    }, materialIds));
    return { checklist, materials };
  }

  function materialGroup(item) {
    if (item.data || (item.kind === 'file' && !item.url && !item.path)) return 'file';
    return item.role === 'target' ? 'target' : 'source';
  }

  const materialGroups = [['file', '文件'], ['source', '来源引用'], ['target', '整理目标']];
  function materialCounts(items) {
    return materialGroups.map(([key, name]) =>
      `${name} ${items.filter(item => materialGroup(item) === key).length}`).join(' · ');
  }

  function makeElement(tag, className = '', content = '') {
    return Object.assign(document.createElement(tag), { className, textContent: content });
  }

  function materialButton(label, callback, className = 'text-action') {
    const button = makeElement('button', className, label);
    button.type = 'button';
    button.onclick = callback;
    return button;
  }

  function renderMaterialGroups(root, items, addActions) {
    root.replaceChildren();
    for (const [key, label] of materialGroups) {
      const group = items.filter(item => materialGroup(item) === key);
      if (!group.length) continue;
      root.append(makeElement('h5', 'material-group-title', `${label} · ${group.length}`));
      for (const item of group) {
        const row = makeElement('div', 'material-entry');
        const location = item.url || item.path || '';
        const name = item.name || location || '未命名资料';
        const text = makeElement('div', 'material-entry-text');
        if (name !== location || !location) text.append(makeElement('strong', '', name));
        if (/^https?:\/\//i.test(item.url || '')) {
          const link = makeElement('a', '', location);
          link.href = item.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          text.append(link);
        } else if (location) text.append(makeElement('small', '', location));
        else if (typeof item.size === 'number') text.append(makeElement('small', '', `${item.size.toLocaleString('zh-CN')} 字节`));
        const actions = makeElement('div', 'material-entry-actions');
        if (typeof item.data === 'string') actions.append(materialButton('下载', () => {
          const data = item.data.match(/^data:[^,]*;base64,([a-zA-Z0-9+/=]*)$/)?.[1];
          if (data !== undefined) download(name, Uint8Array.from(atob(data), char => char.charCodeAt(0)), item.mime);
        }));
        addActions?.(actions, item);
        row.append(text, actions);
        root.append(row);
      }
    }
    if (!items.length) root.append(makeElement('p', 'list-empty-hint', '暂无资料。'));
  }

  function renderCandidateMaterialsOverview(root, candidate) {
    const { checklist, materials } = normalizeCandidateParts(candidate);
    const section = makeElement('div');
    const shared = materials.filter(item => !item.checklistItemId);
    section.append(makeElement('h5', 'material-group-title', `事项资料 · ${shared.length} 项`));
    const list = makeElement('div');
    renderMaterialGroups(list, shared);
    section.append(list);
    for (const row of checklist) {
      const subset = materials.filter(item => item.checklistItemId === row.id);
      const details = makeElement('details', 'material-checklist');
      const summary = makeElement('summary');
      summary.append(makeElement('strong', '', row.title), makeElement('small', '', materialCounts(subset)));
      details.append(summary);
      const list = makeElement('div', 'material-check-content');
      renderMaterialGroups(list, subset);
      details.append(list);
      section.append(details);
    }
    root.replaceChildren(section);
  }

  function createCandidateMaterialsEditor(checklistRoot, materialsRoot, onChange, notify) {
    let state = { checklist: [], materials: [] };

    function owned(id) {
      return state.materials.filter(item => item.checklistItemId === id);
    }

    function refresh() {
      const panels = [materialsRoot.firstElementChild, ...checklistRoot.querySelectorAll('.material-scope')];
      for (const panel of panels) {
        const id = panel.dataset.owner || null;
        const items = owned(id);
        renderMaterialGroups(panel.querySelector('.material-group-list'), items, (actions, item) => {
          const group = items.filter(entry => materialGroup(entry) === materialGroup(item));
          const previous = group[group.indexOf(item) - 1];
          if (previous) actions.append(materialButton('上移', () => {
            const currentIndex = state.materials.indexOf(item);
            const previousIndex = state.materials.indexOf(previous);
            [state.materials[currentIndex], state.materials[previousIndex]] = [previous, item];
            refresh();
          }));
          const destinations = [{ id: null, title: '事项资料' }, ...state.checklist]
            .filter(row => row.id !== item.checklistItemId);
          if (destinations.length) {
            const chooser = makeElement('details', 'material-move');
            chooser.append(makeElement('summary', '', '移动到'));
            const choices = makeElement('div', 'material-move-options');
            const buttons = destinations.map(destination => materialButton(destination.title.trim() || '未命名条目', () => {
              item.checklistItemId = destination.id;
              refresh();
              notify(`资料已移到「${destination.title.trim() || '未命名条目'}」。`);
            }));
            let search;
            if (buttons.length > 6) {
              search = makeElement('input');
              search.type = 'search';
              search.placeholder = '搜索清单条目…';
              search.setAttribute('aria-label', '搜索移动目标');
              search.oninput = () => {
                const query = search.value.trim().toLowerCase();
                buttons.forEach(button => { button.hidden = !button.textContent.toLowerCase().includes(query); });
              };
              choices.append(search);
            }
            chooser.ontoggle = () => {
              if (!chooser.open) return;
              destinations.forEach((destination, index) => {
                buttons[index].textContent = destination.title.trim() || '未命名条目';
              });
              if (search) { search.value = ''; search.oninput(); search.focus(); }
            };
            choices.append(...buttons);
            chooser.append(choices);
            actions.append(chooser);
          }
          actions.append(materialButton('移除', () => {
            state.materials.splice(state.materials.indexOf(item), 1);
            refresh();
          }));
        });
        const summary = panel.closest('.material-checklist')?.querySelector('summary');
        if (summary) {
          const row = state.checklist.find(item => item.id === id);
          summary.firstElementChild.textContent = row.title.trim() || '未命名条目';
          summary.lastElementChild.textContent = materialCounts(items);
        }
      }
      onChange(state.checklist.filter(row => row.title.trim()).length, owned(null).length);
    }

    function makePanel(id) {
      const panel = makeElement('div', 'material-scope');
      panel.dataset.owner = id || '';
      const roleGroup = 'reference-role-' + newCandidatePartId();
      panel.innerHTML = `<div class="material-add-row">
        <div class="material-file-zone" tabindex="0" role="group" aria-label="拖入或粘贴文件">
          <input type="file" multiple hidden>
          <button type="button" class="secondary-button" data-material-files>＋ 添加文件</button>
          <span>也可拖入或粘贴文件</span>
        </div>
        <button type="button" class="secondary-button" data-material-reference aria-expanded="false">＋ 添加引用</button>
      </div>
      <div class="material-reference-editor" hidden>
        <fieldset><legend>引用用途</legend>
          <label><input type="radio" name="${roleGroup}" value="source" checked> 来源引用</label>
          <label><input type="radio" name="${roleGroup}" value="target"> 整理目标</label>
        </fieldset>
        <textarea rows="3" aria-label="引用地址" placeholder="粘贴网址、本地或共享文件夹路径、网盘位置，每行一条"></textarea>
        <button type="button" class="inline-add-button" data-save-references>添加引用</button>
      </div><div class="material-group-list"></div>`;
      const fileZone = panel.querySelector('.material-file-zone');
      const fileInput = panel.querySelector('input');
      const editor = panel.querySelector('.material-reference-editor');
      const toggle = panel.querySelector('[data-material-reference]');
      const text = editor.querySelector('textarea');
      async function add(fileList) {
        if (!fileList?.length) return;
        const draft = state;
        await addFiles(fileList, draft.materials, message => { if (state === draft) notify(message); },
          () => draft.checklist.some(row => row.id === id) ? id : null);
        if (draft === state) refresh();
      }
      panel.querySelector('[data-material-files]').onclick = () => fileInput.click();
      fileInput.onchange = () => { add(fileInput.files); fileInput.value = ''; };
      fileZone.ondragover = event => { event.preventDefault(); fileZone.classList.add('is-dragover'); };
      fileZone.ondragleave = () => fileZone.classList.remove('is-dragover');
      fileZone.ondrop = event => {
        event.preventDefault();
        fileZone.classList.remove('is-dragover');
        add(event.dataTransfer.files);
      };
      fileZone.onpaste = event => {
        if (!event.clipboardData?.files.length) return;
        event.preventDefault();
        add(event.clipboardData.files);
      };
      toggle.onclick = () => {
        editor.hidden = !editor.hidden;
        toggle.setAttribute('aria-expanded', String(!editor.hidden));
        if (!editor.hidden) { editor.querySelector('input[value="source"]').checked = true; text.focus(); }
      };
      editor.querySelector('[data-save-references]').onclick = () => {
        const lines = text.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        if (!lines.length) { text.focus(); return; }
        const role = editor.querySelector('input:checked').value;
        for (const line of lines) {
          const location = /^www\./i.test(line) ? 'https://' + line : line;
          if (owned(id).some(item => item.role === role && (item.url || item.path) === location)) continue;
          const url = /^https?:\/\//i.test(location) ? location : '';
          state.materials.push({ id: newCandidatePartId(), checklistItemId: id, kind: url ? 'link' : 'reference',
            role, name: location, url, path: url ? '' : location });
        }
        text.value = '';
        toggle.click();
        toggle.focus();
        refresh();
      };
      return panel;
    }

    function appendRow(row) {
      const details = makeElement('details', 'material-checklist');
      const summary = makeElement('summary');
      summary.append(makeElement('strong'), makeElement('small'));
      const content = makeElement('div', 'material-check-content');
      const toolbar = makeElement('div', 'material-check-toolbar');
      const input = makeElement('input');
      input.value = row.title;
      input.maxLength = 160;
      input.placeholder = '输入清单条目…';
      input.setAttribute('aria-label', '清单条目名称');
      input.oninput = () => {
        row.title = input.value;
        summary.firstElementChild.textContent = row.title.trim() || '未命名条目';
        onChange(state.checklist.filter(item => item.title.trim()).length, owned(null).length);
      };
      toolbar.append(input, materialButton('删除条目', () => {
        const items = owned(row.id);
        if (items.length && !confirm(`删除这条清单？它的 ${items.length} 项资料将移回事项资料。`)) return;
        for (const item of items) item.checklistItemId = null;
        state.checklist.splice(state.checklist.indexOf(row), 1);
        details.remove();
        if (!state.checklist.length) showEmpty();
        refresh();
        if (items.length) notify(`已将 ${items.length} 项资料移回事项。`);
      }));
      content.append(toolbar, makePanel(row.id));
      details.append(summary, content);
      checklistRoot.append(details);
      return { details, input };
    }

    function showEmpty() {
      checklistRoot.append(makeElement('p', 'list-empty-hint', '暂无清单条目。'));
    }

    function reset(candidate) {
      state = normalizeCandidateParts(candidate);
      checklistRoot.replaceChildren();
      materialsRoot.replaceChildren(makePanel(null));
      for (const row of state.checklist) appendRow(row);
      if (!state.checklist.length) showEmpty();
      refresh();
    }

    function addRow() {
      if (!state.checklist.length) checklistRoot.replaceChildren();
      const row = { id: newCandidatePartId(), title: '' };
      state.checklist.push(row);
      const { details, input } = appendRow(row);
      details.open = true;
      refresh();
      input.focus();
    }

    function collect(previous = []) {
      const issue = checkAttachmentDraft(state.materials, previous);
      if (issue) return { issue };
      const checklist = state.checklist.filter(row => row.title.trim()).map(row => ({ ...row, title: row.title.trim() }));
      const ids = new Set(checklist.map(row => row.id));
      if (state.materials.some(item => item.checklistItemId && !ids.has(item.checklistItemId))) {
        return { issue: '请为有资料的清单条目填写名称，或将资料移到其他位置。' };
      }
      return { checklist, materials: state.materials.map(item => ({ ...item })) };
    }

    return { reset, addRow, collect };
  }

  function checkAttachmentDraft(draft, oldMaterials = []) {
    if (pendingFiles.get(draft)) return '附件仍在读取，请稍后保存。';
    const size = draft.reduce((sum, item) => sum + (item.data?.length || 0), 0);
    if (!size) return '';
    const previous = oldMaterials.reduce((sum, item) => sum + (item.data?.length || 0), 0);
    if (!window.ringsStorage.browserOnly) {
      return window.ringsStorage.size() + size - previous > 30 * MB ? '工作台附件接近存储上限。请先导出备份并移除不需要的附件。' : '';
    }
    const used = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .reduce((sum, key) => sum + key.length + (localStorage.getItem(key)?.length || 0), 0);
    return used + size - previous > 4.5 * MB ? '浏览器存储空间不足。请减少附件或先导出备份。' : '';
  }

  window.ringsWorkspaceData = { exportBackup, downloadBackup, parseBackup, restoreBackup,
    normalizeCandidateParts, createCandidateMaterialsEditor, renderCandidateMaterialsOverview };
})();
