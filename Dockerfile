FROM node:14-alpine

RUN apk add --no-cache build-base git python

RUN mkdir -p /home/app && chown node:node /home/app
USER node

WORKDIR /home/app
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . ./

EXPOSE 11375/tcp

CMD ["npm", "run", "start"]
