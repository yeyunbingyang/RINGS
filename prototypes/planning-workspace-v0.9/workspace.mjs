const workspace = document.querySelector('#workspacePage');
const frame = document.querySelector('#workspaceModule');
const header = document.querySelector('#workspaceHeader');
const pages = new Map([
  ['home', '调度首页'], ['candidate', '候选事项'], ['planning', '规划'],
  ['execution', '执行库'], ['review', '复盘中心'], ['trash', '回收站'], ['settings', '设置'],
]);
const categories = {
  Memo: '备忘', Resource: '资料', Idea: '想法', Wish: '愿望', 'Task Candidate': '待办种子',
  Decision: '待决策', Issue: '问题', Waiting: '等待', Commitment: '承诺', Event: '事件',
};
const kinds = { tasks: '任务', habits: '习惯', candidates: '候选事项' };
const tracked = { ...kinds, goals: '目标', plans: '计划', events: '日历事件', sessions: '专注记录' };
const reviewFields = ['成果', '偏差', '原因', '经验', '下一周期行动'];
const reviewTabs = { cycle: '周期复盘', analysis: '数据分析', history: '历史复盘', actions: '改进追踪' };
const settings = db.settings ??= {};
for (const key of ['events', 'habits', 'sessions', 'reviews', 'improvements', 'activity', 'otherTrash']) {
  db[key] ??= [];
}

let page;
let calendarDate = dateKey(new Date());
let calendarView = settings.calendarView || 'day';
let reviewDate = calendarDate;
let reviewType = 'week';
let reviewTab = 'cycle';
let customReviewEnd = calendarDate;
let taskSearch = '';
let taskPriority = '';
let calendarFocus = false;
let focus;
let pendingSelection;

function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function shiftDate(day, delta) {
  const date = new Date(`${day}T12:00`);
  date.setDate(date.getDate() + delta);
  return dateKey(date);
}

