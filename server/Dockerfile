FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment to development for hot reload
ENV NODE_ENV=development

# Run server
CMD ["npm", "run", "dev"]
