# Entrevistas Estaca

App móvil-first (React + Vite + Tailwind + Supabase) para agendar entrevistas semanales de líderes (presidentes) en una estaca. Realtime, roles (admin/secretario), validación de horarios duplicados.

## 1. Requisitos

- Node.js 18+
- Una cuenta de [Supabase](https://supabase.com)

## 2. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`. Esto crea las tablas `profiles`, `presidentes`, `citas`, las políticas RLS y habilita Realtime.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
4. (Opcional pero recomendado) Despliega las Edge Functions para gestión de usuarios:
   ```bash
   supabase login
   supabase link --project-ref TU_PROJECT_REF
   supabase functions deploy create-user
   supabase functions deploy delete-user
   ```
   Estas funciones usan la `service_role key` (ya disponible automáticamente en el entorno de Supabase Functions) para crear/eliminar usuarios de forma segura, sin exponer esa clave en el navegador.

## 3. Crear tu primer usuario admin

1. Corre la app (paso 4) y regístrate/crea un usuario desde Supabase Auth (Authentication → Users → Add user), o usa temporalmente la sección Usuarios una vez tengas un admin.
2. Para el PRIMER admin, ejecuta en el SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
   ```

## 4. Instalar y correr localmente

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales de Supabase
npm run dev
```

Abre `http://localhost:5173`. Para probar la experiencia mobile real, usa las DevTools de Chrome en modo dispositivo móvil, o abre la URL desde tu celular en la misma red (usa `npm run dev -- --host`).

## 5. Build de producción

```bash
npm run build
npm run preview
```

Sube la carpeta `dist/` a Vercel, Netlify, Cloudflare Pages, etc. Recuerda configurar las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el proveedor de hosting.

## Estructura del proyecto

```
src/
  lib/supabaseClient.js      Cliente de Supabase
  lib/constants.js           Horarios disponibles, modalidades, helpers
  context/AuthContext.jsx    Sesión + perfil + rol
  hooks/useCitas.js          CRUD de citas + validación de duplicados + realtime
  hooks/usePresidentes.js    CRUD de presidentes + realtime
  hooks/useUsuarios.js       Listado/creación/eliminación de usuarios (admin)
  components/layout/         Header, BottomNav, AppLayout (shell tipo app nativa)
  components/agenda/         DaySelector, PresidenteCard, HorarioSlot, CitaForm
  components/ui/             Button, Card, Badge, Input/Select/Textarea
  pages/                     Login, Agenda, NuevaCita, EditarCita, Semana, Historial, Usuarios, Presidentes
  routes/ProtectedRoute.jsx  Protección de rutas por sesión / rol
supabase/
  schema.sql                 Tablas, RLS, triggers, realtime
  functions/create-user/     Edge Function para crear usuarios (service_role)
  functions/delete-user/     Edge Function para eliminar usuarios (service_role)
```

## Notas

- **Horarios**: edita el arreglo `HORARIOS` en `src/lib/constants.js` para ajustar los bloques de tiempo disponibles (por defecto incluye bloques de mañana y noche como ejemplo).
- **Validación de duplicados**: además de la validación en el cliente (`useCitaMutations`), la base de datos tiene una restricción `unique (presidente_id, fecha, hora)` como última línea de defensa contra condiciones de carrera.
- **Realtime**: todas las pantallas (Agenda, Semana, Historial, Presidentes, Usuarios) se suscriben a cambios de Postgres vía Supabase Realtime, así que todos los secretarios ven las citas nuevas/editadas/eliminadas al instante.
- **Roles**: `admin` puede gestionar usuarios y presidentes; `secretario` puede crear/editar citas y ver todo. Los permisos de escritura reales están además reforzados por las políticas RLS en `schema.sql`.
