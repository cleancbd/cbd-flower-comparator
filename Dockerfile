# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy application source
COPY . .

# Compile production bundle
RUN npm run build 
#RUN cp search.html index.html && npm run build && mv dist dist1 && mv dist1/index.html dist1/search.html
#RUN cp flower.html index.html && npm run build && mv dist dist0 && cp dist0/index.html dist1/flower.html

# Stage 2: Production runtime stage with Nginx
FROM nginx:alpine AS runner

# Clear default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA bundle from builder stage
COPY --from=builder /app/dist* /usr/share/nginx/html

# Copy Nginx SPA server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose container port
EXPOSE 3000

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
