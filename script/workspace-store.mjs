import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const route = '/api/workspace';
const importRecoveryRoute = '/api/workspace/import-backup';
const limit = 32 * 1024 * 1024;
const keys = new Set([
  'rings-data-v171', 'rings-review-v17', 'rings-event-log-v171',
  'rings-nav-config-v08', 'rings-app-preferences-v10', 'rings-planning-v08', 'rings-review-note-v10',
]);
const collections = ['tasks', 'habits', 'candidates', 'goals', 'plans', 'trash', 'directions'];
const defaultPath = fileURLToPath(new URL('../data/', import.meta.url));

export function openWorkspaceStore(directory = process.env.RINGS_DATA_DIR || defaultPath) {
  mkdirSync(directory, { recursive: true });
  const database = new DatabaseSync(resolve(directory, 'rings.sqlite'));
  try {
    database.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL');
    database.exec('BEGIN IMMEDIATE');
    const { user_version: version } = database.prepare('PRAGMA user_version').get();
    if (version === 0) {
      database.exec(`
        CREATE TABLE workspace (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          revision INTEGER NOT NULL,
          content TEXT NOT NULL CHECK (json_valid(content))
        ) STRICT;
        CREATE TABLE import_backup (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          revision INTEGER NOT NULL,
          content TEXT NOT NULL CHECK (json_valid(content))
        ) STRICT;
        PRAGMA user_version=1;
      `);
    } else if (version !== 1) {
      throw new Error('此版本的 RINGS 无法读取当前数据库格式');
    }
    database.exec('COMMIT');
  } catch (error) {
    database.close();
    throw error;
  }
  const select = database.prepare('SELECT revision, content FROM workspace WHERE id = 1');
  const selectBackup = database.prepare('SELECT revision, content FROM import_backup WHERE id = 1');
  const update = database.prepare(`
    INSERT INTO workspace VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, content=excluded.content
  `);
  const backup = database.prepare(`
    INSERT INTO import_backup VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, content=excluded.content
  `);
  return {
    read() {
      const row = select.get();
      return { revision: row?.revision ?? 0, data: row ? JSON.parse(row.content) : null };
    },
    readImportBackup() {
      const row = selectBackup.get();
      return { revision: row?.revision ?? 0, data: row ? JSON.parse(row.content) : null };
    },
    write({ revision, data, replace }) {
      const content = JSON.stringify(Object.fromEntries([...keys].filter(key => Object.hasOwn(data, key)).map(key => [key, data[key]])));
      database.exec('BEGIN IMMEDIATE');
      try {
        const row = select.get();
        const current = row?.revision ?? 0;
        if (row?.content === content) {
          database.exec('COMMIT');
          return { revision: current };
        }
        if (revision !== current) {
          database.exec('ROLLBACK');
          return null;
        }
        if (replace && row) backup.run(current, row.content);
        update.run(current + 1, content);
        database.exec('COMMIT');
        return { revision: current + 1 };
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
    close: () => database.close(),
  };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validRequest({ revision, data, replace } = {}) {
  if (!Number.isSafeInteger(revision) || revision < 0 || (replace !== undefined && typeof replace !== 'boolean') ||
    !isRecord(data) || !Object.keys(data).every(key => keys.has(key))) return false;
  const core = data['rings-data-v171'];
  return isRecord(core) && collections.every((key, index) =>
    (index >= 5 && core[key] === undefined) || (Array.isArray(core[key]) &&
      core[key].every(record => isRecord(record) && typeof record.id === 'string' && /^[\w.-]{1,128}$/.test(record.id) &&
        !['__proto__', 'constructor', 'prototype'].includes(record.id))));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > limit) {
      request.resume();
      throw new RangeError('工作台超过 32 MB，无法保存。请先导出备份并移除不需要的大附件。');
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function workspaceHandler(store) {
  return async (request, response, next) => {
    const pathname = request.url.split('?')[0];
    if (pathname !== route && pathname !== importRecoveryRoute) return next();
    const reply = (status, body) => {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(body));
    };
    const address = `127.0.0.1:${request.socket.localPort}`;
    if (request.headers.host !== address || request.headers['x-rings-workspace'] !== '1' ||
      (request.headers.origin && request.headers.origin !== `http://${address}`)) {
      return reply(403, { error: '只接受 RINGS 本机页面的同源请求' });
    }
    let payload;
    if (request.method === 'PUT' && pathname === route) {
      if (request.headers['content-type']?.split(';')[0] !== 'application/json') return reply(415, { error: '需要 JSON 请求' });
      try {
        payload = await readJson(request);
      } catch (error) {
        return reply(error instanceof RangeError ? 413 : 400, { error: error instanceof RangeError ? error.message : 'JSON 格式无效' });
      }
      if (!isRecord(payload) || !validRequest(payload)) return reply(400, { error: '工作台数据格式无效' });
    } else if (request.method !== 'GET') {
      return reply(405, { error: '请求方式不受支持' });
    }
    try {
      if (request.method === 'GET') return reply(200, pathname === route ? store.read() : store.readImportBackup());
      const result = store.write(payload);
      return result ? reply(200, result) : reply(409, { error: '另一窗口已更新工作台。请导出当前副本，再重新载入。' });
    } catch (error) {
      console.error('[数据] 读写工作台失败', error.message);
      return reply(500, { error: '无法读写本机数据库，请检查数据目录后重试。' });
    }
  };
}
