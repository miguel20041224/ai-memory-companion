# AI Memory Companion

Memoria personal inteligente: captura recuerdos en texto (imagen/audio próximamente), analízalos con Gemini y conversa con tu línea de tiempo.

## Requisitos

- Node.js 20+
- Proyecto en [Firebase](https://console.firebase.google.com/)
- API key de [Google AI Studio](https://aistudio.google.com/) (Gemini)

## Configuración local

1. Clona el repositorio e instala dependencias:

```bash
npm install
```

2. Copia las variables de entorno:

```bash
cp .env.example .env.local
```

3. Completa `.env.local`:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Configuración del proyecto Firebase (Web app) |
| `GEMINI_API_KEY` | Solo servidor — nunca expongas en el cliente |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` en desarrollo |

4. En Firebase Console:

- Activa **Authentication** → Email/Password
- Crea **Firestore** en modo producción y despliega las reglas del repo (`firestore.rules`)
- Crea índice compuesto: colección `memories`, campos `userId` (Asc) + `createdAt` (Desc)
- Activa **Storage** si usarás medios

5. Ejecuta en desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/app/(auth)` — login y registro
- `src/app/(app)` — timeline, chat, insights, recuerdos
- `src/app/api/ai` — rutas de Gemini (analyze, chat, insights)
- `src/services` — Firestore y Storage
- `src/ai` — cliente Gemini y prompts

## Flujos principales

**Nuevo recuerdo:** formulario → `POST /api/ai/analyze` → `createMemory` en Firestore con metadatos IA.

**Chat:** `searchMemories` en cliente → `POST /api/ai/chat` con pregunta y recuerdos relevantes.

## Despliegue en Vercel

1. Importa el repositorio en [Vercel](https://vercel.com)
2. Añade las mismas variables de `.env.example` en **Settings → Environment Variables**
3. `GEMINI_API_KEY` solo en entorno de servidor (no marcar como expuesta al cliente)
4. Despliega; `NEXT_PUBLIC_APP_URL` debe ser tu dominio de producción

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor tras build |
| `npm run lint` | ESLint |

## PWA

La app incluye `manifest.ts` e iconos en `public/icons/`. En iOS, usa “Añadir a pantalla de inicio” desde Safari.

## Licencia

Privado — uso personal del propietario del repositorio.
