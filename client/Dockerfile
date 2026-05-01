FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5173

# Run development server with HMR enabled
ENV VITE_HOST=0.0.0.0
CMD ["npm", "run", "dev"]
