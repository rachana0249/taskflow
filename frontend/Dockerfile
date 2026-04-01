# TaskFlow Frontend Dockerfile

FROM node:18-alpine AS builder

WORKDIR /app

# Copy frontend files
COPY . .

# Install serve to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Environment variables
ENV REACT_APP_API_URL=https://taskflow-backend.railway.app/api
ENV REACT_APP_SOCKET_URL=https://taskflow-backend.railway.app

# Start app
CMD ["serve", "-s", ".", "-l", "3000"]
