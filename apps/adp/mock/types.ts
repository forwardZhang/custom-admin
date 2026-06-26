import type { IncomingMessage, ServerResponse } from 'node:http';

export interface MockContext {
  req: IncomingMessage;
  res: ServerResponse;
  body: Record<string, unknown>;
}

export interface MockRoute {
  method: 'GET' | 'POST';
  url: string;
  handler: (context: MockContext) => unknown;
}
