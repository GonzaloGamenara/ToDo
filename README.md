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
- **PWA instalable**: manifest + service worker, funciona offline y se puede agregar a la pantalla de inicio (probado en iPhone).

Todo se persiste en el `localStorage` del navegador, no requiere backend ni conexión.

## Cómo correrlo local

```bash
npx serve -l 5173 .
```

Y abrís [http://localhost:5173](http://localhost:5173).

## Deploy en Vercel

Es un sitio estático, no necesita configuración de build (framework preset: "Other"). El `vercel.json` ya incluido define los headers correctos para el manifest y el service worker.

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. Dejá Build Command y Output Directory vacíos (o `Other`).
3. Deploy.

## Instalar como app en iPhone

1. Abrí el sitio en Safari.
2. Compartir → **Agregar a pantalla de inicio**.
3. Se abre en pantalla completa, con ícono propio y sin scroll de más (respeta el notch y el home indicator).

## Stack

HTML + CSS + JavaScript vanilla. Sin dependencias, sin build.
