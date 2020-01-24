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
const debug = require('debug')('linto-admin:routes')

module.exports = (webServer) => {
  return {
    "/": require('./_root')(webServer),
    "/login": require('./login')(webServer),
    "/admin": require('./admin')(webServer),
    "/api": require('./api')(webServer),
    "/api/flow": require('./api/flow')(webServer),
    "/api/tock": require('./api/tock')(webServer),
    "/api/lintos": require('./api/lintos')(webServer),
    "/api/context": require('./api/context')(webServer),
    "/api/stt": require('./api/stt')(webServer)
  }
}
