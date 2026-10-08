import { usesMockApi } from '@/lib/env';
import { handleMockRequest } from '@/mocks/handlers';

/**
 * Mock backend. Enabled when API_MOCK=true or when no real NEXT_PUBLIC_API_URL is configured
 * (demo deploys); returns 404 as soon as a real backend URL is set.
 */
type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, { params }: Context) {
  if (process.env.API_MOCK !== 'true' && !usesMockApi) return new Response(null, { status: 404 });
  const { path } = await params;
  return handleMockRequest(request.method, `/${path.join('/')}`, request);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
