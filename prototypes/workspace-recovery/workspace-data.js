(() => {
  const format = 'rings-workspace-backup-v1';
  const storageKeys = [
    'rings-data-v171', 'rings-review-v17', 'rings-event-log-v171',
    'rings-nav-config-v08', 'rings-app-preferences-v10', 'rings-planning-v08',
  ];
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
    if (core.trash?.some(item => !['task', 'subtask', 'habit', 'goal', 'candidate', 'event'].includes(item.type) ||
      (item.type === 'subtask' && (!validId(item.parentTaskId) || item.parentTaskId !== item.record?.parentTaskId)) ||
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

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', () => reject(reader.error));
      reader.readAsDataURL(file);
    });
  }

  async function addFiles(files, draft, notify, owner) {
    pendingFiles.set(draft, (pendingFiles.get(draft) || 0) + 1);
    let accepted = 0;
    const rejected = [];
    try {
      for (const file of Array.from(files || [])) {
        try {
          const item = {
            id: newCandidatePartId(), checklistItemId: owner(), kind: 'file',
            name: file.name, size: file.size, mime: file.type,
          };
          if (window.ringsStorage.browserOnly) {
            item.data = await readAsDataURL(file);
          } else {
            // 用上传时的原始文件名作为附件 id，使 data/attachments/ 中保存的就是原件名。
            // 服务端遇到同名文件会自动加 "-2" 等后缀并返回最终 id，这里据实写回引用，
            // 保证 material 指向磁盘上的真实文件；展示用的 item.name 仍保留用户所选的原始名。
            item.attachmentId = file.name;
            const saved = await window.ringsStorage.uploadAttachment(item.attachmentId, file);
            if (saved && typeof saved.id === 'string' && saved.id) item.attachmentId = saved.id;
          }
          draft.push(item);
          accepted++;
        } catch (error) {
          rejected.push(`${file.name}（${error.message}）`);
        }
      }
    } finally {
      pendingFiles.set(draft, pendingFiles.get(draft) - 1);
    }
    if (accepted || rejected.length) {
      notify(`已添加 ${accepted} 项${rejected.length ? `，${rejected.length} 项未添加：${rejected.join('；')}` : ''}`);
    }
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
    if (item.data || item.attachmentId || (item.kind === 'file' && !item.url && !item.path)) return 'file';
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

  const imageTypes = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
    gif: 'image/gif', bmp: 'image/bmp', avif: 'image/avif', ico: 'image/x-icon',
  };
  const previewTypes = new Set([...Object.values(imageTypes), 'image/vnd.microsoft.icon']);
  const thumbnails = new WeakMap();

  function imageSource(item, name) {
    if (typeof item.data === 'string') {
      const data = item.data.match(/^data:([^;,]*);base64,[a-z0-9+/=]+$/i);
      if (!data) return null;
      if (previewTypes.has(data[1].toLowerCase())) return { data: item.data };
      if (data[1] && data[1] !== 'application/octet-stream') return null;
    } else if (!item.attachmentId || window.ringsStorage.browserOnly) return null;
    const mime = String(item.mime || '').toLowerCase();
    const extension = name.split('.').pop().toLowerCase();
    const type = previewTypes.has(mime) ? mime
      : !mime || mime === 'application/octet-stream' ? imageTypes[extension] : null;
    if (typeof type !== 'string') return null;
    return { data: item.data, type, id: item.attachmentId };
  }

  async function previewBlob(source) {
    const blob = source.data
      ? await (await fetch(source.data)).blob()
      : await window.ringsStorage.readAttachment(source.id);
    return source.type ? blob.slice(0, blob.size, source.type) : blob;
  }

  async function imageThumbnail(source) {
    const bitmap = await createImageBitmap(await previewBlob(source));
    try {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 120 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL();
    } finally {
      bitmap.close();
    }
  }

  async function openImagePreview(source, name, trigger) {
    const dialog = makeElement('dialog', 'material-image-dialog');
    const header = makeElement('header', 'material-image-header');
    const title = makeElement('strong', '', name);
    const close = materialButton('关闭', () => dialog.close(), 'secondary-button');
    const status = makeElement('p', 'material-image-status', '正在读取图片…');
    const image = makeElement('img');
    let url;
    image.alt = name;
    image.hidden = true;
    status.setAttribute('role', 'status');
    dialog.setAttribute('aria-label', '图片预览 · ' + name);
    header.append(title, close);
    dialog.append(header, status, image);
    dialog.onkeydown = event => {
      if (event.key === 'Escape') event.stopPropagation();
    };
    dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
    dialog.onclose = () => {
      if (url) URL.revokeObjectURL(url);
      dialog.remove();
      trigger.focus();
    };
    document.body.append(dialog);
    dialog.showModal();
    close.focus();

    try {
      const blob = await previewBlob(source);
      if (!dialog.open) return;
      url = URL.createObjectURL(blob);
      image.src = url;
      await image.decode();
      if (!dialog.open) return;
      image.hidden = false;
      status.hidden = true;
    } catch {
      if (dialog.open) status.textContent = '无法预览此图片，可关闭后尝试下载原文件。';
    }
  }

  function materialImagePreview(item, name) {
    const source = imageSource(item, name);
    if (!source) return null;
    const button = materialButton('', () => openImagePreview(source, name, button), 'material-image-preview');
    button.setAttribute('aria-label', '预览图片 · ' + name);
    button.title = '预览图片';
    const label = makeElement('span', '', '预览');
    button.append(label);
    if (!thumbnails.has(item)) thumbnails.set(item, imageThumbnail(source).catch(() => null));
    thumbnails.get(item).then(src => {
      if (!src || !button.isConnected) return;
      const image = makeElement('img');
      image.alt = '';
      image.src = src;
      button.replaceChildren(image);
    });
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
        if (item.attachmentId && !window.ringsStorage.browserOnly) {
          const status = makeElement('small');
          status.setAttribute('role', 'status');
          const button = materialButton('下载', async () => {
            button.disabled = true;
            status.textContent = '';
            try {
              const contents = await window.ringsStorage.readAttachment(item.attachmentId);
              download(name, contents, item.mime);
            } catch (error) {
              status.textContent = error.message;
            } finally {
              button.disabled = false;
            }
          });
          actions.append(button, status);
        } else if (typeof item.data === 'string') {
          actions.append(materialButton('下载', () => {
            const data = item.data.match(/^data:[^,]*;base64,([a-zA-Z0-9+/=]*)$/)?.[1];
            if (data !== undefined) download(name, Uint8Array.from(atob(data), char => char.charCodeAt(0)), item.mime);
          }));
        }
        addActions?.(actions, item);
        const preview = key === 'file' ? materialImagePreview(item, name) : null;
        if (preview) row.append(preview);
        row.append(text, actions);
        root.append(row);
      }
    }
    if (!items.length) root.append(makeElement('p', 'list-empty-hint', '暂无资料。'));
  }

  function checklistDraft(record) {
    const draft = normalizeCandidateParts(record);
    const unassigned = draft.materials.filter(item => !item.checklistItemId);
    if (unassigned.length) {
      const existing = draft.checklist.find(row => row.legacyMaterials);
      const row = existing || { id: newCandidatePartId(), title: '原有资料', legacyMaterials: true };
      if (!existing) draft.checklist.push(row);
      for (const item of unassigned) item.checklistItemId = row.id;
    }
    return draft;
  }

  function checklistLabel(text) {
    const firstLine = text.trim().split(/\r?\n/, 1)[0];
    return firstLine.length > 64 ? firstLine.slice(0, 64) + '…' : firstLine;
  }

  function renderCandidateMaterialsOverview(root, candidate) {
    const { checklist, materials } = checklistDraft(candidate);
    root.replaceChildren();
    for (const row of checklist) {
      const items = materials.filter(item => item.checklistItemId === row.id);
      const details = makeElement('details', 'material-checklist');
      const summary = makeElement('summary');
      summary.append(makeElement('strong', '', checklistLabel(row.title)), makeElement('small', '', materialCounts(items)));
      const content = makeElement('div', 'material-check-content');
      if (!row.autoTitle && row.title !== checklistLabel(row.title)) content.append(makeElement('p', 'checklist-description', row.title));
      const list = makeElement('div');
      renderMaterialGroups(list, items);
      content.append(list);
      details.append(summary, content);
      root.append(details);
    }
    if (!checklist.length) root.append(makeElement('p', 'list-empty-hint', '暂无清单。'));
  }

  function createCandidateMaterialsEditor(root, notify) {
    const sidebar = makeElement('div', 'checklist-sidebar');
    const list = makeElement('div', 'checklist-list');
    const editors = makeElement('div', 'checklist-editors');
    const panels = new Map();
    let state, selectedId;

    sidebar.append(materialButton('＋ 快速新建清单', addRow, 'inline-add-button'), list);
    root.classList.add('checklist-workspace');
    root.replaceChildren(sidebar, editors);

    function owned(id) {
      return state.materials.filter(item => item.checklistItemId === id);
    }

    function inferredTitle(id) {
      const items = owned(id);
      const file = items.find(item => materialGroup(item) === 'file');
      if (file?.name) return file.name;
      const reference = items[0];
      if (reference?.url) {
        try { return new URL(reference.url).hostname || reference.url; }
        catch { return reference.url; }
      }
      return reference?.path?.split(/[\\/]+/).filter(Boolean).at(-1) || reference?.name || '';
    }

    function displayTitle(row) {
      return checklistLabel((row.autoTitle ? '' : row.title) || inferredTitle(row.id)) || '新清单';
    }

    function updateRow(row) {
      const entry = panels.get(row.id);
      entry.button.firstElementChild.textContent = displayTitle(row);
      entry.button.lastElementChild.textContent = materialCounts(owned(row.id));
    }

    function select(id) {
      selectedId = id;
      for (const [rowId, entry] of panels) {
        entry.button.setAttribute('aria-pressed', String(id === rowId));
        entry.section.hidden = id !== rowId;
      }
    }

    function refresh() {
      for (const row of state.checklist) updateRow(row);
      for (const [id, entry] of panels) {
        const items = owned(id);
        renderMaterialGroups(entry.panel.querySelector('.material-group-list'), items, (actions, item) => {
          const group = items.filter(other => materialGroup(other) === materialGroup(item));
          const previous = group[group.indexOf(item) - 1];
          if (previous) actions.append(materialButton('上移', () => {
            const from = state.materials.indexOf(item);
            const to = state.materials.indexOf(previous);
            [state.materials[from], state.materials[to]] = [state.materials[to], state.materials[from]];
            refresh();
          }));
          const destinations = state.checklist.filter(other => other.id !== id);
          if (destinations.length) {
            const chooser = makeElement('details', 'material-move');
            const choices = makeElement('div', 'material-move-options');
            const buttons = destinations.map(destination => materialButton(displayTitle(destination), () => {
              item.checklistItemId = destination.id;
              refresh();
              notify(`资料已移到「${displayTitle(destination)}」。`);
            }));
            if (buttons.length > 6) {
              const search = makeElement('input');
              search.type = 'search';
              search.placeholder = '搜索清单…';
              search.setAttribute('aria-label', '搜索移动目标');
              search.oninput = () => {
                const query = search.value.trim().toLowerCase();
                buttons.forEach(button => { button.hidden = !button.textContent.toLowerCase().includes(query); });
              };
              chooser.ontoggle = () => { if (chooser.open) search.focus(); };
              choices.append(search);
            }
            choices.append(...buttons);
            chooser.append(makeElement('summary', '', '移动到'), choices);
            actions.append(chooser);
          }
          actions.append(materialButton('移除', () => {
            state.materials.splice(state.materials.indexOf(item), 1);
            refresh();
          }));
        });
      }
    }

    function makePanel(id) {
      const panel = makeElement('div', 'material-scope');
      panel.dataset.owner = id || '';
      const roleGroup = 'reference-role-' + newCandidatePartId();
      panel.innerHTML = `<div class="checklist-attachment-fields">
      <div><h5 class="material-group-title">文件</h5>
        <div class="material-file-zone" tabindex="0" role="group" aria-label="拖入或粘贴文件">
          <input type="file" multiple hidden>
          <button type="button" class="secondary-button" data-material-files>＋ 添加文件</button>
          <span>也可拖入或粘贴文件</span>
        </div>
        </div><div><h5 class="material-group-title">链接与路径</h5>
        <button type="button" class="secondary-button" data-material-reference aria-expanded="false">＋ 添加链接或路径</button>
      </div></div>
      <div class="material-reference-editor" hidden>
        <fieldset><legend>引用用途</legend>
          <label><input type="radio" name="${roleGroup}" value="source" checked> 来源引用</label>
          <label><input type="radio" name="${roleGroup}" value="target"> 整理目标</label>
        </fieldset>
        <textarea rows="3" aria-label="引用地址" placeholder="粘贴网址、本地或共享文件夹路径、网盘位置，每行一条"></textarea>
        <button type="button" class="inline-add-button" data-save-references>加入条目</button>
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
      panel.saveReferences = () => {
        const lines = text.value.split(/\r\n|\n|\r/).map(line => line.trim()).filter(Boolean);
        if (!lines.length) return;
        const role = editor.querySelector('input:checked').value;
        for (const line of lines) {
          const location = /^www\./i.test(line) ? 'https://' + line : line;
          if (owned(id).some(item => item.role === role && (item.url || item.path) === location)) continue;
          const url = /^https?:\/\//i.test(location) ? location : '';
          state.materials.push({ id: newCandidatePartId(), checklistItemId: id, kind: url ? 'link' : 'reference',
            role, name: location, url, path: url ? '' : location });
        }
        text.value = '';
        if (!editor.hidden) toggle.click();
      };
      editor.querySelector('[data-save-references]').onclick = () => {
        panel.saveReferences();
        refresh();
        toggle.focus();
      };
      return panel;
    }


    function appendRow(row) {
      const button = materialButton('', () => { refresh(); select(row.id); }, 'checklist-row');
      button.append(makeElement('strong'), makeElement('small'));
      const section = makeElement('section', 'checklist-editor');
      const label = makeElement('label', 'checklist-description-field', '清单说明（可选）');
      const input = makeElement('textarea');
      input.rows = 3;
      input.value = row.autoTitle ? '' : row.title;
      input.placeholder = '写一条待办或补充几行说明，也可只添加文件或链接';
      input.oninput = () => {
        row.title = input.value;
        delete row.autoTitle;
        delete row.legacyMaterials;
        updateRow(row);
      };
      label.append(input);
      const panel = makePanel(row.id);
      const footer = makeElement('div', 'checklist-editor-actions');
      footer.append(materialButton('删除条目', () => removeRow(row), 'secondary-button danger'),
        materialButton('完成条目', () => {
          panel.saveReferences();
          if (!row.title.trim() && !owned(row.id).length) {
            if (pendingFiles.get(state.materials)) notify('附件仍在上传，请稍后完成。');
            else input.focus();
            return;
          }
          refresh();
          button.focus();
        }, 'primary-button'));
      section.append(label, panel, footer);
      list.querySelector('.list-empty-hint')?.remove();
      editors.querySelector(':scope > .list-empty-hint')?.remove();
      list.append(button);
      editors.append(section);
      panels.set(row.id, { button, section, panel, input });
    }

    function removeRow(row) {
      if (pendingFiles.get(state.materials)) { notify('附件仍在上传，请稍后删除。'); return; }
      const entry = panels.get(row.id);
      const items = owned(row.id);
      const hasReferences = entry.panel.querySelector('.material-reference-editor textarea').value.trim();
      if ((items.length || hasReferences) && !confirm('删除这条清单？其中的文件和引用将移到「原有资料」。')) return;
      entry.panel.saveReferences();
      const retained = owned(row.id);
      if (retained.length) {
        let archive = state.checklist.find(item => item !== row && item.legacyMaterials);
        if (!archive) {
          archive = { id: newCandidatePartId(), title: '原有资料', legacyMaterials: true };
          state.checklist.push(archive);
          appendRow(archive);
        }
        for (const item of retained) item.checklistItemId = archive.id;
      }
      state.checklist.splice(state.checklist.indexOf(row), 1);
      entry.button.remove();
      entry.section.remove();
      panels.delete(row.id);
      if (!panels.size) showEmpty();
      select(state.checklist[0]?.id);
      refresh();
    }

    function showEmpty() {
      list.append(makeElement('p', 'list-empty-hint', '暂无清单。'));
      editors.append(makeElement('p', 'list-empty-hint', '新建一项，可添加说明、文件或链接。'));
    }

    function reset(record) {
      state = checklistDraft(record);
      panels.clear();
      list.replaceChildren();
      editors.replaceChildren();
      for (const row of state.checklist) appendRow(row);
      if (!panels.size) showEmpty();
      select(state.checklist[0]?.id);
      refresh();
    }

    function addRow() {
      const current = panels.get(selectedId);
      current?.panel.saveReferences();
      const existing = state.checklist.find(row => !row.title.trim() && !owned(row.id).length
        && !panels.get(row.id).panel.querySelector('textarea').value.trim());
      const row = existing || { id: newCandidatePartId(), title: '' };
      if (!existing) {
        state.checklist.push(row);
        appendRow(row);
      }
      select(row.id);
      refresh();
      panels.get(row.id).input.focus();
    }

    function collect() {
      const issue = checkAttachmentDraft(state.materials);
      if (issue) return { issue };
      for (const entry of panels.values()) entry.panel.saveReferences();
      const checklist = state.checklist.flatMap(row => {
        const description = row.autoTitle ? '' : row.title.trim();
        if (description) return [{ ...row, title: description }];
        const title = inferredTitle(row.id);
        return title ? [{ ...row, title, autoTitle: true }] : [];
      });
      refresh();
      return { checklist, materials: state.materials.map(item => ({ ...item })) };
    }

    reset();
    return { reset, collect };
  }

  function checkAttachmentDraft(draft) {
    if (pendingFiles.get(draft)) return '附件仍在上传，请稍后保存。';
    return '';
  }

  window.ringsWorkspaceData = { exportBackup, downloadBackup, parseBackup, restoreBackup,
    normalizeCandidateParts, createCandidateMaterialsEditor, renderCandidateMaterialsOverview };
})();
