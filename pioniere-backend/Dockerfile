FROM node:lts-alpine

RUN mkdir -p /pioniere-backend/node_modules && chown -R node:node /pioniere-backend
WORKDIR /pioniere-backend
COPY package*.json ./
COPY .env ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000
CMD ["npm", "run", "dev"]