import { AuthTokens } from './types';

export const API_BASE_URL = 'https://localhost:7240';


const TOKEN_KEY = 'connect_access_token';
const REFRESH_KEY = 'connect_refresh_token';
const USER_ID_KEY = 'connect_user_id';

export const tokenStorage = {
  save(tokens: AuthTokens, userID: number) {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(USER_ID_KEY, String(userID));
  },
  getAccess(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  getUserId(): number | null {
    const v = localStorage.getItem(USER_ID_KEY);
    return v ? Number(v) : null;
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_ID_KEY);
  },
};


export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly traceId: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  anonymous?: boolean;
  skipRefresh?: boolean;
}

async function attemptRefresh(): Promise<boolean> {
  const userID = tokenStorage.getUserId();
  const refreshToken = tokenStorage.getRefresh();
  if (!userID || !refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/Users/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID, refreshToken }),
    });
    if (!res.ok) return false;
    const data: AuthTokens = await res.json();
    tokenStorage.save(data, userID);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, anonymous = false, skipRefresh = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!anonymous) {
    const token = tokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  let response = await fetch(`${API_BASE_URL}${path}`, init);

  if (response.status === 401 && !skipRefresh && !anonymous) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      const newToken = tokenStorage.getAccess();
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    }
  }

  if (!response.ok) {
    let traceId: string | undefined;
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      traceId = err.traceId;
      message = err.title ?? err.message ?? message;
    } catch { /* non-JSON error body */ }
    throw new ApiError(response.status, traceId, message);
  }

  const text = await response.text();
  if (!text) return undefined as unknown as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
