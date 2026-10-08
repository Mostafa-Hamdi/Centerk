import { handleMockRequest } from '@/mocks/handlers';

/** Dev-only mock backend. Disabled (404) unless API_MOCK=true. */
type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, { params }: Context) {
  if (process.env.API_MOCK !== 'true') return new Response(null, { status: 404 });
  const { path } = await params;
  return handleMockRequest(request.method, `/${path.join('/')}`, request);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
