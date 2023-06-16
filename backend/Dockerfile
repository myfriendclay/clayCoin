# Base image for backend
FROM node:lts-bullseye-slim AS backend

# Set working directory for backend
WORKDIR /backend

# Copy backend files
COPY package*.json ./
RUN npm install

# Install Redis
RUN apt-get update && apt-get install -y redis-server

# Copy the rest of the backend code
COPY . .

# Expose necessary ports for backend
EXPOSE 3001
EXPOSE 3000

# Start backend
CMD npm run dev