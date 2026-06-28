export const BASE_URL = "http://localhost:8080/v1/api";

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Network response error: ${response.status}`);
  }
  if (response.status === 204) return {} as T;
  return response.json();
}
