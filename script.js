const STORAGE_KEY = 'todo-spa-items';
const THEME_KEY = 'todo-spa-theme';
const TRACKER_KEY = 'todo-spa-tracker';
const STREAK_KEY = 'todo-spa-streak';

const CATEGORIES = {
  personal: { label: 'Personal', color: '#6f9457' },
  trabajo: { label: 'Trabajo', color: '#4f8a7c' },
  estudio: { label: 'Estudio', color: '#5c7a9c' },
  compras: { label: 'Compras', color: '#c08a3e' },
  finanzas: { label: 'Finanzas', color: '#6b7a4a' },
  hogar: { label: 'Hogar', color: '#8a6a4a' },
  salud: { label: 'Salud', color: '#a1584f' },
  mascotas: { label: 'Mascotas', color: '#c17a4a' },
  ocio: { label: 'Ocio', color: '#b06a8a' },
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
const streakBadge = document.getElementById('streak-badge');
const streakCount = document.getElementById('streak-count');

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
      <div class="swipe-bg" aria-hidden="true">
        <svg class="swipe-icon swipe-complete" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg class="swipe-icon swipe-delete" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
      <div class="todo-item-row">
        <button class="checkbox" aria-label="Marcar como completada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <span class="todo-text" title="Doble clic para editar"></span>
        <span class="tag" style="--tag-color: ${category.color}"></span>
        <button class="delete-btn" aria-label="Eliminar tarea">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
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

  if ('setAppBadge' in navigator) {
    if (pending > 0) navigator.setAppBadge(pending).catch(() => {});
    else if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {});
  }
}

function isAllDone() {
  return todos.length > 0 && todos.every((t) => t.done);
}

function addTodo(text, category) {
  todos.unshift({ id: crypto.randomUUID(), text, category, done: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const wasAllDone = isAllDone();
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = !todo.done;
  saveTodos();
  render();
  if (!wasAllDone && isAllDone()) fireConfetti();
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

  const checkboxBtn = e.target.closest('.checkbox');
  if (checkboxBtn) {
    const todo = todos.find((t) => t.id === id);
    if (todo && !todo.done) {
      const category = CATEGORIES[todo.category] || CATEGORIES.otro;
      burstParticles(checkboxBtn, category.color);
    }
    toggleTodo(id);
  } else if (e.target.closest('.delete-btn')) {
    deleteTodo(id);
  }
});

let swipe = null;

list.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const row = item.querySelector('.todo-item-row');
  swipe = {
    id: item.dataset.id,
    item,
    row,
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    dx: 0,
    deciding: true,
    horizontal: false,
  };
});

list.addEventListener('pointermove', (e) => {
  if (!swipe || e.pointerId !== swipe.pointerId) return;
  const dx = e.clientX - swipe.startX;
  const dy = e.clientY - swipe.startY;

  if (swipe.deciding) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    swipe.deciding = false;
    swipe.horizontal = Math.abs(dx) > Math.abs(dy);
    if (swipe.horizontal) {
      swipe.row.style.transition = 'none';
      swipe.row.setPointerCapture?.(e.pointerId);
    }
  }
  if (!swipe.horizontal) return;

  swipe.dx = dx;
  const clamped = Math.max(-110, Math.min(110, dx));
  swipe.row.style.transform = `translateX(${clamped}px)`;
  swipe.item.classList.toggle('swipe-right', clamped > 28);
  swipe.item.classList.toggle('swipe-left', clamped < -28);
});

function endSwipe() {
  if (!swipe) return;
  const { item, row, dx, horizontal, id } = swipe;

  if (horizontal) {
    const threshold = 68;
    row.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
    if (dx > threshold) {
      const todo = todos.find((t) => t.id === id);
      if (todo && !todo.done) {
        const category = CATEGORIES[todo.category] || CATEGORIES.otro;
        burstParticles(row, category.color);
      }
      row.style.transform = 'translateX(130px)';
      row.style.opacity = '0.4';
      setTimeout(() => toggleTodo(id), 140);
    } else if (dx < -threshold) {
      row.style.transform = 'translateX(-130px)';
      row.style.opacity = '0.4';
      setTimeout(() => deleteTodo(id), 160);
    } else {
      row.style.transform = '';
      item.classList.remove('swipe-right', 'swipe-left');
    }
  }
  swipe = null;
}

list.addEventListener('pointerup', endSwipe);
list.addEventListener('pointercancel', endSwipe);

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

function burstParticles(el, color) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const count = 7;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'burst-particle';
    particle.style.left = `${cx}px`;
    particle.style.top = `${cy}px`;
    particle.style.background = color;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 20 + Math.random() * 14;
    particle.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }
}

const CONFETTI_COLORS = ['#4f6b3f', '#8a9a5b', '#6f9457', '#4f8a7c', '#c08a3e', '#a1584f'];

function fireConfetti() {
  const count = 70;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    piece.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadStreak() {
  try {
    const raw = JSON.parse(localStorage.getItem(STREAK_KEY));
    if (raw && typeof raw.count === 'number') return raw;
  } catch {}
  return { count: 0, lastDate: null };
}

function saveStreak() {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

function renderStreak() {
  const show = streak.count > 0;
  streakBadge.hidden = !show;
  if (show) streakCount.textContent = streak.count;
}

function registerWaterComplete() {
  const today = todayStr();
  if (streak.lastDate === today) return;
  streak.count = streak.lastDate === todayMinus(1) ? streak.count + 1 : 1;
  streak.lastDate = today;
  saveStreak();
  renderStreak();
}

const tracker = loadTracker();
const streak = loadStreak();
renderStreak();

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
      const color = getComputedStyle(btn).getPropertyValue('--tracker-color').trim() || '#4f6b3f';
      burstParticles(btn, color);
      if (type === 'water' && tracker.water.every(Boolean)) registerWaterComplete();
    }
  });
});

const shortcutParams = new URLSearchParams(location.search);
if (shortcutParams.get('action') === 'add') {
  history.replaceState({}, '', location.pathname);
  requestAnimationFrame(() => input.focus());
}

render();
