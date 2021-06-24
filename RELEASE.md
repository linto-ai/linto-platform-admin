# 0.2.5
#### 2021/06/24 - Updates
- add environment variable LINTO_STACK_TOCK_BASEHREF to handle Tock version update

# 0.2.4
#### 2021/04/12 - Updates
- Hotfix: Update removeUserFromApp function for deleting the good application
#### 2021/02/02 - Updates
- Hotfix: Update docker-entrypoint.sh for development mode
- App.vue : Update the "path" variable to be computed (url fullPath)


# 0.2.3
- 2021/02/01
#### Updates
- Hotfix: update and fix tests on select fields for streaming services listing

# 0.2.2
#### Updates
- fix "webapp_hosts" model issue on deleting multi-user application
- fix flow formatting issue on "save and publish"
- comment code (wip)
- Add an "VUE_APP_DEBUG" environment variable on front to be able to log errors

# 0.2.1
#### Updates
- Add tests on "applications" views to handle applications using STT services in process of generating
- Add a notification modal on "applications" views to show state of STT services in process of generating
- Add 2 new collections to database: "mqtt_users" and "mqtt_acls"

# 0.2.0
- Replace "context" notion by "workflows". Works with DB_VERSION=2

# 0.1.0
- First build of LinTO-Platform-Admin for our Docker Swarm Stack