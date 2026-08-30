export default async (request: Request) => {
  const url = new URL(request.url);
  const targetUrl = `https://thldfqdcesaajigjgquv.supabase.co${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('host', 'thldfqdcesaajigjgquv.supabase.co');

  return fetch(targetUrl, {
    method: request.method,
    headers: headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
  });
};

export const config = { path: "/*" };
