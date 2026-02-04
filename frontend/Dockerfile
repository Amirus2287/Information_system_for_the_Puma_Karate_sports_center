# Build stage
FROM oven/bun:1.2.19-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# API URL задаётся при сборке (Dokploy: Build Args)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN bun ./node_modules/typescript/lib/tsc.js && bun ./node_modules/vite/bin/vite.js build

# Production stage — nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