function period(day, type) {
  const date = new Date(`${day}T12:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  if (type === 'week') {
    const start = shiftDate(day, -((date.getDay() + 6) % 7));
    return [start, shiftDate(start, 6)];
  }
  if (type === 'month') return [dateKey(new Date(year, month, 1)), dateKey(new Date(year, month + 1, 0))];
  if (type === 'year') return [`${year}-01-01`, `${year}-12-31`];
  if (type === 'custom') return [day, customReviewEnd >= day ? customReviewEnd : day];
  return [day, day];
}

function movePeriod(day, type, offset) {
  const date = new Date(`${day}T12:00`);
  if (type === 'month' || type === 'year') {
    const months = offset * (type === 'year' ? 12 : 1);
    return dateKey(new Date(date.getFullYear(), date.getMonth() + months, 1));
  }
  return shiftDate(day, offset * (type === 'week' ? 7 : 1));
}

function records() {
  return new Map(Object.keys(tracked).flatMap(key =>
    db[key].map(item => [`${key}/${item.id}`, { key, item: structuredClone(item) }])));
}

let baseline = records();
function recordChanges() {
  const next = records();
  const today = dateKey(new Date());
  for (const [id, record] of new Map([...baseline, ...next])) {
    const before = baseline.get(id)?.item;
    const after = next.get(id)?.item;
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    db.activity.unshift({
      id: crypto.randomUUID(), date: today, type: record.key, ref: record.item.id,
      title: record.item.title || db.tasks.find(task => task.id === record.item.taskId)?.title || tracked[record.key],
      change: !before ? '新增' : !after ? '移除' : '更新',
      completed: after?.status === 'completed' && before?.status !== 'completed',
    });
  }
  baseline = next;
}

function navigate(target) {
  location.hash = target;
  show(target);
}

function show(target) {
  page = pages.has(target) ? target : 'home';
  document.title = `RINGS · ${pages.get(page)}`;
  for (const button of document.querySelectorAll('[data-nav]')) {
    const active = button.dataset.nav === pages.get(page);
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  header.querySelector('.crumb').textContent = 'RINGS / 年轮';
  header.querySelector('strong').textContent = pages.get(page);
  document.querySelector('#planningActions').hidden = page !== 'planning';
  document.querySelector('#workspaceSearch').hidden = false;
  const embedded = page === 'candidate' || page === 'execution';
  workspace.closest('.wrap').hidden = embedded;
  frame.hidden = !embedded;
  if (embedded) {
    const source = `/execution.html?module=${page}`;
    frame.title = `RINGS ${pages.get(page)}`;
    if (frame.getAttribute('src') !== source) frame.setAttribute('src', source);
  } else {
    frame.removeAttribute('src');
  }
  const planning = document.querySelector('#planningPage');
  planning.hidden = page !== 'planning';
  document.querySelector('#trashPage').style.display = page === 'trash' ? '' : 'none';
  document.querySelector('#otherTrash').hidden = page !== 'trash';
  workspace.hidden = embedded || ['planning', 'trash'].includes(page);
  if (page === 'planning') backPlanning();
  if (page === 'trash') refreshTrash();
  if (page === 'home') renderHome();
  if (page === 'review') renderReview();
  if (page === 'settings') renderSettings();
}

function action(label, name, value = '', extra = '') {
  return `<button type="button" class="btn ${extra}" data-workspace="${name}" data-value="${esc(value)}">${esc(label)}</button>`;
}

function tab(label, name, value, selected) {
  return `<button type="button" class="btn" data-workspace="${name}" data-value="${value}" aria-pressed="${value === selected}">${label}</button>`;
}

function heading(title, detail, actions = '') {
  return `<div class="workspace-heading"><div><h1 class="workspace-title">${title}</h1><p>${detail}</p></div><div class="workspace-actions">${actions}</div></div>`;
}

function kpis(items) {
  return `<div class="workspace-kpis">${items.map(([label, total]) =>
    `<div class="workspace-kpi"><small>${label}</small><b>${total}</b></div>`).join('')}</div>`;
}

function selectField(label, name, options, selected) {
  return `<div class="field"><label>${label}<select name="${name}">${options.map(([value, text]) =>
    `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></label></div>`;
}

function item(title, detail, buttons = '', attributes = '') {
  return `<div class="workspace-item" ${attributes}><div><b>${esc(title)}</b><small>${esc(detail)}</small></div><div class="workspace-actions">${buttons}</div></div>`;
}

function dateWindow(items, [start, end], getDate) {
  return items.filter(item => {
    const day = getDate(item);
    return day >= start && day <= end;
  });
}

function activePlans() {
  return db.plans.filter(plan => !['cancelled', 'archived'].includes(plan.status) && db.tasks.some(task => task.id === plan.taskId));
}

function handleTime(entry, fallback = '09:00') {
  return entry?.slice(11, 16) || fallback;
}

function renderTimeline(plans, events) {
  const allDay = plans.filter(plan => !plan.startAt.includes('T') || plan.startAt.slice(0, 10) !== calendarDate);
  const times = [...plans.filter(plan => !allDay.includes(plan)).map(plan => ({ plan, time: handleTime(plan.startAt) })),
    ...events.map(event => ({ event, time: event.start }))].sort((a, b) => a.time.localeCompare(b.time));
  const first = Math.min(8, ...times.map(entry => Number(entry.time.slice(0, 2))));
  const last = Math.max(19, ...times.map(entry => Number(entry.time.slice(0, 2))));
  const allDayRows = allDay.map(plan => {
    const task = db.tasks.find(task => task.id === plan.taskId);
    const range = [plan.startAt.slice(0, 10), plan.endAt?.slice(0, 10)].filter(Boolean);
    return item(task.title, '已有计划 · ' + [...new Set(range)].join(' 至 '),
      action('调整计划', 'plan-edit', plan.id) + action('专注', 'focus-start', task.id));
  }).join('');
  return (allDayRows ? `<div class="workspace-slot"><span>日期计划</span><div class="workspace-list">${allDayRows}</div></div>` : '') +
    Array.from({ length: last - first + 1 }, (_, index) => {
    const hour = String(first + index).padStart(2, '0');
    return `<div class="workspace-slot" data-slot="${hour}:00"><time>${hour}:00</time><div class="workspace-list">${times
      .filter(entry => entry.time.slice(0, 2) === hour)
      .map(({ plan, event, time }) => {
        if (event) return item(event.title, `事件 · ${time}–${event.end || '结束待补'}`, action('编辑事件', 'event-edit', event.id));
        const task = db.tasks.find(task => task.id === plan.taskId);
        return item(task.title, `计划 · ${time}–${handleTime(plan.endAt, '未记录')}`,
          action('调整计划', 'plan-edit', plan.id) + action('专注', 'focus-start', task.id));
      }).join('')}</div></div>`;
  }).join('');
}

function plansInRange(plans, [start, end]) {
  return plans.filter(plan => plan.startAt.slice(0, 10) <= end && (plan.endAt || plan.startAt).slice(0, 10) >= start);
}

function renderCalendarGrid([start, end], plans, events) {
  const yearly = calendarView === 'year';
  const items = [];
  if (calendarView === 'month') {
    const offset = (new Date(`${start}T12:00`).getDay() + 6) % 7;
    for (const label of ['一', '二', '三', '四', '五', '六', '日']) items.push(`<small aria-hidden="true">周${label}</small>`);
    for (let i = 0; i < offset; i++) items.push('<span aria-hidden="true"></span>');
  }
  for (let day = start; day <= end; day = yearly ? movePeriod(day, 'month', 1) : shiftDate(day, 1)) {
    const bounds = yearly ? period(day, 'month') : [day, day];
    const planCount = plansInRange(plans, bounds).length;
    const eventCount = dateWindow(events, bounds, event => event.date).length;
    items.push(`<button class="btn workspace-cell" data-workspace="${yearly ? 'calendar-month' : 'calendar-day'}" data-value="${day}" ${day === calendarDate ? 'aria-current="date"' : ''}>
      <b>${yearly ? Number(day.slice(5, 7)) + ' 月' : day.slice(5)}</b>${planCount || eventCount ? `<small>${planCount} 计划 · ${eventCount} 事件</small>` : ''}</button>`);
  }
  return `<div class="workspace-period" style="--columns:${yearly ? 3 : 7}">${items.join('')}</div>`;
}

function renderHome() {
  const bounds = period(calendarDate, calendarView);
  const currentPlans = activePlans();
  const plans = plansInRange(currentPlans, bounds);
  const events = dateWindow(db.events, bounds, event => event.date);
  const today = dateKey(new Date());
  const pool = db.tasks.filter(task => {
    return !['completed', 'archived', 'cancelled'].includes(task.status)
      && !currentPlans.some(plan => plan.taskId === task.id && (plan.endAt || plan.startAt).slice(0, 10) >= today);
  });
  const viewTabs = Object.entries({ day: '今日', week: '本周', month: '本月', year: '年度' })
    .map(([id, label]) => tab(label, 'calendar-view', id, calendarView)).join('');
  const summary = kpis([['周期计划', plans.length], ['日历事件', events.length],
    ['未安排任务', pool.length], ['今日已记录习惯', db.habits.filter(habit => habit.occurrences?.includes(today)).length]]);
  const dueCandidates = settings.reminders ? db.candidates.filter(candidate => candidate.followup && candidate.followup <= today
    && !['archived', 'dismissed', 'converted'].includes(candidate.status) && !candidate.converted) : [];
  const reminder = dueCandidates.length
    ? `<div class="workspace-item"><b>${dueCandidates.length} 条候选事项已到跟进日期</b>${action('打开候选事项', 'open-candidates')}</div>` : '';
  const title = heading('调度工作台', '查看时间安排，从任务池挑选下一项。',
    action('收藏资料', 'capture-resource') + action('新建候选事项', 'capture') +
    action('新建目标', 'new-goal') + action('新建习惯', 'new-habit') + action('新建事件', 'event-new'));
  const dateControls = action('上一期', 'calendar-shift', '-1') + action('今天', 'calendar-today') + action('下一期', 'calendar-shift', '1');
  const calendar = calendarView === 'day' ? renderTimeline(plans, events) : renderCalendarGrid(bounds, plans, events);
  workspace.innerHTML = title + reminder + summary + `<div class="workspace-calendar${calendarFocus ? ' is-focused' : ''}">
    <section class="panel workspace-panel"><div class="workspace-actions"><h2>时间安排</h2>${action(calendarFocus ? '退出专注' : '全屏专注', 'calendar-focus')}</div>
    <div class="workspace-tabs" aria-label="时间视图">${viewTabs}</div>
    <div class="workspace-actions">${dateControls}<label>日期 <input type="date" id="workspaceDate" value="${calendarDate}"></label>
    <strong>${bounds[0] === bounds[1] ? bounds[0] : bounds.join(' 至 ')}</strong></div>
    <div class="workspace-scroll">${calendar}</div></section>
    <section class="panel workspace-panel"><div class="workspace-actions"><h2>未安排任务池</h2>${action('添加任务', 'task-new', '', 'primary')}</div>
    <div class="workspace-actions"><label>搜索任务 <input type="search" id="workspaceTaskSearch" value="${esc(taskSearch)}" placeholder="按任务名称"></label>
    <label>优先级 <select id="workspaceTaskPriority">${[['', '全部'], ['高', '高'], ['普通', '普通'], ['低', '低']]
      .map(([id, label]) => `<option value="${id}" ${id === taskPriority ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div>
    <div class="workspace-list workspace-scroll" id="workspaceTaskPool"></div></section></div>`;
  workspace.querySelector('#workspaceDate').addEventListener('change', event => {
    if (!event.target.value) return;
    calendarDate = event.target.value;
    renderHome();
  });
  const updatePool = () => {
    document.querySelector('#workspaceTaskPool').innerHTML = pool
      .filter(task => (!taskPriority || (task.priority || '普通') === taskPriority) && task.title.toLowerCase().includes(taskSearch.toLowerCase()))
      .map(task => item(task.title, [task.priority, task.estimate && `${task.estimate} 分钟`, task.deadline && `截止 ${task.deadline}`].filter(Boolean).join(' · '),
        action('编辑', 'task-edit', task.id) + action('安排到时间', 'plan-new', task.id), `draggable="true" data-task="${esc(task.id)}"`)).join('')
      || '<div class="empty">没有符合条件的未安排任务</div>';
  };
  workspace.querySelector('#workspaceTaskSearch').addEventListener('input', event => {
    taskSearch = event.target.value;
    updatePool();
  });
  workspace.querySelector('#workspaceTaskPriority').addEventListener('change', event => {
    taskPriority = event.target.value;
    updatePool();
  });
  updatePool();
}

function taskEditor(task) {
  const priorities = ['高', '普通', '低'].map(label => [label, label]);
  modal(task ? '编辑任务' : '添加任务',
    field('任务名称', 'title', task?.title, 'text', true) + area('上下文备注', 'description', task?.description) +
    field('分类', 'collection', task?.collection) + selectField('优先级', 'priority', priorities, task?.priority || '普通') +
    field('预计分钟数', 'estimate', task?.estimate, 'number') + field('截止日期', 'deadline', task?.deadline, 'date') +
    area('子任务（每行一项）', 'subtasks', task?.subtasks?.join('\n')), form => {
      const title = form.get('title').trim();
      const estimate = Number(form.get('estimate'));
      if (!title || estimate < 0) return toast('请填写任务名称并输入有效时长');
      const values = {
        title, description: form.get('description'), priority: form.get('priority'), collection: form.get('collection'),
        estimate, deadline: form.get('deadline'),
        subtasks: form.get('subtasks').split(/\r?\n/).map(value => value.trim()).filter(Boolean),
      };
      if (task) Object.assign(task, values, { done: Math.min(task.done || 0, values.subtasks.length) });
      else db.tasks.unshift({ id: crypto.randomUUID(), status: 'ready', schedule: 'unscheduled', ...values });
      save(); close(); renderHome(); toast(task ? '任务已更新' : '任务已加入未安排任务池');
    });
}

function planEditor(task, plan, suggestedTime = '09:00') {
  modal(plan ? '调整计划' : '安排任务', `<p>${esc(task.title)}</p>` +
    field('日期', 'date', plan?.startAt.slice(0, 10) || calendarDate, 'date', true) +
    field('开始时间', 'start', plan ? handleTime(plan.startAt) : suggestedTime, 'time', true) +
    field('时长（分钟）', 'minutes', plan ? Math.round((new Date(plan.endAt) - new Date(plan.startAt)) / 60000) : task.estimate || 30, 'number', true) +
    (plan ? selectField('计划结果', 'status', [['planned', '已安排'], ['completed', '已完成'], ['cancelled', '已取消']], plan.status) :
      '<label><input type="checkbox" name="next"> 保存后继续安排下一项</label>'), form => {
      const minutes = Number(form.get('minutes'));
      if (!Number.isInteger(minutes) || minutes <= 0) return toast('时长请输入大于零的分钟数');
      const startAt = `${form.get('date')}T${form.get('start')}`;
      const end = new Date(new Date(startAt).getTime() + minutes * 60000);
      if (!Number.isFinite(end.getTime())) return toast('请选择有效的日期、时间和时长');
      const endAt = `${dateKey(end)}T${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      const values = { taskId: task.id, startAt, endAt, status: form.get('status') || 'planned' };
      if (plan) Object.assign(plan, values);
      else db.plans.push({ id: crypto.randomUUID(), ...values });
      task.schedule = activePlans().some(entry => entry.taskId === task.id) ? 'planned' : 'unscheduled';
      calendarDate = form.get('date');
      save(); close(); show('home'); toast('时间安排已保存');
      if (form.has('next')) chooseNextTask(task.id, endAt);
    });
}

function chooseNextTask(taskId, start) {
  const available = db.tasks.filter(task => task.id !== taskId && !['completed', 'archived', 'cancelled'].includes(task.status)
    && !activePlans().some(plan => plan.taskId === task.id && (plan.endAt || plan.startAt) >= start));
  if (!available.length) return toast('没有可继续安排的任务');
  calendarDate = start.slice(0, 10);
  modal('继续安排下一项', selectField('选择任务', 'task', available.map(task => [task.id, task.title])), form => {
    const task = available.find(task => task.id === form.get('task'));
    if (task) planEditor(task, null, handleTime(start));
  });
}

function searchWorkspace() {
  modal('搜索工作台', '<div class="field"><label>关键词<input type="search" id="workspaceGlobalQuery" placeholder="任务、候选事项或目标"></label></div><div class="workspace-list" id="workspaceSearchResults"></div>',
    () => document.querySelector('#workspaceSearchResults button')?.click());
  const query = document.querySelector('#workspaceGlobalQuery');
  const results = document.querySelector('#workspaceSearchResults');
  query.addEventListener('input', () => {
    const value = query.value.trim().toLowerCase();
    if (!value) { results.innerHTML = ''; return; }
    const searchable = [[db.tasks, '执行库', 'execution'], [db.candidates, '候选事项', 'candidate'], [db.goals, '规划', 'planning']];
    results.innerHTML = searchable.flatMap(([records, label, route]) => records
      .filter(record => record.title.toLowerCase().includes(value))
      .map(record => item(record.title, label, action('查看', 'search-open', `${route}/${record.id}`))))
      .slice(0, 12).join('') || '<div class="empty">没有匹配的事项</div>';
  });
  query.focus();
}

function openSearchResult(value) {
  const [route, id] = value.split('/');
  close();
  if (route === 'planning') {
    selectedGoal = id;
    selectedDirection = 'all';
    goalFilter = db.goals.find(goal => goal.id === id)?.status === 'archived' ? 'archived' : 'all';
  } else {
    pendingSelection = { route, id };
  }
  navigate(route);
  if (pendingSelection && frame.contentWindow.selectWorkspaceItem?.(route, id)) pendingSelection = null;
}

function eventEditor(event, candidate) {
  modal(event ? '编辑日历事件' : '新建日历事件', field('事件名称', 'title', event?.title || candidate?.title, 'text', true) +
    field('日期', 'date', event?.date || calendarDate, 'date', true) +
    field('开始时间', 'start', event?.start || '09:00', 'time', true) +
    field('结束时间（可稍后补录）', 'end', event?.end, 'time') + area('备注', 'description', event?.description || candidate?.description), form => {
    const title = form.get('title').trim();
    const end = form.get('end');
    if (!title || (end && end <= form.get('start'))) return toast('请填写事件名称，结束时间需晚于开始时间');
    const values = { title, date: form.get('date'), start: form.get('start'), end, description: form.get('description') };
    if (event) Object.assign(event, values);
    else db.events.push({ id: crypto.randomUUID(), sourceCandidateId: candidate?.id, ...values });
    if (candidate) completeCandidate(db.candidates.find(entry => entry.id === candidate.id));
    calendarDate = values.date;
    save(); close(); navigate('home'); toast('日历事件已保存');
  });
}

function capture(resource = false) {
  modal(resource ? '收藏资料' : '快速捕捉',
    field('名称', 'title', '', 'text', true) +
    (resource ? '' : selectField('分类', 'category', Object.entries(categories), 'Memo')) +
    field('链接或文件路径', 'uri') + field('标签（以逗号分隔）', 'tags') + area('上下文备注', 'description'), form => {
      const title = form.get('title').trim();
      if (!title) return toast('请填写名称');
      db.candidates.unshift({ id: crypto.randomUUID(), title, category: resource ? 'Resource' : form.get('category'),
        uri: form.get('uri'), description: form.get('description'), status: 'new', updated: Date.now(), notes: [],
        tags: form.get('tags').split(/[,，]/).map(tag => tag.trim()).filter(Boolean) });
      save(); close(); toast('已保存到候选事项');
      if (page === 'candidate' || page === 'execution') frame.contentWindow.reloadWorkspaceExecution?.();
    });
}

function completeCandidate(candidate) {
  if (!candidate) return;
  candidate.converted = true;
  candidate.status = 'converted';
  candidate.updated = Date.now();
}

function convertCandidateRecord(id, type, title) {
  const candidate = db.candidates.find(item => item.id === id);
  if (!candidate || candidate.converted || candidate.status === 'converted') return toast('此候选事项已转换或不存在');
  const values = { id: crypto.randomUUID(), title, description: candidate.description, sourceCandidate: candidate.id, createdAt: dateKey(new Date()) };
  if (type === 'event') {
    eventEditor(null, { ...candidate, title });
    return;
  }
  if (type === 'goal') {
    db.goals.unshift({ ...values, status: 'draft', directionId: null, metricType: 'custom', manual: 0, unit: '%' });
    selectedGoal = values.id;
    goalFilter = 'all';
    selectedDirection = 'all';
  } else if (type === 'direction') {
    db.directions.unshift({ ...values, status: 'active' });
  } else {
    return;
  }
  completeCandidate(candidate);
  save(); navigate('planning'); toast('转换完成，已保留来源');
}

function focusEditor(task) {
  if (focus) return;
  focus = { taskId: task.id, startedAt: new Date().toISOString() };
  modal('任务专注', `<b>${esc(task.title)}</b><output class="workspace-clock" id="workspaceClock">00:00</output>` +
    area('专注记录', 'notes') + '<div class="help">保存后记入实际投入，可在复盘中心查看。</div>', form => {
      const endedAt = new Date().toISOString();
      const seconds = Math.max(1, Math.round((new Date(endedAt) - new Date(focus.startedAt)) / 1000));
      db.sessions.unshift({ ...focus, id: crypto.randomUUID(), title: task.title, endedAt, seconds,
        date: dateKey(new Date(focus.startedAt)), notes: form.get('notes') });
      save(); close(); toast('专注记录已保存');
    });
  document.querySelector('#modalForm button[type=submit]').textContent = '结束并记录';
}

setInterval(() => {
  if (!focus) return;
  const dialog = document.querySelector('#modal');
  if (!dialog.classList.contains('show') || !dialog.querySelector('#workspaceClock')) {
    focus = null;
    document.querySelector('#modalForm button[type=submit]').textContent = '保存';
    return;
  }
  const seconds = Math.floor((Date.now() - new Date(focus.startedAt)) / 1000);
  dialog.querySelector('#workspaceClock').value = [Math.floor(seconds / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
}, 500);

function habitEditor() {
  modal('新建习惯', field('习惯名称', 'title', '', 'text', true) +
    selectField('重复规则', 'repeat', ['每天', '每周一三五', '每周工作日', '每周末'].map(value => [value, value]), '每天') +
    field('目标量词（例如 20 页）', 'quantity') + area('说明', 'desc'), form => {
      const title = form.get('title').trim();
      if (!title) return toast('请填写习惯名称');
      db.habits.unshift({ id: crypto.randomUUID(), title, kind: 'habit', repeat: form.get('repeat'),
        quantity: form.get('quantity'), desc: form.get('desc'), today: '待执行', status: 'active', tags: [], occurrences: [], updated: Date.now() });
      db.habitsInitialized = true;
      save(); close(); toast('习惯已加入执行库');
    });
}

function reviewStats(bounds) {
  const activity = dateWindow(db.activity, bounds, entry => entry.date);
  const plans = dateWindow(db.plans, bounds, plan => plan.startAt.slice(0, 10));
  const sessions = dateWindow(db.sessions, bounds, session => session.date);
  const timedPlans = plans.filter(plan => plan.status !== 'cancelled' && plan.startAt.includes('T') && plan.endAt?.includes('T'));
  const planMinutes = timedPlans
    .reduce((total, plan) => total + Math.max(0, (new Date(plan.endAt) - new Date(plan.startAt)) / 60000 || 0), 0);
  const habits = db.habits.flatMap(habit => (habit.occurrences || []).map(date => ({ date, title: habit.title })));
  return {
    activity, plans, sessions, planMinutes: timedPlans.length ? Math.round(planMinutes) : '暂无记录',
    habitRecords: dateWindow(habits, bounds, record => record.date),
    actualMinutes: Math.round(sessions.reduce((total, entry) => total + entry.seconds, 0) / 60),
    tasksDone: new Set(activity.filter(entry => entry.type === 'tasks' && entry.completed).map(entry => entry.ref)).size,
  };
}

function renderReview() {
  const bounds = period(reviewDate, reviewType);
  const [start, end] = bounds;
  const key = `${reviewType}:${start}:${end}`;
  const review = db.reviews.find(entry => entry.id === key);
  const stats = reviewStats(bounds);
  const range = start === end ? start : bounds.join(' 至 ');
  workspace.innerHTML = heading('复盘中心', '查看周期记录，留下判断和下一步行动。') +
    `<div class="workspace-tabs" aria-label="复盘视图">${Object.entries(reviewTabs)
      .map(([id, label]) => tab(label, 'review-tab', id, reviewTab)).join('')}</div>`;
  if (reviewTab === 'history') {
    workspace.innerHTML += `<section class="panel workspace-panel"><h2>历史复盘</h2><div class="workspace-list">${db.reviews.slice()
      .sort((a, b) => b.start.localeCompare(a.start)).map(entry => item(`${entry.start} 至 ${entry.end}`,
        `${entry.status === 'complete' ? '已完成' : '草稿'} · 更新于 ${entry.updated}`, action('查看与编辑', 'review-open', entry.id))).join('')
      || '<div class="empty">暂无历史复盘，保存草稿后可在此继续。</div>'}</div></section>`;
    return;
  }
  if (reviewTab === 'actions') {
    workspace.innerHTML += `<section class="panel workspace-panel"><div class="workspace-actions"><h2>改进事项</h2>${action('添加改进', 'improvement-new')}</div>
      <div class="workspace-list">${db.improvements.map(entry => item(entry.title,
        [entry.done ? '已完成' : '待行动', entry.source].filter(Boolean).join(' · '),
        action(entry.done ? '重新打开' : '标记完成', 'improvement-toggle', entry.id) +
        action('删除', 'improvement-delete', entry.id))).join('') || '<div class="empty">暂无改进事项</div>'}</div></section>`;
    return;
  }
  const controls = `<div class="workspace-actions">
    <label>周期类型 <select id="workspaceReviewType">${Object.entries({ day: '每日', week: '每周', month: '每月', custom: '自定义' })
      .map(([id, label]) => `<option value="${id}" ${id === reviewType ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    ${reviewType === 'custom'
      ? `<label>起始日期 <input type="date" id="workspaceReviewStart" value="${reviewDate}"></label><label>结束日期 <input type="date" id="workspaceReviewEnd" min="${reviewDate}" value="${end}"></label>`
      : action('上一周期', 'review-shift', '-1') + action('下一周期', 'review-shift', '1')}
    <strong>${range}</strong></div>`;
  workspace.innerHTML += `<section class="panel workspace-panel">${controls}
    ${kpis([['已完成任务', stats.tasksDone], ['计划分钟', stats.planMinutes],
      ['实际投入分钟', stats.sessions.length ? stats.actualMinutes : '暂无记录'], ['习惯执行记录', stats.habitRecords.length]])}
    <p class="workspace-muted">只有记录了起止时间的计划计入计划分钟。实际投入来自已保存的专注记录。</p></section>`;
  document.querySelector('#workspaceReviewType').addEventListener('change', event => {
    reviewType = event.target.value;
    customReviewEnd = reviewDate;
    renderReview();
  });
  document.querySelector('#workspaceReviewStart')?.addEventListener('change', event => {
    if (event.target.value) reviewDate = event.target.value;
    renderReview();
  });
  document.querySelector('#workspaceReviewEnd')?.addEventListener('change', event => {
    if (event.target.value) customReviewEnd = event.target.value;
    renderReview();
  });
  if (reviewTab === 'analysis') {
    const dates = [...new Set([...stats.activity.map(entry => entry.date), ...stats.plans.map(plan => plan.startAt.slice(0, 10))])].sort();
    workspace.insertAdjacentHTML('beforeend', `<section class="panel workspace-panel"><h2>每日计划和任务完成</h2><div class="workspace-list">${dates
      .map(day => item(day, `${stats.plans.filter(plan => plan.startAt.startsWith(day)).length} 项计划 · ${stats.activity.filter(entry => entry.date === day && entry.type === 'tasks' && entry.completed).length} 次任务完成`)).join('') || '<div class="empty">暂无每日记录</div>'}</div></section>
      <section class="panel workspace-panel"><h2>计划结果</h2><p>已完成 ${stats.plans.filter(plan => plan.status === 'completed').length} · 已取消 ${stats.plans.filter(plan => plan.status === 'cancelled').length} · 已安排 ${stats.plans.filter(plan => plan.status === 'planned').length}</p>
      <h2>实际时间记录</h2><div class="workspace-list">${stats.sessions.map(session => item(session.title,
        `${session.date} · 计时 ${session.seconds} 秒${session.notes ? ' · ' + session.notes : ''}`)).join('') || '<div class="empty">暂无专注记录</div>'}</div></section>
      <section class="panel workspace-panel"><h2>习惯记录与业务变更</h2><div class="workspace-list">${stats.habitRecords.map(entry => item(entry.title, `${entry.date} · 已记录`)).join('')}
        ${stats.activity.map(entry => item(entry.title, `${entry.date} · ${entry.change}${tracked[entry.type]}`)).join('') || '<div class="empty">暂无业务变更记录</div>'}</div></section>`);
    return;
  }
  const currentGoals = db.goals.filter(goal => goal.status === 'active');
  workspace.insertAdjacentHTML('beforeend', `<div class="workspace-review-grid" style="margin-top:12px">
    ${[['任务和计划', `${stats.tasksDone} 项任务完成 · ${stats.plans.length} 项计划`],
      ['时间投入', stats.sessions.length ? `${stats.sessions.length} 次专注记录` : '暂无实际记录'],
      ['习惯记录', `${stats.habitRecords.length} 笔执行记录`],
      ['目标当前状态', currentGoals.map(goal => `${goal.title} ${progress(goal)}%`).join('；') || '暂无进行中目标']]
      .map(([label, value]) => `<div class="workspace-kpi"><strong>${label}</strong><small>${esc(value)}</small></div>`).join('')}</div>
    <form class="panel workspace-panel" id="workspaceReviewForm"><h2>本次复盘 · ${review?.status === 'complete' ? '已完成' : review ? '草稿' : '未开始'}</h2>
    ${reviewFields.map((label, index) => `<label>${label}<textarea name="answer${index}">${esc(review?.answers[index])}</textarea></label>`).join('')}
    <label><input type="checkbox" name="followup" ${review?.trackFollowup ? 'checked' : ''}> 完成时把下一周期行动加入改进追踪</label>
    <div class="workspace-actions"><button class="btn" type="submit" value="draft">保存草稿</button>
    <button class="btn primary" type="submit" value="complete">完成本次复盘</button></div></form>`);
  document.querySelector('#workspaceReviewForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const status = event.submitter.value;
    const answers = reviewFields.map((_, index) => form.get(`answer${index}`).trim());
    if (!answers.some(Boolean)) return toast('请至少填写一项复盘内容');
    const values = { id: key, start, end, type: reviewType, status, answers, updated: dateKey(new Date()),
      improvementId: review?.improvementId, trackFollowup: form.has('followup') };
    if (status === 'complete' && values.trackFollowup && answers[4]) {
      let improvement = db.improvements.find(entry => entry.id === values.improvementId);
      if (!improvement) {
        improvement = { id: crypto.randomUUID(), source: range, done: false };
        db.improvements.unshift(improvement);
      }
      improvement.title = answers[4];
      values.improvementId = improvement.id;
    }
    if (review) Object.assign(review, values);
    else db.reviews.unshift(values);
    save(); renderReview(); toast(status === 'complete' ? '复盘已完成' : '草稿已保存');
  });
}

function refreshTrash() {
  trashPage();
  document.querySelector('#otherTrash').innerHTML = `<section class="panel workspace-panel"><h2>已删除的任务、习惯和候选事项</h2>
    <div class="workspace-list">${db.otherTrash.map(entry => item(entry.record.title,
      `${kinds[entry.type]} · 删除于 ${entry.date}`, action('恢复', 'trash-restore', entry.id) +
      action('永久删除', 'trash-purge', entry.id))).join('') || '<div class="empty">暂无其他回收项目</div>'}</div></section>`;
}

function renderSettings() {
  workspace.innerHTML = heading('设置', '管理此浏览器里的 RINGS 原型数据和使用偏好。') +
    `<section class="panel workspace-panel"><h2>工作台偏好</h2>
      <label>默认调度视图 <select id="settingsCalendar">${Object.entries({ day: '今日', week: '本周', month: '本月', year: '年度' })
      .map(([id, name]) => `<option value="${id}" ${id === (settings.calendarView || 'day') ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
      <label><input type="checkbox" id="settingsShortcut" ${settings.captureShortcut !== false ? 'checked' : ''}> 启用 Ctrl+Shift+I 快速捕捉</label>
      <label><input type="checkbox" id="settingsReminders" ${settings.reminders ? 'checked' : ''}> 打开调度首页时提示到期候选事项</label>
    </section><section class="panel workspace-panel"><h2>数据与备份</h2>
      <p class="workspace-muted">导出当前原型记录和设置。外部文件只保留引用路径。</p>
      ${action('导出 JSON', 'export-data')}</section>
    <section class="panel workspace-panel"><h2>当前数据</h2>
      ${kpis([['任务', db.tasks.length], ['候选事项', db.candidates.length], ['目标', db.goals.length], ['复盘', db.reviews.length]])}</section>`;
  for (const [id, name, property] of [['settingsCalendar', 'calendarView', 'value'],
    ['settingsShortcut', 'captureShortcut', 'checked'], ['settingsReminders', 'reminders', 'checked']]) {
    document.querySelector(`#${id}`).addEventListener('change', event => {
      settings[name] = event.target[property];
      if (name === 'calendarView') calendarView = settings.calendarView;
      save(); toast('偏好已保存');
    });
  }
}

function exportData() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `RINGS-${dateKey(new Date())}.json` });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function executionSeed(exampleHabits, exampleCandidates) {
  if (!db.habitsInitialized) {
    db.habits = exampleHabits.map(habit => ({ ...habit, today: '待执行', history: '暂无记录', occurrences: [] }));
    db.habitsInitialized = true;
  }
  if (!db.candidatesInitialized) {
    db.candidates.push(...exampleCandidates.map(candidate => ({
      ...candidate, id: `sample-${candidate.id}`, description: candidate.desc, converted: candidate.status === 'converted',
    })));
    db.candidatesInitialized = true;
  }
  baseline = records();
  save();
}

function readExecution() {
  const today = dateKey(new Date());
  return structuredClone({
    tasks: db.tasks.map(task => ({
      kind: 'task', priority: '普通', estimate: 0, collection: '未分类', done: 0, tags: [], updated: 0, ...task,
      status: task.status === 'ready' ? (task.schedule === 'planned' ? 'planned' : 'unscheduled') : task.status,
      desc: task.description,
      planCount: activePlans().filter(plan => plan.taskId === task.id).length,
      sessionCount: db.sessions.filter(session => session.taskId === task.id).length,
    })),
    habits: db.habits.map(habit => ({
      ...habit, today: habit.occurrences?.includes(today) ? '已完成' : habit.status === 'paused' ? '未安排' : '待执行',
      history: habit.occurrences?.at(-1) || '暂无记录',
    })),
    candidates: db.candidates.map(candidate => ({
      category: 'Idea', tags: [], notes: [], updated: 0, ...candidate,
      status: candidate.converted ? 'converted' : candidate.status, desc: candidate.description,
    })),
  });
}

function writeExecution(state) {
  const today = dateKey(new Date());
  const old = readExecution();
  const merge = (key, convert) => {
    const view = new Map(old[key].map(item => [item.id, JSON.stringify(item)]));
    const stored = new Map(db[key].map(item => [item.id, item]));
    db[key] = state[key].map(item => view.get(item.id) === JSON.stringify(item) ? stored.get(item.id) : convert(item));
  };
  merge('tasks', ({ kind, desc, planCount, sessionCount, ...task }) => ({
      ...task, description: desc, status: ['unscheduled', 'planned'].includes(task.status) ? 'ready' : task.status,
      schedule: activePlans().some(plan => plan.taskId === task.id) ? 'planned' : 'unscheduled',
      goalId: task.goalId ?? null, stageId: task.stageId ?? null,
    }));
  merge('candidates', ({ desc, ...candidate }) => ({
    ...candidate, description: desc, converted: candidate.status === 'converted',
  }));
  merge('habits', ({ today: status, history, ...habit }) => {
    const occurrences = (habit.occurrences || []).filter(day => day !== today);
    if (status === '已完成') occurrences.push(today);
    return { ...habit, occurrences };
  });
  save();
}

function removeExecution(type, id) {
  if (!Object.hasOwn(kinds, type)) return;
  const record = db[type].find(item => item.id === id);
  if (!record) return;
  db.otherTrash.unshift({ id: crypto.randomUUID(), type, record, date: dateKey(new Date()) });
  db[type] = db[type].filter(item => item.id !== id);
  save();
}

function restoreOrPurge(id, purge) {
  const entry = db.otherTrash.find(item => item.id === id);
  if (!entry) return;
  const apply = () => {
    if (!purge) {
      const record = entry.record;
      if (entry.type === 'tasks' && !db.goals.some(goal => goal.id === record.goalId)) {
        record.goalId = null;
        record.stageId = null;
      }
      db[entry.type].unshift(record);
    } else if (entry.type === 'tasks') {
      db.plans = db.plans.filter(plan => plan.taskId !== entry.record.id);
    }
    db.otherTrash = db.otherTrash.filter(item => item.id !== id);
    save(); refreshTrash(); toast(purge ? '已永久删除' : '已恢复');
  };
  if (purge) confirmAction('永久删除', `永久删除「${esc(entry.record.title)}」，确定继续吗？`, apply);
  else apply();
}

const commands = {
  capture: () => capture(),
  'open-candidates': () => navigate('candidate'),
  'search-open': openSearchResult,
  'capture-resource': () => capture(true),
  'new-goal': () => { navigate('planning'); goalForm(); },
  'new-habit': habitEditor,
  'task-new': () => taskEditor(),
  'task-edit': id => taskEditor(db.tasks.find(task => task.id === id)),
  'plan-new': id => planEditor(db.tasks.find(task => task.id === id)),
  'plan-edit': id => {
    const plan = db.plans.find(plan => plan.id === id);
    if (plan) planEditor(db.tasks.find(task => task.id === plan.taskId), plan);
  },
  'event-new': () => eventEditor(),
  'event-edit': id => eventEditor(db.events.find(event => event.id === id)),
  'focus-start': id => focusEditor(db.tasks.find(task => task.id === id)),
  'calendar-view': value => { calendarView = value; renderHome(); },
  'calendar-today': () => { calendarDate = dateKey(new Date()); renderHome(); },
  'calendar-shift': value => { calendarDate = movePeriod(calendarDate, calendarView, Number(value)); renderHome(); },
  'calendar-day': day => { calendarDate = day; calendarView = 'day'; renderHome(); },
  'calendar-month': day => { calendarDate = day; calendarView = 'month'; renderHome(); },
  'calendar-focus': () => { calendarFocus = !calendarFocus; renderHome(); },
  'review-tab': value => { reviewTab = value; renderReview(); },
  'review-shift': value => { reviewDate = movePeriod(reviewDate, reviewType, Number(value)); renderReview(); },
  'review-open': id => {
    const review = db.reviews.find(entry => entry.id === id);
    if (!review) return;
    reviewType = review.type;
    reviewDate = review.start;
    customReviewEnd = review.end;
    reviewTab = 'cycle';
    renderReview();
  },
  'improvement-new': () => modal('添加改进事项', field('事项', 'title', '', 'text', true), form => {
    const title = form.get('title').trim();
    if (!title) return toast('请填写改进事项');
    db.improvements.unshift({ id: crypto.randomUUID(), title, done: false });
    save(); close(); renderReview();
  }),
  'improvement-toggle': id => {
    const entry = db.improvements.find(entry => entry.id === id);
    entry.done = !entry.done;
    save(); renderReview();
  },
  'improvement-delete': id => confirmAction('删除改进事项', '此事项将从改进追踪列表移除。', () => {
    db.improvements = db.improvements.filter(entry => entry.id !== id);
    save(); renderReview();
  }),
  'trash-restore': id => restoreOrPurge(id, false),
  'trash-purge': id => restoreOrPurge(id, true),
  'export-data': exportData,
};

window.ringsWorkspace = {
  navigate, recordChanges, refreshTrash, executionSeed, readExecution, writeExecution,
  capture, removeExecution, convertCandidate: convertCandidateRecord, captureShortcut: () => settings.captureShortcut !== false,
  focusTask: commands['focus-start'],
  selectedItem(route) {
    if (pendingSelection?.route !== route) return;
    const { id } = pendingSelection;
    pendingSelection = null;
    return id;
  },
};

document.querySelector('#workspaceCapture').addEventListener('click', () => capture());
document.querySelector('#workspaceSearch').addEventListener('click', searchWorkspace);
document.addEventListener('click', event => {
  const navigation = event.target.closest('[data-nav]');
  if (navigation) {
    const destination = [...pages].find(([, label]) => label === navigation.dataset.nav)?.[0];
    navigate(destination);
  }
  const button = event.target.closest('[data-workspace]');
  if (button) commands[button.dataset.workspace]?.(button.dataset.value);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && page === 'home' && calendarFocus) commands['calendar-focus']();
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i' && settings.captureShortcut !== false) {
    event.preventDefault();
    capture();
  }
});
workspace.addEventListener('dragstart', event => {
  const task = event.target.closest('[data-task]');
  if (task) event.dataTransfer.setData('text/plain', task.dataset.task);
});
workspace.addEventListener('dragover', event => {
  if (event.target.closest('[data-slot]')) event.preventDefault();
});
workspace.addEventListener('drop', event => {
  const slot = event.target.closest('[data-slot]');
  if (!slot) return;
  event.preventDefault();
  const task = db.tasks.find(task => task.id === event.dataTransfer.getData('text/plain'));
  if (task) planEditor(task, null, slot.dataset.slot);
});
window.addEventListener('hashchange', () => {
  const target = location.hash.slice(1) || 'home';
  if (target !== page) show(target);
});
show(location.hash.slice(1));
