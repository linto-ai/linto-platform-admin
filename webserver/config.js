/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Business-Logic-Server
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const debug = require('debug')('linto-admin:config')
const dotenv = require('dotenv')
const path = require('path');
const fs = require('fs')

function ifHasNotThrow(element, error) {
    if (!element) throw error
    return element
}

function ifHas(element, defaultValue) {
    if (!element) return defaultValue
    return element
}

const APP_ROOT_DIR = path.resolve(__dirname)

function configureDefaults() {
    try {
        dotenv.config()
        const envdefault = dotenv.parse(fs.readFileSync('.envdefault'))

        //Server properties
        process.env.NODE_ENV = ifHas(process.env.NODE_ENV, envdefault.NODE_ENV)
        process.env.HTTP_PORT = ifHas(process.env.HTTP_PORT, envdefault.HTTP_PORT)
        process.env.CITY = ifHas(process.env.DEFAULT_CITY, envdefault.DEFAULT_CITY)
        process.env.DEFAULT_LANGUE = ifHas(process.env.DEFAULT_LANGUE, envdefault.DEFAULT_LANGUE)
        process.env.TZ = ifHas(process.env.TZ, envdefault.TZ)
        process.env.ADMIN_URL = ifHas(process.env.ADMIN_URL, envdefault.ADMIN_URL)
        process.env.WHITELIST_DOMAINS = ifHasNotThrow(process.env.WHITELIST_DOMAINS, 'No whitelist found. Please edit ".env" file')

        // BLS
        process.env.BUSINESS_LOGIC_SERVER_URL = ifHas(process.env.BUSINESS_LOGIC_SERVER_URL, envdefault.BUSINESS_LOGIC_SERVER_URL)
        process.env.BUSINESS_LOGIC_SERVER_URI = ifHas(process.env.BUSINESS_LOGIC_SERVER_URI, envdefault.BUSINESS_LOGIC_SERVER_URI)
        process.env.BLS_AUTH = ifHas(process.env.BLS_AUTH, envdefault.BLS_AUTH)
        process.env.BLS_LOGIN = ifHas(process.env.BLS_LOGIN, envdefault.BLS_LOGIN)
        process.env.BLS_PSWD = ifHas(process.env.BLS_PSWD, envdefault.BLS_PSWD)

        //Mqtt
        process.env.LOGIC_MQTT_ADDRESS = ifHas(process.env.LOGIC_MQTT_ADDRESS, envdefault.LOGIC_MQTT_ADDRESS)
        process.env.LOGIC_MQTT_PORT = ifHas(process.env.LOGIC_MQTT_PORT, envdefault.LOGIC_MQTT_PORT)
        process.env.LOGIC_MQTT_USER = ifHas(process.env.LOGIC_MQTT_USER, envdefault.LOGIC_MQTT_USER)
        process.env.LOGIC_MQTT_PWD = ifHas(process.env.LOGIC_MQTT_PWD, envdefault.LOGIC_MQTT_PWD)
        process.env.LOGIC_MQTT_USE_LOGIN = ifHas(process.env.LOGIC_MQTT_USE_LOGIN, envdefault.LOGIC_MQTT_USE_LOGIN)
        process.env.LOGIC_MQTT_HW_SCOPE = ifHas(process.env.LOGIC_MQTT_HW_SCOPE, envdefault.LOGIC_MQTT_HW_SCOPE)

        //Database (mongodb)
        process.env.BDD_TYPE = ifHas(process.env.BDD_TYPE, envdefault.BDD_TYPE)
        process.env.MONGODB_DBNAME = ifHas(process.env.MONGODB_DBNAME, envdefault.MONGODB_DBNAME)
        process.env.MONGODB_HOST = ifHas(process.env.MONGODB_HOST, envdefault.MONGODB_HOST)
        process.env.MONGODB_PORT = ifHas(process.env.MONGODB_PORT, envdefault.MONGODB_PORT)
        process.env.MONGODB_REQUIRE_LOGIN = ifHas(process.env.MONGODB_REQUIRE_LOGIN, envdefault.MONGODB_REQUIRE_LOGIN)
        process.env.MONGODB_USER = ifHas(process.env.MONGODB_USER, envdefault.MONGODB_USER)
        process.env.MOGODB_PSWD = ifHas(process.env.MOGODB_PSWD, envdefault.MOGODB_PSWD)

        // Redis
        process.env.REDIS_PORT = ifHas(process.env.REDIS_PORT, envdefault.REDIS_PORT)
        process.env.REDIS_HOST = ifHas(process.env.REDIS_HOST, envdefault.REDIS_HOST)

        // NLU - TOCK
        process.env.NLU_TOCK_HOST = ifHas(process.env.NLU_TOCK_HOST, envdefault.NLU_TOCK_HOST)
        process.env.NLU_TOCK_USER = ifHas(process.env.NLU_TOCK_USER, envdefault.NLU_TOCK_USER)
        process.env.NLU_TOCK_PSWD = ifHas(process.env.NLU_TOCK_PSWD, envdefault.NLU_TOCK_PSWD)

        // STT service-manager
        process.env.SERVICE_MANAGER_URL = ifHas(process.env.SERVICE_MANAGER_URL, envdefault.SERVICE_MANAGER_URL)

    } catch (e) {
        console.error(debug.namespace, e)
        process.exit(1)
    }
}
module.exports = configureDefaults()