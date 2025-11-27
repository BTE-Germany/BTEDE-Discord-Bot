FROM node:20-alpine

# Install Infisical CLI for secret injection
RUN npm install -g @infisical/cli

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Run the bot with Infisical injecting secrets
CMD ["infisical", "run", "--", "node", "index.js"]
