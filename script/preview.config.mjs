import { fileURLToPath } from 'node:url';
import { openWorkspaceStore, workspaceHandler } from './workspace-store.mjs';
import { attachmentHandler } from './attachment-store.mjs';

export default {
  root: fileURLToPath(new URL('../prototypes/workspace-recovery/', import.meta.url)),
  server: { host: '127.0.0.1', port: 18761, strictPort: true },
  plugins: [{
    name: 'rings-workspace-preview',
    configureServer(server) {
      const store = openWorkspaceStore();
      server.middlewares.use(attachmentHandler());
      server.middlewares.use(workspaceHandler(store));
      server.httpServer?.once('close', () => store.close());
    },
    handleHotUpdate({ file, server }) {
      if (/\/workspace-(data|storage|scroll)\.js$/.test(file)) {
        server.ws.send({ type: 'full-reload', path: '*' });
        return [];
      }
    },
  }],
};
