# hrundel-kanban/Dockerfile
# Stage 1: Build the React app
FROM node:22-alpine AS builder

# Set CI environment variable to prevent pnpm from prompting for TTY confirmation
ENV CI=true

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Compile the React app into static files in the 'dist' directory
RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy compiled static files from the builder stage to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
