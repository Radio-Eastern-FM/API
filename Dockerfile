FROM node:14

WORKDIR /usr/src/app/api

COPY package*.json ./

RUN npm install

EXPOSE 4000

CMD ["npm", "run", "dev"]
