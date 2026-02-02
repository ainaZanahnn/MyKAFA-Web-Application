FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (though not needed for static sites)
EXPOSE 4173

# Serve the built application
CMD ["npm", "run", "preview"]
