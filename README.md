# Mi Lista ✨

Una SPA simple y prolija para organizar tareas del día a día, hecha con HTML, CSS y JavaScript puro (sin frameworks ni build step).

## Funcionalidades

- **Tareas**: crear, editar (doble clic sobre el texto), completar y eliminar.
- **Categorías**: cada tarea se etiqueta como Personal, Trabajo, Compras, Salud u Otro, con su propio color.
- **Filtros**: Todas / Pendientes / Completadas, más barra de progreso.
- **Modo oscuro**: toggle manual que respeta la preferencia del sistema por defecto y se guarda en `localStorage`.
- **Tracker de hidratación**: 4 botellitas de agua y 2 cafés para marcar "ya lo tomé", con animación y reinicio automático cada día.
- **Diseño responsivo de una sola pantalla**: no hay scroll general, solo la lista de tareas scrollea internamente.
- **Paleta verde musgo/pantano** 🌿

Todo se persiste en el `localStorage` del navegador, no requiere backend ni conexión.

## Cómo correrlo local

```bash
npx serve -l 5173 .
```

Y abrís [http://localhost:5173](http://localhost:5173).

## Stack

HTML + CSS + JavaScript vanilla. Sin dependencias, sin build.
