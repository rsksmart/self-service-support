FROM node:14-alpine
RUN apk add --no-cache build-base git python
RUN npm install --global pm2
WORKDIR /usr/app
RUN npm install
COPY . ./
EXPOSE 11375/tcp
CMD ["npm", "run", "start"]
