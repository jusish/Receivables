const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://127.0.0.1:4000/api/v1';

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const token = options.token || localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && !path.includes('/auth/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message || (Array.isArray(data.details) ? data.details.join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }

  return data as T;
}
