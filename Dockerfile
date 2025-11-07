# Use Node.js 18 LTS (Debian base for better compatibility)
FROM node:18

# Cache buster - update this to force complete rebuild
ENV CACHE_BUST="2025-09-30T13:30:00Z"

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install all production dependencies
RUN npm install --omit=dev

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads reports temp

# Expose port (flexible for different hosting platforms)
EXPOSE $PORT
EXPOSE 3000
EXPOSE 8080

# Start the main server
CMD ["npm", "start"]