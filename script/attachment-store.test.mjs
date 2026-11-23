import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { attachmentHandler, validAttachmentName } from './attachment-store.mjs';

function request(server, method, path, { body, headers = {} } = {}) {
  const address = server.address();
  return new Promise((resolve, reject) => {
    const req = httpRequest({
      host: '127.0.0.1', port: address.port, path, method,
      headers: { Host: `127.0.0.1:${address.port}`, 'X-Rings-Workspace': '1', ...headers },
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('附件不受大小限制，支持写入、读取和删除', async context => {
  const directory = await mkdtemp(join(tmpdir(), 'rings-attachments-'));
  const middleware = attachmentHandler(directory);
  const server = createServer((request, response) => {
    void middleware(request, response, () => {
      response.writeHead(404);
      response.end();
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  context.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });

  const payload = Buffer.alloc(12 * 1024 * 1024, 0x61);
  const uploaded = await request(server, 'PUT', '/api/attachments/large-file', {
    body: payload, headers: { 'Content-Type': 'application/octet-stream' },
  });
  assert.equal(uploaded.status, 200);
  assert.deepEqual(JSON.parse(uploaded.body.toString()), { id: 'large-file', size: payload.length });

  const downloaded = await request(server, 'GET', '/api/attachments/large-file');
  assert.equal(downloaded.status, 200);
  assert.deepEqual(downloaded.body, payload);

  const unauthorized = await new Promise((resolve, reject) => {
    const address = server.address();
    const req = httpRequest({
      host: '127.0.0.1', port: address.port, path: '/api/attachments/large-file', method: 'GET',
      headers: { Host: `127.0.0.1:${address.port}` },
    }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    req.on('error', reject);
    req.end();
  });
  assert.equal(unauthorized, 403);

  const deleted = await request(server, 'DELETE', '/api/attachments/large-file');
  assert.equal(deleted.status, 200);
  const missing = await request(server, 'GET', '/api/attachments/large-file');
  assert.equal(missing.status, 404);
});

test('附件名称校验：允许中文原名与旧 UUID，拒绝路径穿越与非法字符', () => {
  // 原始文件名（中文、空格、扩展名、点号）应被接受
  assert.equal(validAttachmentName('云计算运维.zip'), true);
  assert.equal(validAttachmentName('数据分析_精简注释与可视化图例版.zip'), true);
  assert.equal(validAttachmentName('全身正面角色图 8K.png'), true);
  assert.equal(validAttachmentName('report.v2.final.pdf'), true);
  assert.equal(validAttachmentName('.gitignore'), true);
  // 历史 UUID 附件必须继续可用
  assert.equal(validAttachmentName('282a6c2d-9443-407a-a7d2-25bb1148f86a'), true);
  // 危险输入全部拒绝
  assert.equal(validAttachmentName('../evil.txt'), false);
  assert.equal(validAttachmentName('a/b.txt'), false);
  assert.equal(validAttachmentName('a\\b.txt'), false);
  assert.equal(validAttachmentName('..'), false);
  assert.equal(validAttachmentName('CON.txt'), false);
  assert.equal(validAttachmentName('bad:name.txt'), false);
  assert.equal(validAttachmentName('bad?name.txt'), false);
  assert.equal(validAttachmentName('tail.'), false);
  assert.equal(validAttachmentName(' space.txt'), false);
  assert.equal(validAttachmentName(''), false);
});

test('中文原名上传后按原名保存，同名冲突自动加后缀且内容互不覆盖', async context => {
  const directory = await mkdtemp(join(tmpdir(), 'rings-attachments-'));
  const middleware = attachmentHandler(directory);
  const server = createServer((request, response) => {
    void middleware(request, response, () => {
      response.writeHead(404);
      response.end();
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  context.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });

  // 用 encodeURIComponent 模拟前端对中文文件名的编码
  const first = Buffer.from('first-content');
  const uploaded = await request(server, 'PUT', `/api/attachments/${encodeURIComponent('云计算运维.zip')}`, {
    body: first, headers: { 'Content-Type': 'application/zip' },
  });
  assert.equal(uploaded.status, 200);
  assert.deepEqual(JSON.parse(uploaded.body.toString()), { id: '云计算运维.zip', size: first.length });

  // 第二个同名文件应得到 -2 后缀，而不是覆盖第一个
  const second = Buffer.from('second-content-different-length');
  const duplicated = await request(server, 'PUT', `/api/attachments/${encodeURIComponent('云计算运维.zip')}`, {
    body: second, headers: { 'Content-Type': 'application/zip' },
  });
  assert.equal(duplicated.status, 200);
  assert.equal(JSON.parse(duplicated.body.toString()).id, '云计算运维-2.zip');

  const original = await request(server, 'GET', `/api/attachments/${encodeURIComponent('云计算运维.zip')}`);
  assert.equal(original.status, 200);
  assert.deepEqual(original.body, first, '原文件内容不应被同名上传覆盖');
  const renamed = await request(server, 'GET', `/api/attachments/${encodeURIComponent('云计算运维-2.zip')}`);
  assert.deepEqual(renamed.body, second);
});
