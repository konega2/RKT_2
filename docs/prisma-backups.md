# Backups automáticos de la BD de Prisma

Este proyecto incluye un workflow en `.github/workflows/prisma-db-backup.yml` que:

- ejecuta un backup diario (03:00 UTC),
- permite ejecución manual (`workflow_dispatch`),
- guarda dos archivos por ejecución:
  - dump completo de PostgreSQL (`.dump`),
  - export SQL solo de pilotos/entrenamientos (`.sql`).

## Activación (una sola vez)

1. Ve al repositorio en GitHub.
2. En `Settings` → `Secrets and variables` → `Actions`.
3. Crea el secret:
   - **Name:** `PRISMA_DATABASE_URL`
   - **Value:** la URL de conexión PostgreSQL de Prisma (la misma de `.env`).

## Ejecutarlo manualmente

1. Ve a `Actions`.
2. Abre `Prisma DB Backup`.
3. Pulsa `Run workflow`.

## Dónde se descargan

En cada ejecución, abre el job y descarga el artifact `prisma-db-backup-<run_id>`.

## Restauración rápida

- Dump completo (`.dump`):

```bash
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" prisma_full_YYYYMMDD_HHMMSS.dump
```

- SQL de pilotos/entrenamientos (`.sql`):

```bash
psql "$DATABASE_URL" -f prisma_pilots_training_YYYYMMDD_HHMMSS.sql
```
