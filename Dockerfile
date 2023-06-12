# Base image for frontend
FROM node:14 AS frontend

# Set working directory for frontend
WORKDIR /app

# Copy frontend files
COPY app/package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY app .

# Base image for backend
FROM node:14 AS backend

# Set working directory for backend
WORKDIR /

# Copy backend files
COPY /package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose necessary ports for backend
EXPOSE 3000
EXPOSE 3001

# Start frontend and backend concurrently
CMD npm run start-full-app