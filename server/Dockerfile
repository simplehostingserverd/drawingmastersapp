FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy server files
COPY . .

# Compile TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "start"]