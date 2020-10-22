FROM node:lts-alpine

WORKDIR /pioniere-backend
COPY package*.json ./
COPY .env ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run" ,"start"]