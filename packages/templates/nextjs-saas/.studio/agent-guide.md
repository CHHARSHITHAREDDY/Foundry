# Agent Build Guide

1. Read `build-spec.json` before writing any files.
2. Implement pages in `src/app/` using Next.js 15 App Router conventions.
3. Define schema in `src/db/schema.ts` with Drizzle ORM.
4. Keep UI primitives in `src/components/ui/`.
5. Maintain strict TypeScript compilation without `@ts-ignore` or `any` casts.
