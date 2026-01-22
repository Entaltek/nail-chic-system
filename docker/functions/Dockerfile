FROM node:20-alpine

WORKDIR /functions

COPY functions/package*.json ./
RUN npm install

COPY functions .

EXPOSE 5001

CMD ["npm", "run", "serve"]
