FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .
RUN chmod +x ./scripts/entrypoint.sh

CMD ["./scripts/entrypoint.sh"]
