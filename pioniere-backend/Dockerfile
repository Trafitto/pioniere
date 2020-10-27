FROM node:lts-alpine

WORKDIR /usr/src/pioniere-backend

COPY package*.json ./
RUN npm install

COPY .env ./
COPY . .
COPY --chown=node:node . .
EXPOSE 3000

CMD ["npm", "run", "dev"]