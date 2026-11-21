import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { openWorkspaceStore, workspaceHandler } from './workspace-store.mjs';

const [host, portArgument] = process.argv.slice(2);
const port = Number(portArgument);
if (host !== '127.0.0.1' || !Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('RINGS 需要使用 127.0.0.1 和有效的监听端口。');
}

const origin = `http://${host}:${port}`;
const store = openWorkspaceStore();
const workspaceApi = workspaceHandler(store);
const prototype = readFileSync(new URL('../prototypes/workspace-recovery/index.html', import.meta.url), 'utf8');
const workspaceData = readFileSync(new URL('../prototypes/workspace-recovery/workspace-data.js', import.meta.url), 'utf8');
const workspaceStorage = readFileSync(new URL('../prototypes/workspace-recovery/workspace-storage.js', import.meta.url), 'utf8');
const gantt = readFileSync(new URL('../prototypes/workspace-recovery/gantt.html', import.meta.url), 'utf8');
const page = prototype.replace('</aside>', `
<div style="padding: 0 12px 12px">
  <button type="button" class="secondary-button" id="rings-stop-service">退出服务</button>
  <div role="status" id="rings-service-status"></div>
</div>
</aside>`).replace('</body>', `
<script>
  const stopButton = document.querySelector('#rings-stop-service');
  const serviceStatus = document.querySelector('#rings-service-status');
  stopButton.addEventListener('click', async () => {
    stopButton.disabled = true;
    try {
      await window.ringsStorage.flush();
      const response = await fetch('/shutdown', { method: 'POST' });
      if (!response.ok) throw new Error('退出失败');
      serviceStatus.textContent = '服务已退出，可以关闭此页面。';
    } catch (error) {
      serviceStatus.textContent = error.message || '退出失败，请重试。';
      stopButton.disabled = false;
    }
  });
</script>
</body>`);

function send(response, status, type, body) {
  response.writeHead(status, {
    'Content-Type': `${type}; charset=utf-8`,
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "frame-ancestors 'self' http://127.0.0.1:* tauri://localhost http://tauri.localhost https://tauri.localhost",
  });
  response.end(body);
}

const server = createServer((request, response) => {
  const start = performance.now();
  const pathname = request.url.split('?')[0];
  response.on('finish', () => {
    console.log(`[请求] ${new Date().toISOString()} ${request.method} ${pathname} → ${response.statusCode} · ${(performance.now() - start).toFixed(1)} ms`);
  });

  if (request.headers.host !== `${host}:${port}`) {
    send(response, 403, 'text/plain', '无效的访问地址');
  } else if (pathname === '/api/workspace' || pathname === '/api/workspace/import-backup') {
    void workspaceApi(request, response, () => {});
  } else if (request.method === 'GET' && pathname === '/') {
    send(response, 200, 'text/html', page);
  } else if (request.method === 'GET' && pathname === '/health') {
    send(response, 200, 'text/plain', 'OK');
  } else if (request.method === 'GET' && pathname === '/workspace-data.js') {
    send(response, 200, 'text/javascript', workspaceData);
  } else if (request.method === 'GET' && pathname === '/workspace-storage.js') {
    send(response, 200, 'text/javascript', workspaceStorage);
  } else if (request.method === 'GET' && pathname === '/gantt.html') {
    send(response, 200, 'text/html', gantt);
  } else if (request.method === 'POST' && pathname === '/shutdown') {
    if (request.headers.origin !== origin) {
      send(response, 403, 'text/plain', '无效的请求来源');
      return;
    }
    response.once('finish', () => {
      server.close();
      server.closeIdleConnections();
    });
    send(response, 200, 'text/plain', '服务已退出');
  } else {
    send(response, 404, 'text/plain', '页面不存在');
  }
});

server.once('close', () => store.close());
server.listen(port, host, () => console.log(`[服务] RINGS 已就绪，${origin}/`));
