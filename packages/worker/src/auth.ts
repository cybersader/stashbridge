import type { Env } from './types';

export function validateAuth(request: Request, env: Env): boolean {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return false;
  const token = header.slice(7);
  return token.length > 0 && token === env.STASHBRIDGE_TOKEN;
}
