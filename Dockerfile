# Step 1: Build the React app
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Create a shell script to replace the port in the nginx config and start nginx
RUN echo 'echo "server { listen ${PORT:-80}; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

CMD ["/bin/sh", "/start.sh"]
