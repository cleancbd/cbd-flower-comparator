# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy application source
COPY . .

# Compile production bundle
RUN npm run build


# 2. Production Runner Stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install production-only dependencies
COPY package.json ./
COPY --from=builder /app/dist ./dist

# Create generated directory for Hugo output volume and non-root user
RUN mkdir -p /app/generated && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Start compiled server
CMD ["node", "dist/index.html"] 

## Stage 2: Production runtime stage with Nginx
#FROM nginx:alpine AS runner
#
## Clear default static files
#RUN rm -rf /usr/share/nginx/html/*
#
## Copy compiled SPA bundle from builder stage
#COPY --from=builder /app/dist /usr/share/nginx/html
#
## Copy Nginx SPA server configuration
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#
## Expose container port
#EXPOSE 3000
#
## Healthcheck to verify service availability
#HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
#  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1
#
#CMD ["nginx", "-g", "daemon off;"]

