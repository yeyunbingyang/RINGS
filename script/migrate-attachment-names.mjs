/**
 * 一次性迁移脚本：把历史附件的磁盘文件名从 UUID 改回上传时的原始文件名，
 * 并同步更新 rings.sqlite 中工作台 JSON 里的 attachmentId 引用。
 *
 * 背景：早期版本用 crypto.randomUUID() 作为附件 id 和磁盘文件名，用户去
 * data/attachments/ 目录时只能看到一串 UUID。现在上传逻辑已改为直接使用
 * 原始文件名，本脚本用于把已有的历史附件一并"改回原件名"。
 *
 * 安全设计：
 *   1. 执行前必须先备份 data/ 目录（本脚本不负责备份，请人工确认）。
 *   2. 全程校验：原名合法性复用服务端 validAttachmentName，目标文件必须存在，
 *      目标名不得互相冲突，也不得与目录中已有文件冲突。
 *   3. 先改文件名再改数据库；数据库写入失败时自动把所有文件名回滚为 UUID。
 *   4. 支持 --dry-run，只检查并打印计划，不做任何改动。
 *
 * 用法：node script/migrate-attachment-names.mjs [--dry-run]
 */

import { existsSync, readFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { validAttachmentName } from './attachment-store.mjs';

const dryRun = process.argv.includes('--dry-run');
const dataDirectory = fileURLToPath(new URL('../data/', import.meta.url));
const attachmentsDirectory = resolve(dataDirectory, 'attachments');
const databasePath = resolve(dataDirectory, 'rings.sqlite');

/** 递归遍历 JSON，收集所有形如 { attachmentId, name, kind:'file' } 的 material。 */
function collectMaterials(node, path = '', out = []) {
  if (Array.isArray(node)) {
    node.forEach((value, index) => collectMaterials(value, `${path}/${index}`, out));
  } else if (node && typeof node === 'object') {
    if (typeof node.attachmentId === 'string' && typeof node.name === 'string' && node.kind === 'file') {
      out.push({ ...node, _path: path });
    }
    for (const [key, value] of Object.entries(node)) collectMaterials(value, `${path}/${key}`, out);
  }
  return out;
}

/** 按引用路径把 JSON 里指定 material 的 attachmentId 改成新值（原地修改）。 */
function setAttachmentId(root, path, newId) {
  const segments = path.split('/').filter(Boolean);
  let node = root;
  for (const segment of segments.slice(0, -1)) {
    node = Array.isArray(node) ? node[Number(segment)] : node[segment];
  }
  const last = segments.at(-1);
  node[Array.isArray(node) ? Number(last) : last].attachmentId = newId;
}

function fail(message) {
  console.error(`\n✗ 迁移中止：${message}\n`);
  process.exit(1);
}

function main() {
  console.log(`模式：${dryRun ? 'dry-run（只检查，不改动）' : '正式迁移'}`);
  if (!existsSync(databasePath)) fail(`数据库不存在：${databasePath}`);
  if (!existsSync(attachmentsDirectory)) fail(`附件目录不存在：${attachmentsDirectory}`);

  const database = new DatabaseSync(databasePath);
  database.exec('PRAGMA busy_timeout=5000');
  let row;
  try {
    row = database.prepare('SELECT revision, content FROM workspace WHERE id = 1').get();
  } catch (error) {
    database.close();
    fail(`读取工作台失败：${error.message}`);
  }
  if (!row) {
    database.close();
    fail('工作台为空，无需迁移');
  }

  const workspace = JSON.parse(row.content);
  const materials = collectMaterials(workspace);
  console.log(`工作台 revision=${row.revision}，发现 ${materials.length} 个文件附件引用\n`);

  // 逐项校验，生成迁移计划
  const plan = [];
  const targetNames = new Set();
  for (const material of materials) {
    const oldId = material.attachmentId;
    const newName = material.name;
    if (!validAttachmentName(newName)) fail(`原始文件名不合法，拒绝迁移：${JSON.stringify(newName)}`);
    if (targetNames.has(newName)) fail(`原始文件名重复，拒绝迁移：${newName}`);
    targetNames.add(newName);
    const source = resolve(attachmentsDirectory, oldId);
    const target = resolve(attachmentsDirectory, newName);
    if (!existsSync(source)) fail(`磁盘文件不存在：${oldId}（${newName}）`);
    if (source !== target && existsSync(target)) fail(`目标文件已存在，拒绝覆盖：${newName}`);
    plan.push({ oldId, newName, path: material._path, source, target });
  }
  console.log('迁移计划：');
  for (const item of plan) {
    console.log(`  ${item.oldId}  →  ${item.newName}`);
  }

  // 若所有 attachmentId 都已等于原名，说明已迁移过
  const pending = plan.filter(item => item.oldId !== item.newName);
  if (pending.length === 0) {
    console.log('\n所有附件已使用原始文件名，无需迁移。');
    database.close();
    return;
  }
  console.log(`\n待迁移 ${pending.length} 项。`);

  if (dryRun) {
    console.log('dry-run 结束，未做任何改动。');
    database.close();
    return;
  }

  // 1) 先重命名文件，记录已完成的以便回滚
  const renamed = [];
  try {
    for (const item of pending) {
      renameSync(item.source, item.target);
      renamed.push(item);
      console.log(`  已改名：${item.oldId} → ${item.newName}`);
    }
  } catch (error) {
    for (const item of renamed.reverse()) renameSync(item.target, item.source);
    database.close();
    fail(`文件重命名失败，已回滚：${error.message}`);
  }

  // 2) 更新 JSON 引用并写入数据库（事务）
  for (const item of pending) setAttachmentId(workspace, item.path, item.newName);
  const content = JSON.stringify(
    Object.fromEntries(Object.entries(workspace).map(([key, value]) => [key, value])),
  );
  try {
    database.exec('BEGIN IMMEDIATE');
    const update = database.prepare('UPDATE workspace SET revision = ?, content = ? WHERE id = 1');
    update.run(row.revision + 1, content);
    database.exec('COMMIT');
    // 把 WAL 中的改动 checkpoint 回主库，确保关闭后数据完整落盘
    database.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    console.log(`\n数据库已更新：revision ${row.revision} → ${row.revision + 1}`);
  } catch (error) {
    try { database.exec('ROLLBACK'); } catch {}
    for (const item of renamed.reverse()) renameSync(item.target, item.source);
    database.close();
    fail(`数据库写入失败，文件名已回滚：${error.message}`);
  }

  database.close();
  console.log('\n✓ 迁移完成。');
}

main();
