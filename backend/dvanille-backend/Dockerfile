FROM node:20-bookworm-slim

# OpenSSL é exigido pelo engine do Prisma
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# O schema precisa existir antes do npm install (postinstall: prisma generate)
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund

COPY . .
RUN chmod +x scripts/docker-entrypoint.sh \
  && mkdir -p uploads/products uploads/profiles uploads/categories

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["sh", "scripts/docker-entrypoint.sh"]
