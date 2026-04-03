FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

# Set the default secret code here, or override via environment variable in Portainer
ENV SECRET_CODE=0411
ENV PORT=3000

CMD ["node", "server.js"]
