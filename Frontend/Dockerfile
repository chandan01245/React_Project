# Use Node for build
FROM node:20 AS build

WORKDIR /app

COPY Frontend/ ./

RUN npm install
RUN npm run build

# Use nginx for serving static files
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80