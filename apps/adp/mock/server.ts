import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect } from 'vite';

import { mockRoutes } from './index.ts';

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf-8');

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function sendJson(res: ServerResponse, payload: unknown): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function createMockMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const route = mockRoutes.find(
      (item) => item.method === req.method && item.url === req.url?.split('?')[0],
    );

    if (!route) {
      next();
      return;
    }

    const body = await readBody(req);
    const payload = route.handler({ req, res, body });
    sendJson(res, payload);
  };
}
