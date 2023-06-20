# Base image for backend
FROM node:lts-bullseye-slim AS backend

# Set working directory for backend
WORKDIR /backend

# Copy backend files
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose necessary ports for backend
EXPOSE 3001
EXPOSE 3000
EXPOSE 3010

# Start backend
CMD npm run dev