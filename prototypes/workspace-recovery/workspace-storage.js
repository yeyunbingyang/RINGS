(() => {
  const browserOnly = location.protocol === 'file:';
  const coreKey = 'rings-data-v171';
  const otherKeys = [
    'rings-review-v17', 'rings-event-log-v171', 'rings-nav-config-v08',
    'rings-app-preferences-v10', 'rings-planning-v08', 'rings-review-note-v10',
  ];
  let records = new Map();
  let revision = 0;
  let dirty = false;
  let importing = false;
  let inFlight;
  let failure;
  let output;
  let retry;
  let reload;

  function readBrowser(key) {
    try { return localStorage.getItem(key); }
    catch { return null; }
  }

  function snapshot() {
    return Object.fromEntries([...records].map(([key, value]) => [key, JSON.parse(value)]));
  }

  function report(state, error) {
    if (!output) return;
    const labels = { saving: '正在写入本机数据库…', saved: '已保存到本机数据库', failed: error?.message };
    output.textContent = labels[state];
    retry.hidden = state !== 'failed' || error.conflict;
    reload.hidden = state !== 'failed' || !error.conflict;
  }

  async function request(method, body, path = '/api/workspace') {
    let response;
    try {
      response = await fetch(path, {
        method, headers: { 'X-Rings-Workspace': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body && JSON.stringify(body), signal: AbortSignal.timeout(12000),
      });
    } catch {
      throw new Error('无法连接本机工作台服务。连接恢复后可重试保存。');
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.error || '本机数据库操作失败。');
      error.conflict = response.status === 409;
      throw error;
    }
    if (!Number.isSafeInteger(result?.revision)) throw new Error('本机工作台服务返回了无法识别的数据。');
    return result;
  }

  function renderStatus() {
    const bar = document.createElement('div');
    bar.style.cssText = 'padding:4px 8px;font-size:11px;line-height:1.4';
    output = document.createElement('span');
    output.setAttribute('role', 'status');
    retry = Object.assign(document.createElement('button'), { textContent: '重试保存', className: 'secondary-button', hidden: true });
    reload = Object.assign(document.createElement('button'), { textContent: '重新载入', className: 'secondary-button', hidden: true });
    retry.onclick = () => { failure = undefined; flush().catch(() => {}); };
    reload.onclick = () => { if (confirm('重新载入会放弃此窗口未保存的改动。可先从设置导出当前副本。继续吗？')) location.reload(); };
    bar.append(output, retry, reload);
    document.querySelector('.sidebar-bottom').prepend(bar);
  }

  function flush() {
    if (browserOnly) return Promise.resolve();
    if (failure) return Promise.reject(failure);
    if (inFlight) return inFlight;
    if (!dirty) return Promise.resolve();
    report('saving');
    inFlight = (async () => {
      try {
        while (dirty) {
          dirty = false;
          const result = await request('PUT', { revision, data: snapshot() });
          revision = result.revision;
        }
        report('saved');
      } catch (error) {
        dirty = true;
        failure = error;
        report('failed', error);
        throw error;
      } finally {
        inFlight = undefined;
      }
    })();
    return inFlight;
  }

  function update(key, value) {
    if (browserOnly) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch (error) {
        throw new Error(error?.name === 'QuotaExceededError'
          ? '浏览器存储空间不足。请改用本机服务保存大附件。'
          : `无法写入浏览器存储：${error.message}`);
      }
      return;
    }
    if (importing) return;
    if ((records.get(key) ?? null) === value) return;
    if (value === null) records.delete(key);
    else records.set(key, value);
    dirty = true;
    queueMicrotask(() => flush().catch(() => {}));
  }

  async function chooseInitialData() {
    const raw = readBrowser(coreKey) || readBrowser('rings-data-v16') || readBrowser('rings-data-v14') || readBrowser('rings-data-v15');
    let legacy;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && ['tasks', 'habits', 'candidates', 'goals', 'plans'].every(key => Array.isArray(parsed[key]))) legacy = parsed;
    } catch {}
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', '初始化 RINGS 工作台');
    dialog.style.cssText = 'width:min(480px,92vw);border:1px solid #d6e2da;border-radius:12px;padding:20px';
    dialog.innerHTML = '<h2>建立本机工作台</h2><p>之后的记录会保存到本机数据库。</p><button type="button" class="primary-button" data-empty>建立空白工作台</button>';
    if (legacy) dialog.insertAdjacentHTML('beforeend', '<button type="button" class="secondary-button" data-legacy>导入此浏览器的旧记录</button>');
    dialog.insertAdjacentHTML('beforeend', '<p role="status" data-initial-status></p>');
    dialog.addEventListener('cancel', event => event.preventDefault());
    document.body.append(dialog);
    return new Promise(resolve => {
      const initialize = async (data) => {
        const buttons = [...dialog.querySelectorAll('button')];
        buttons.forEach(button => button.disabled = true);
        try {
          const result = await request('PUT', { revision: 0, data });
          dialog.close();
          dialog.remove();
          resolve({ revision: result.revision, data });
        } catch (error) {
          dialog.querySelector('[data-initial-status]').textContent = error.message;
          buttons.forEach(button => button.disabled = false);
        }
      };
      dialog.querySelector('[data-empty]').onclick = () => initialize({
        [coreKey]: { tasks: [], habits: [], candidates: [], goals: [], plans: [], directions: [], trash: [] },
      });
      if (legacy) dialog.querySelector('[data-legacy]').onclick = () => {
        const parts = [[coreKey, legacy]];
        for (const key of otherKeys) {
          try {
            const value = JSON.parse(readBrowser(key));
            if (value !== null) parts.push([key, value]);
          } catch {}
        }
        return initialize(Object.fromEntries(parts));
      };
      dialog.showModal();
    });
  }

  async function open() {
    if (browserOnly) return;
    try {
      let state = await request('GET');
      if (!state.data) state = await chooseInitialData();
      revision = state.revision;
      records = new Map(Object.entries(state.data).map(([key, value]) => [key, JSON.stringify(value)]));
      renderStatus();
      report('saved');
    } catch (error) {
      const dialog = document.createElement('dialog');
      dialog.style.cssText = 'width:min(480px,92vw);border:1px solid #d6e2da;border-radius:12px;padding:20px';
      const message = document.createElement('p');
      message.textContent = error.message;
      const button = Object.assign(document.createElement('button'), { textContent: '重新连接', className: 'primary-button' });
      button.onclick = () => location.reload();
      dialog.append(message, button);
      dialog.addEventListener('cancel', event => event.preventDefault());
      document.body.append(dialog);
      dialog.showModal();
      throw error;
    }
  }

  async function replace(data, keys) {
    if (browserOnly) throw new Error('请使用本机服务导入备份');
    await flush();
    const next = snapshot();
    for (const key of keys) {
      if (data[key] == null) delete next[key];
      else next[key] = data[key];
    }
    importing = true;
    try {
      const result = await request('PUT', { revision, data: next, replace: true });
      revision = result.revision;
      records = new Map(Object.entries(next).map(([key, value]) => [key, JSON.stringify(value)]));
    } finally {
      importing = false;
    }
  }

  async function uploadAttachment(id, file) {
    if (browserOnly) throw new Error('浏览器原型模式无法保存大附件，请使用本机服务。');
    let response;
    try {
      response = await fetch(`/api/attachments/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'X-Rings-Workspace': '1', 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
    } catch {
      throw new Error('无法上传附件，请检查本机服务连接。');
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || '附件保存失败。');
    return result;
  }

  function attachmentUrl(id) {
    return `/api/attachments/${encodeURIComponent(id)}`;
  }

  async function readAttachment(id) {
    let response;
    try {
      response = await fetch(attachmentUrl(id), { headers: { 'X-Rings-Workspace': '1' } });
    } catch {
      throw new Error('无法连接本机附件服务。');
    }
    if (!response.ok) throw new Error(response.status === 404 ? '附件不存在。' : '无法读取附件。');
    return response.blob();
  }

  async function deleteAttachment(id) {
    if (browserOnly) return;
    try {
      await fetch(`/api/attachments/${encodeURIComponent(id)}`, {
        method: 'DELETE', headers: { 'X-Rings-Workspace': '1' },
      });
    } catch {}
  }

  window.addEventListener('beforeunload', event => {
    if (dirty || inFlight || importing) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  window.ringsStorage = {
    open, get: key => browserOnly ? readBrowser(key) : records.get(key) ?? null,
    set: update, remove: key => update(key, null), replace, flush, browserOnly,
    importBackup: async () => (await request('GET', undefined, '/api/workspace/import-backup')).data,
    uploadAttachment, readAttachment, deleteAttachment,
    size: () => new TextEncoder().encode(JSON.stringify(snapshot())).length,
    toast(message, notify) {
      if (browserOnly || (!dirty && !inFlight)) return notify(message);
      notify('正在写入本机数据库…');
      flush().then(() => notify(message), error => notify(error.message));
    },
  };
})();
