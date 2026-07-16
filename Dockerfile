# Single-service image: API + static frontend served together.
# Build from the REPO ROOT:  docker build -t cloud-ascent .
FROM node:22-slim
WORKDIR /app

# Install prod deps (build tools needed for better-sqlite3, then removed)
COPY backend/package.json backend/package-lock.json* ./backend/
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
 && cd backend && npm install --omit=dev \
 && cd .. && apt-get purge -y python3 make g++ && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

COPY backend ./backend
COPY frontend ./frontend

ENV NODE_ENV=production
ENV SERVE_FRONTEND=1
ENV DB_PATH=/app/backend/data/cloud-ascent.db
EXPOSE 8080
USER node
WORKDIR /app/backend
CMD ["node", "src/server.js"]
