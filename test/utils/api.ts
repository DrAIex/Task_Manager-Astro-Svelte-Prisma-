import { vi } from 'vitest';

export function createRequest(body?: any, params = {}, searchParams = {}) {
  const url = new URL('http://localhost');

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  const request = {
    url: url.toString(),
    formData: vi.fn().mockResolvedValue(new FormData()),
    json: vi.fn().mockResolvedValue(body || {}),
    headers: new Headers(),
  };

  if (body instanceof FormData) {
    request.formData = vi.fn().mockResolvedValue(body);
  }
  
  return { request, params };
}

export async function parseAPIResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
} 