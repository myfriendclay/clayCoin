# Base image for frontend
FROM node:lts-bullseye-slim AS frontend

# Set working directory for frontend
WORKDIR /frontend

# Copy frontend files
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Start frontend
CMD npm run start
