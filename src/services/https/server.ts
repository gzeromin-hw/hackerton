import { cookies, headers } from 'next/headers'

const GW_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? ''

async function cookieHeaderFromNext() {
  const all = (await cookies()).getAll()
  return all
    .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
    .join('; ')
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const pathWithGateway = `${GW_URL}${path.startsWith('/') ? '' : '/'}${path}`
  // 상대 경로인 경우 절대 URL로 변환
  let url = pathWithGateway
  if (pathWithGateway.startsWith('/')) {
    try {
      const headersList = await headers()
      const host =
        headersList.get('host') || headersList.get('x-forwarded-host')
      const protocol = headersList.get('x-forwarded-proto') || 'https'
      if (host) {
        url = `${protocol}://${host}${pathWithGateway}`
      }
    } catch {
      // headers()가 실패하면 상대 경로 그대로 사용 (Server Component 등에서 실행될 때)
      url = pathWithGateway
    }
  }
  const isForm = init.body instanceof FormData

  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      accept: '*/*',
      ...(isForm ? {} : { 'content-type': 'application/json' }),
      ...(init.headers as Record<string, string>),
      cookie: await cookieHeaderFromNext(), // ✅ 사용자의 쿠키를 Gateway로 포워딩
    },
  })

  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error(await res.text())
  }

  return res.json() as Promise<T>
}

export const httpServer = {
  get: <T>(p: string, init?: RequestInit) =>
    request<T>(p, { ...init, method: 'GET' }),
  post: <T>(p: string, body?: unknown, init?: RequestInit) =>
    request<T>(p, {
      ...init,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(p: string, body?: unknown, init?: RequestInit) =>
    request<T>(p, {
      ...init,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(p: string, body?: unknown, init?: RequestInit) =>
    request<T>(p, {
      ...init,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(p: string, init?: RequestInit) =>
    request<T>(p, { ...init, method: 'DELETE' }),
}
