const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://crm-api-1ugj.onrender.com').replace(/\/$/, '');

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData: any = {};
    const text = await response.text().catch(() => '');
    try {
      if (text) errorData = JSON.parse(text);
    } catch {
      // Not a JSON response, maybe an HTML error page
      errorData = { message: text || `API error: ${response.status}` };
    }
    
    const error = new Error(errorData.message || `API error: ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  if (response.status === 204) return {} as T;
  
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : ({} as T);
  } catch (err) {
    console.error('Failed to parse JSON response:', text);
    throw new Error('Invalid JSON response from server');
  }
}
