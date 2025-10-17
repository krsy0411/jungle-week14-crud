# Build stage
FROM node:20.12.2-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Production stage
FROM node:20.12.2-alpine
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/package*.json ./

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
