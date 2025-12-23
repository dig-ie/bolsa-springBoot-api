# Dockerfile
FROM node:20

# Diretório de trabalho
WORKDIR /usr/src/app

# Instala pnpm global
RUN npm install -g pnpm@latest

# Copia só manifestos primeiro (cache eficiente)
COPY package.json pnpm-lock.yaml ./

# Instala dependências
RUN pnpm install --no-frozen-lockfile

# Copia todos os arquivos necessários de uma vez
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Build para prod (em dev isso é sobrescrito pelo bind-mount)
RUN pnpm run build

# Default: start prod
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"]

