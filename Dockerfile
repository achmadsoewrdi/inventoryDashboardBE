FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate di sini, saat build image — bukan saat container start
RUN npx prisma generate

COPY . .

EXPOSE 3000

# CMD hanya jalankan app-nya saja
CMD ["npm", "run", "dev"]