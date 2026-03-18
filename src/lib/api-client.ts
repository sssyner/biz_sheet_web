import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bizsheetapi.vercel.app";

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  let token: string;
  try {
    token = await getToken();
  } catch (e) {
    throw new Error(`Token error: ${e instanceof Error ? e.message : e} | URL: ${url}`);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (e) {
    throw new Error(`Fetch failed: ${e instanceof Error ? e.message : e} | URL: ${url}`);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`${res.status}: ${error.detail || "API Error"} | URL: ${url}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
