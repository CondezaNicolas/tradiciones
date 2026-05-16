# Tradiciones

Revista digital con editor visual de ediciones y lector publico tipo magazine.

## Stack actual

- `Next.js 16` + `React 19`
- `Drizzle ORM`
- `SQLite` temporal para desarrollo local
- `Fabric.js` para el editor visual
- `JWT` en cookie httpOnly para admin

## Estado actual de arquitectura

Hoy el proyecto queda simplificado para laburar local sin depender de Postgres.

Actualmente:

- base de datos: `SQLite` via `DATABASE_FILE`
- storage: `local` o `Supabase Storage` segun `STORAGE_PROVIDER`
- auth admin: cookie `session` firmada con `JWT_SECRET`

## Variables de entorno

Copiá `.env.example` a `.env.local`.

Variables minimas para desarrollo:

```env
DATABASE_FILE=./data/tradiciones.sqlite
JWT_SECRET=un-secreto-largo-y-distinto
STORAGE_PROVIDER=local
```

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Preparar base de datos:

```bash
npm run db:push
npm run db:seed
```

Levantar entorno:

```bash
npm run dev
```

Accesos utiles:

- sitio publico: `http://localhost:3000`
- admin login: `http://localhost:3000/admin/login`
- editor de una edicion: `http://localhost:3000/admin/ediciones/[id]`

## Scripts

- `npm run dev` - desarrollo con webpack
- `npm run dev:turbo` - desarrollo con turbopack
- `npm run lint` - lint
- `npm run db:push` - sincroniza schema SQLite a la base local
- `npm run db:studio` - abre Drizzle Studio
- `npm run db:seed` - crea usuario admin inicial

## Como se guarda la informacion

- `editions` - metadata de la revista
- `pages` - paginas, `fabric_json` y `thumbnail_url`
- `images` - imagenes subidas para una edicion
- `admin_users` - usuarios admin

Archivos fisicos:

- local dev: `public/uploads`
- prod barato: `Supabase Storage`

## Nota temporal

Este setup queda orientado a destrabar desarrollo local rapido con SQLite. Si despues querés volver a Postgres, hay que reconfigurar `lib/db`, `lib/db/schema.ts` y `drizzle.config.ts`.
