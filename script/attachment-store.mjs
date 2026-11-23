import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, rename, stat, unlink } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';

const route = '/api/attachments/';
const dataDirectory = fileURLToPath(new URL('../data/', import.meta.url));
// 原名最长按 240 字节控制，给同名冲突时追加 "-2" 等后缀留出余量（多数文件系统上限 255 字节）。
const maxNameBytes = 240;
// Windows 保留设备名：即使带扩展名（CON.txt）也会被系统占用，必须拒绝。
const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;

export function attachmentDirectory() {
  return resolve(process.env.RINGS_DATA_DIR || dataDirectory, 'attachments');
}

function reply(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

function authorized(request, response) {
  const address = `127.0.0.1:${request.socket.localPort}`;
  if (request.headers.host !== address || request.headers['x-rings-workspace'] !== '1' ||
    (request.headers.origin && request.headers.origin !== `http://${address}`)) {
    reply(response, 403, { error: '只接受 RINGS 本机页面的同源请求' });
    return false;
  }
  return true;
}

/**
 * 校验附件 id 是否可安全用作磁盘文件名。
 *
 * 现在 id 直接使用上传时的原始文件名（可含中文、空格、扩展名），因此不能再用旧的
 * /^[\w-]{1,128}$/ 规则。改为显式拒绝各类危险字符：路径分隔符、控制字符、
 * Windows 保留字符与设备名、首尾空格/点，以及长度超限。旧版 UUID 命名同样合法，
 * 因此历史附件无需改动即可继续读取。
 */
export function validAttachmentName(id) {
  if (typeof id !== 'string' || id.length === 0 || id.length > 255) return false;
  if (id !== id.trim()) return false;                    // 首尾空格
  if (id.endsWith('.')) return false;                    // 结尾点（Windows 会自动去掉）
  if (/[\u0000-\u001f\u007f]/.test(id)) return false;    // 控制字符
  if (/[\\/]/.test(id)) return false;                    // 路径分隔符
  if (/[<>:"|?*]/.test(id)) return false;                // Windows 文件名保留字符
  if (id === '.' || id === '..' || id.includes('..')) return false;
  if (Buffer.byteLength(id, 'utf8') > maxNameBytes) return false;
  if (reservedNames.test(id)) return false;
  return true;
}

function parseId(pathname) {
  if (!pathname.startsWith(route)) return null;
  let id;
  try {
    id = decodeURIComponent(pathname.slice(route.length));
  } catch {
    return null;
  }
  return validAttachmentName(id) ? id : null;
}

/** 解析出磁盘路径，并再次确认没有逃出附件目录（纵深防御）。 */
function attachmentPath(directory, id) {
  const root = resolve(directory);
  const target = resolve(root, id);
  if (dirname(target) !== root) throw new Error('附件名称不合法');
  return target;
}

/**
 * 为同名附件分配可用文件名。同一工作台里两个不同文件可能都叫 download.png，
 * 直接覆盖会丢数据，这里依次尝试 download.png、download-2.png、download-3.png…
 * 返回最终实际使用的 id，供前端写入 material.attachmentId。
 */
function uniqueName(directory, id) {
  if (!existsSync(resolve(directory, id))) return id;
  const dot = id.lastIndexOf('.');
  // 仅当点不在首位且后面还有内容时才当作扩展名，形如 ".gitignore" 不会被拆坏。
  const stem = dot > 0 ? id.slice(0, dot) : id;
  const extension = dot > 0 ? id.slice(dot) : '';
  for (let index = 2; index < 10000; index += 1) {
    const candidate = `${stem}-${index}${extension}`;
    if (Buffer.byteLength(candidate, 'utf8') > 255) break;
    if (!existsSync(resolve(directory, candidate))) return candidate;
  }
  throw new Error('同名附件过多，无法分配文件名');
}

async function upload(request, response, directory, id) {
  await mkdir(directory, { recursive: true });
  let finalId;
  try {
    finalId = uniqueName(directory, id);
  } catch (error) {
    reply(response, 400, { error: error.message });
    return;
  }
  const target = attachmentPath(directory, finalId);
  const temporary = `${target}.${randomUUID()}.part`;
  try {
    await pipeline(request, createWriteStream(temporary));
    await rename(temporary, target);
    const { size } = await stat(target);
    // 返回实际落盘的 id：若发生重名改名，前端据此更新 attachmentId。
    reply(response, 200, { id: finalId, size });
  } catch (error) {
    await unlink(temporary).catch(() => {});
    if (!response.headersSent) reply(response, 500, { error: `附件保存失败：${error.message}` });
    else response.destroy();
  }
}

async function download(response, directory, id) {
  const target = attachmentPath(directory, id);
  let size;
  try {
    ({ size } = await stat(target));
  } catch {
    reply(response, 404, { error: '附件不存在' });
    return;
  }
  response.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': size,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  try {
    await pipeline(createReadStream(target), response);
  } catch {
    response.destroy();
  }
}

async function remove(response, directory, id) {
  try {
    await unlink(attachmentPath(directory, id));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      reply(response, 500, { error: `附件删除失败：${error.message}` });
      return;
    }
  }
  reply(response, 200, { id, deleted: true });
}

export function attachmentHandler(directory = attachmentDirectory()) {
  return async (request, response, next) => {
    const pathname = request.url.split('?')[0];
    const id = parseId(pathname);
    if (!id) return next();
    if (!authorized(request, response)) return;
    try {
      if (request.method === 'PUT') return await upload(request, response, directory, id);
      if (request.method === 'GET') return await download(response, directory, id);
      if (request.method === 'DELETE') return await remove(response, directory, id);
      reply(response, 405, { error: '请求方式不受支持' });
    } catch (error) {
      if (!response.headersSent) reply(response, 500, { error: `附件操作失败：${error.message}` });
      else response.destroy();
    }
  };
}
