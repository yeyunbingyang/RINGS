import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { openWorkspaceStore } from './workspace-store.mjs';

test('不同连接读取同一工作台，过期写入不会覆盖已保存记录', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'rings-store-'));
  let first;
  let second;
  try {
    first = openWorkspaceStore(directory);
    second = openWorkspaceStore(directory);
    const empty = { 'rings-data-v171': { tasks: [], plans: [], goals: [], habits: [], candidates: [] } };
    assert.deepEqual(first.read(), { revision: 0, data: null });
    assert.deepEqual(first.write({ revision: 0, data: empty }), { revision: 1 });
    const task = structuredClone(empty);
    task['rings-data-v171'].tasks.push({ id: 'task-1', title: '验证本机任务' });
    assert.deepEqual(second.write({ revision: 1, data: task }), { revision: 2 });
    assert.equal(first.write({ revision: 1, data: empty }), null);
    assert.deepEqual(first.write({ revision: 1, data: task }), { revision: 2 });
    assert.deepEqual(first.read().data, task);
    assert.deepEqual(first.write({ revision: 2, data: empty, replace: true }), { revision: 3 });
    first.close();
    first = undefined;
    second.close();
    second = undefined;
    first = openWorkspaceStore(directory);
    assert.deepEqual(first.read(), { revision: 3, data: empty });
    assert.deepEqual(first.readImportBackup(), { revision: 2, data: task });
  } finally {
    first?.close();
    second?.close();
    await rm(directory, { recursive: true, force: true });
  }
});
