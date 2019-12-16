# linto-platform-admin

## Description
"LinTO platform Admin" is a web interface used for monitoring a fleet of LinTO's devices, deployed on a technical scope.
Once you're connected to the interface, you have an access to the following services or fonctionalities :
- Create a "meeting room" on wich you can associate a LinTO device
- Create, edit or delete a LinTO device workflow (with node-red interface)
- Install or uninstall LinTO skills
- Monitring of LinTO devices (set a LinTO language, send messages or instructions... )
- Edit/train a NLU model (natural language understanding) via "Tock" interface

## Prerequisites
To lauch the application, you'll have to launch associated services :
- redis-server : [Installation guide](https://www.npmjs.com/package/redis-server)
- mongodb [installation guide](https://www.npmjs.com/package/mongodb)
- linto-platform-business-logic-server : [Documentation](https://github.com/linto-ai/linto-platform-business-logic-server)
- linto-platform-logic-mqtt-server : [LINK]
- linto-platform-nlu : [LINK]
- linto-platform-overwatch : [LINK]

## Download and setup

#### Download git repository
```
cd YOUR/PROJECT/PATH/
git clone ssh://git@ci.linagora.com:7999/linagora/lgs/labs/Linto-Device/Linto-Backend/linto-admin.git
```

#### Setup packages/depencies
```
cd YOUR/PROJECT/PATH/linto-admin/webserver
npm install
cd ../linto-admin/vue_app
npm install
```

## Front-end settings
You will need to set some environment variables to connect services like "Business Logic Server", "NLU/Tock", "Logic MQTT server" and "Overwatch"

### Set front-end variables
Go to the **/vue_app** folder and edit the following files: `.env.devlopment`, `.env.production`

- `.env.devlopment` : if you want to set custom port or url, replace **VUE_APP_URL** and **VUE_APP_NLU_URL** values
```
VUE_APP_URL=http://localhost:9000
VUE_APP_NLU_URL=VUE_APP_NLU_URL
```
- `.env.production` : set your "application url" and "Tock interface url" for production mode
```
VUE_APP_URL=VUE_APP_URL
VUE_APP_NLU_URL=VUE_APP_NLU_URL
```

## Back-end and services settings

### Set global and webserver variables
Go to the **/webserver** folder, you'll see a `.env_default` file.
Rename this file as `.env` and edit the environment variables.

```
cd YOUR/PROJECT/PATH/linto-admin/webserver
cp .env_default .env
```
#### Server settings
*Edit **/webserver/.env***
```
# Server settings
NODE_ENV=production
HTTP_PORT=9000
DEFAULT_CITY=Paris
DEFAULT_LANGUE=fr-FR
APP_URL=http://localhost:9000
```
- **NODE_ENV**: webserver running mode = ['production', 'development']
- **HTTP_PORT**: webserver running port
- **APP_URL**: URL of your project. If you want to run the project locally, be careful to set the same port as *HTTP_PORT* variable

#### Redis settings
*Edit **/webserver/.env***
```
...
# Redis settings
REDIS_PORT=6379
REDIS_HOST=localhost
```
- **REDIS_PORT**: redis-server service running port
- **REDIS_HOST**: redis-server service host

#### MongoDB settings
*Edit **/webserver/.env***
```
...
# Mongodb settings
BDD_TYPE=mongodb
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DBNAME=lintoAdmin
MONGODB_REQUIRE_LOGIN=true
MONGODB_USER=root
MOGODB_PSWD=example
```
- **MONGODB_HOST**: mongodb running host
- **MONGODB_PORT**: mongodb running port
- **MONGODB_DBNAME**: mongodb database name
- **MONGODB_REQUIRE_LOGIN**: Enable or disable mongoDb authentication = [‘true’, ‘false’]
- **MONGODB_USER**: Login for mongoDb authentication (default = "root")
- **MOGODB_PSWD**: Password for mongoDb authentication (default = "example")

If you want to modify `MONGODB_USER` and `MONGODB_PSWD`, please read the following instructions :
- 1/ edit the current **.env** with the values you want :
```
(example)
MONGODB_USER=myUserName
MOGODB_PSWD=myPassword
```
- 2/ Once it's done, you'll have to edit the initialisation file of mongodb that set a user and password. Edit the following file :`mongodb/seed/user.js`
```
db.createUser({
  user: "myUserName",
  pwd: "myPassword",
  roles: [{
    role: "readWrite",
    db: "lintoAdmin"
  }]
})
```

#### Business Locig Server (NodeRed) settings
*Edit **/webserver/.env***
```
...
# Business Logic Server
BUSINESS_LOGIC_SERVER_URI=BUSINESS_LOGIC_SERVER_URI
BLS_AUTH=true
# Default login settings
BLS_LOGIN=admin
BLS_PSWD=password
```
- **BUSINESS_LOGIC_SERVER_URI**: Url of you business logic server
- **BLS_AUTH**: Enable or disable Business Logic Server authentication = ['true', 'false']
- **BLS_LOGIN**: Login for BLS authentication (default = "admin")
- **BLS_PSWD**: Password for BLS authentication (default = "password")

If you want to modify `BLS_LOGIN` and `BLS_PSWD`, please read the following instructions : [Lien vers les explications]

#### Logic MQTT server settings
*Edit **/webserver/.env***
```
...
#Logic MQTT server
LOGIC_MQTT_ADDRESS=localhost
LOGIC_MQTT_PORT=1883
LOGIC_MQTT_USER=LOGIC_MQTT_USER
LOGIC_MQTT_PWD=LOGIC_MQTT_PWD
LOGIC_MQTT_USE_LOGIN=true
LOGIC_CLIENT_CODE=blk
```
- **LOGIC_MQTT_ADDRESS**: Logic MQTT address
- **LOGIC_MQTT_PORT**: Logic MQTT running port
- **LOGIC_MQTT_USER**: Logic MQTT authentication user
- **LOGIC_MQTT_PWD**: Logic MQTT authentication password
- **LOGIC_MQTT_USE_LOGIN**: Enable or disable Logic MQTT Server authentication = ['true', 'false']
- **LOGIC_CLIENT_CODE**: Logic MQTT topic client code

If you want to modify `LOGIC_MQTT_USER` and `LOGIC_MQTT_PWD`, please read the following instructions : [Lien vers les explications]

#### NLU / Tock interface settings
*Edit **/webserver/.env***
```
...
# NLU settings
IS_POPULATE=false
TOCK_PASSWORD=password
TOCK_USER=admin@app.com
TOCK_API=TOCK_API
LM_API=LM_API
```
- **IS_POPULATE**: Enable/disable skills populate = [true, false]
- **TOCK_USER**: Login for Tock authentication (default = "admin@app.com")
- **TOCK_PASSWORD**: Password for BLS authentication (default = "password")
- **TOCK_API**: Tock api url
- **LM_API**: Language model api url
