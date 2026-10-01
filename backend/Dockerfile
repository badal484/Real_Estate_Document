FROM node:22-slim

# Install OpenSSL required by Prisma on Debian slim
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client
RUN npm install
RUN npx prisma generate

# Copy application source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript in dist/
RUN npm run build

# Default environment configuration
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

# Push database schema updates on boot, then start the server
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]
