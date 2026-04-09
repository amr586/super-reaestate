const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(BASE_URL + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطأ غير متوقع');
  return data;
}

export const api = {
  // Auth
  login: (emailOrPhone: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ emailOrPhone, password }) }),
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  sendOTP: (data: { name: string; email: string; phone: string; password: string }) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifyOTP: (email: string, otp: string) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  me: () => request('/auth/me'),

  // Properties
  getProperties: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined).map(([k, v]) => [k, String(v)]));
    return request('/properties?' + q.toString());
  },
  getFeatured: () => request('/properties/featured'),
  getProperty: (id: number) => request(`/properties/${id}`),
  addProperty: (data: any) => request('/properties', { method: 'POST', body: JSON.stringify(data) }),
  saveProperty: (id: number) => request(`/properties/${id}/save`, { method: 'POST' }),
  unsaveProperty: (id: number) => request(`/properties/${id}/save`, { method: 'DELETE' }),
  getSaved: () => request('/properties/user/saved'),

  // Admin
  getStats: () => request('/admin/stats'),
  getAllProperties: () => request('/admin/properties'),
  getAdminProperty: (id: number) => request(`/admin/properties/${id}`),
  approveProperty: (id: number) => request(`/admin/properties/${id}/approve`, { method: 'PATCH' }),
  rejectProperty: (id: number) => request(`/admin/properties/${id}/reject`, { method: 'PATCH' }),
  markSold: (id: number, buyer_id?: number) => request(`/admin/properties/${id}/sold`, { method: 'PATCH', body: JSON.stringify({ buyer_id }) }),
  getUsers: () => request('/admin/users'),
  updateRole: (id: number, role: string, sub_role?: string) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role, sub_role }) }),
  toggleUser: (id: number) => request(`/admin/users/${id}/toggle`, { method: 'PATCH' }),
  getAnalytics: () => request('/admin/analytics'),
  getAdminPayments: () => request('/admin/payments'),
  approvePayment: (id: number) => request(`/admin/payments/${id}/approve`, { method: 'PATCH' }),

  // Payments
  requestPayment: (data: any) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  myPayments: () => request('/payments/my-payments'),

  // Support
  createTicket: (subject: string) => request('/support/tickets', { method: 'POST', body: JSON.stringify({ subject }) }),
  getTickets: () => request('/support/tickets'),
  getTicketMessages: (id: number) => request(`/support/tickets/${id}/messages`),
  sendTicketMessage: (id: number, content: string) => request(`/support/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  closeTicket: (id: number) => request(`/support/tickets/${id}/close`, { method: 'PATCH' }),

  // AI
  getRecommendations: (params: any) => request('/ai/recommend', { method: 'POST', body: JSON.stringify(params) }),
};

// Streaming AI chat
export async function streamChat(messages: any[], onChunk: (text: string) => void, onDone: () => void) {
  const token = getToken();
  const res = await fetch(BASE_URL + '/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.content) onChunk(data.content);
        if (data.done) onDone();
        if (data.error) onDone();
      } catch {}
    }
  }
}
