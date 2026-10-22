import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import TaskModal from './TaskModal.jsx';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Data local de hoje em 'YYYY-MM-DD' (comparável como string com due_date).
function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const formatDate = (s) => s.slice(0, 10).split('-').reverse().join('/');

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const PencilIcon = <Icon d={<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>} />;
const TrashIcon = <Icon d={<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>} />;
const CheckIcon = <Icon size={13} d={<path d="M20 6 9 17l-5-5" />} />;
const PlusIcon = <Icon size={26} d={<><path d="M12 5v14" /><path d="M5 12h14" /></>} />;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, completed: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | task object
  const debounced = useDebounce(search);

  const load = useCallback(async (signal) => {
    try {
      const data = await api.list(debounced, signal);
      setTasks(data.tasks);
      setCounts({ total: data.total, completed: data.completed });
      setError('');
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const run = async (fn) => {
    try { await fn(); await load(); } catch (err) { setError(err.message); }
  };

  const toggle = (t) => run(() => api.update(t.id, { completed: !t.completed }));
  const remove = (t) => run(() => api.remove(t.id));

  async function save(body) {
    if (modal === 'create') await api.create(body);
    else await api.update(modal.id, body);
    setModal(null);
    await load();
  }

  const today = todayStr();
  const isOverdue = (t) => !t.completed && t.due_date && t.due_date.slice(0, 10) < today;

  return (
    <main className="page">
      <section className="card">
        <h1>My Todo List</h1>
        <p className="subtitle">Stay focused, manage your tasks, and get things done with ease.</p>

        <input className="field search" type="search" placeholder="Search tasks..."
          aria-label="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />

        {error && <p className="error" role="alert">{error}</p>}

        <ul className="list">
          {!loading && tasks.length === 0 && (
            <li className="empty">{search ? 'No tasks match your search.' : 'You have no pending tasks.'}</li>
          )}
          {tasks.map((t) => {
            const done = Boolean(t.completed);
            const late = isOverdue(t);
            return (
              <li key={t.id} className="item">
                <button className={`check ${done ? 'on' : ''}`} onClick={() => toggle(t)}
                  role="checkbox" aria-checked={done} aria-label={`Marcar "${t.title}"`}>
                  {done && CheckIcon}
                </button>
                <div className="info">
                  <span className={`title ${done ? 'done' : ''} ${late ? 'late' : ''}`}>{t.title}</span>
                  {t.due_date && (
                    <span className="meta">
                      {formatDate(t.due_date)}
                      {late && <span className="badge">Em atraso</span>}
                    </span>
                  )}
                </div>
                <div className="actions">
                  <button className="icon-btn" onClick={() => setModal(t)} aria-label="Editar tarefa">{PencilIcon}</button>
                  <button className="icon-btn danger" onClick={() => remove(t)} aria-label="Excluir tarefa">{TrashIcon}</button>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="counter">{counts.completed} / {counts.total} completed</p>
      </section>

      <button className="fab" onClick={() => setModal('create')} aria-label="Create task">{PlusIcon}</button>

      {modal && (
        <TaskModal task={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={save} />
      )}
    </main>
  );
}
