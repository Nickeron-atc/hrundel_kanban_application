# ---- Stage 1: Build ----
FROM node:18-alpine AS build

WORKDIR /app

# Копируем манифесты зависимостей (обязательно оба файла)
COPY app/frontend/package.json app/frontend/package-lock.json ./

# Устанавливаем зависимости точно по lock-файлу
# Если lock-файла нет, замените на RUN npm install
RUN npm ci

# Копируем ВСЁ содержимое папки frontend (src, public, ...)
COPY app/frontend/ ./

# Собираем проект (создаст папку build)
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:stable-alpine

# Копируем собранные статические файлы
COPY --from=build /app/build /usr/share/nginx/html

# Если нужна поддержка клиентского роутинга (React Router), раскомментируйте:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 (стандартный для nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]