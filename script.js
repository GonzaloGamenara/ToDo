const STORAGE_KEY = 'todo-spa-items';
const THEME_KEY = 'todo-spa-theme';
const TRACKER_KEY = 'todo-spa-tracker';

const CATEGORIES = {
  personal: { label: 'Personal', color: '#6f9457' },
  trabajo: { label: 'Trabajo', color: '#4f8a7c' },
  compras: { label: 'Compras', color: '#c08a3e' },
  salud: { label: 'Salud', color: '#a1584f' },
  otro: { label: 'Otro', color: '#9c9873' },
};

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const categorySelect = document.getElementById('todo-category');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const emptyText = emptyState.querySelector('p');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

let todos = loadTodos();
let currentFilter = 'all';

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  list.innerHTML = '';

  const filtered = todos.filter((t) => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'completed') return t.done;
    return true;
  });

  filtered.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');
    li.dataset.id = todo.id;
    const category = CATEGORIES[todo.category] || CATEGORIES.otro;

    li.innerHTML = `
      <button class="checkbox" aria-label="Marcar como completada">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
      <span class="todo-text" title="Doble clic para editar"></span>
      <span class="tag" style="--tag-color: ${category.color}"></span>
      <button class="delete-btn" aria-label="Eliminar tarea">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    li.querySelector('.todo-text').textContent = todo.text;
    li.querySelector('.tag').textContent = category.label;
    list.appendChild(li);
  });

  const isEmpty = filtered.length === 0;
  list.style.display = isEmpty ? 'none' : 'flex';
  emptyState.classList.toggle('show', isEmpty);
  if (isEmpty) {
    if (todos.length > 0 && currentFilter === 'active') {
      emptyText.innerHTML = '¡Completaste todo!<br>Buen trabajo ✨';
    } else if (todos.length > 0 && currentFilter === 'completed') {
      emptyText.innerHTML = 'Todavía no completaste<br>ninguna tarea.';
    } else {
      emptyText.innerHTML = 'No hay tareas por acá.<br>¡Agregá la primera!';
    }
  }

  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const pending = total - done;

  itemsLeft.textContent = `${pending} ${pending === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
  progressLabel.textContent = `${done} de ${total} completadas`;
  progressFill.style.width = total === 0 ? '0%' : `${(done / total) * 100}%`;

  clearCompletedBtn.style.visibility = done > 0 ? 'visible' : 'hidden';
}

function addTodo(text, category) {
  todos.unshift({ id: crypto.randomUUID(), text, category, done: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = !todo.done;
  saveTodos();
  render();
}

function editTodo(id, text) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.text = text;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.done);
  saveTodos();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text, categorySelect.value);
  input.value = '';
  input.focus();
});

list.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.closest('.checkbox')) {
    toggleTodo(id);
  } else if (e.target.closest('.delete-btn')) {
    deleteTodo(id);
  }
});

list.addEventListener('dblclick', (e) => {
  const textEl = e.target.closest('.todo-text');
  if (!textEl) return;
  const item = e.target.closest('.todo-item');
  startEditing(item, textEl, item.dataset.id);
});

function startEditing(item, textEl, id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'todo-edit-input';
  editInput.maxLength = 120;
  editInput.value = todo.text;
  textEl.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    const value = editInput.value.trim();
    if (commit && value) {
      editTodo(id, value);
    } else {
      render();
    }
  };

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finish(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finish(false);
    }
  });
  editInput.addEventListener('blur', () => finish(true));
}

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
});

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadTracker() {
  try {
    const raw = JSON.parse(localStorage.getItem(TRACKER_KEY));
    if (raw && raw.date === todayStr()) return raw;
  } catch {}
  return { date: todayStr(), water: [false, false, false, false], coffee: [false, false] };
}

function saveTracker() {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
}

function spawnParticles(btn) {
  const count = 7;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'tracker-particle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 20 + Math.random() * 14;
    particle.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    btn.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }
}

const tracker = loadTracker();

document.querySelectorAll('.tracker-item').forEach((btn) => {
  const type = btn.dataset.type;
  const idx = Number(btn.dataset.index);
  btn.classList.toggle('filled', tracker[type][idx]);

  btn.addEventListener('animationend', (e) => {
    if (e.animationName === 'tracker-pop') btn.classList.remove('pop');
  });

  btn.addEventListener('click', () => {
    const taken = !tracker[type][idx];
    tracker[type][idx] = taken;
    saveTracker();
    btn.classList.toggle('filled', taken);
    if (taken) {
      btn.classList.add('pop');
      spawnParticles(btn);
    }
  });
});

render();
