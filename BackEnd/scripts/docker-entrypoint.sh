#!/bin/sh
set -e

# Aplica o schema no banco:
# - se existirem migrations versionadas, usa "migrate deploy";
# - caso contrário (primeiro uso sem migrations geradas), usa "db push".
if ls prisma/migrations/*/migration.sql >/dev/null 2>&1; then
  echo "[entrypoint] Aplicando migrations (prisma migrate deploy)..."
  npx prisma migrate deploy
else
  echo "[entrypoint] Nenhuma migration encontrada. Sincronizando schema (prisma db push)..."
  npx prisma db push --skip-generate
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "[entrypoint] Executando seed..."
  node prisma/seed.js
fi

exec node src/server.js
