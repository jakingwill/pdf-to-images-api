FROM node:18-slim

# Install poppler-utils for pdftoppm command
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create temp directory
RUN mkdir -p temp

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]