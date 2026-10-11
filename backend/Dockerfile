FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=3500
EXPOSE 3500
CMD ["node", "index.js"]
