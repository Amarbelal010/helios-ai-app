# Use Node.js LTS version as base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Expose port 5000 (or use PORT env variable)
EXPOSE 5000

# Health check to verify the service is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]

