FROM node:latest

WORKDIR /usr/src/app/linto-admin

RUN apt-get update -y && \
    apt-get install -y mongodb

COPY ./webserver /usr/src/app/linto-admin/webserver
RUN cd /usr/src/app/linto-admin/webserver && \
    npm install

WORKDIR /usr/src/app/linto-admin/webserver
EXPOSE 80
CMD ["npm", "run", "start-dev"]