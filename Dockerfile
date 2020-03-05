FROM node:latest

WORKDIR /usr/src/app/linto-admin

RUN apt-get update -y && \
    apt-get install -y mongodb

WORKDIR /usr/src/app/linto-admin/

COPY ./vue_app /usr/src/app/linto-admin/vue_app

# WORKDIR /usr/src/app/linto-admin/vue_app
# RUN npm install && \
#     npm install --save node-sass && \
#     npm run build-app

COPY ./webserver /usr/src/app/linto-admin/webserver

WORKDIR /usr/src/app/linto-admin/webserver
RUN npm install

EXPOSE 80

CMD ["npm", "run", "start"]