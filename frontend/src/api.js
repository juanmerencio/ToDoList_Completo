const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro ao comunicar com o servidor.');
  return data;
}

// Atenção: DELETE não envia Content-Type/body, senão o Fastify rejeita (corpo JSON vazio).
const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  list: (search, signal) => request(`/api/tasks?search=${encodeURIComponent(search)}`, { signal }),
  create: (body) => request('/api/tasks', json('POST', body)),
  update: (id, body) => request(`/api/tasks/${id}`, json('PATCH', body)),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
