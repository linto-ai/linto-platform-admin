/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// The `https` setting requires the `fs` module. Uncomment the following
// to make it available:

module.exports = {
  // the tcp port that the Node-RED web server is listening on
  // uiPort: process.env.RED_HTTP_PORTS[0], // 3001, first value
  httpRoot: "/rededitor",
  flowFile: "flows.json",
  disableList: ['sentiment', 'link', 'exec', 'email', 'template', 'delay', 'trigger', 'rpi-gpio', 'tls', 'websocket', 'watch', 'tcpin', 'udp', 'switch', 'change', 'range', 'sort', 'batch', 'CSV', 'HTML', 'JSON', 'XML', 'YAML', 'tail', 'file', 'feedparse', 'rbe', 'twitter'],
  functionGlobalContext: {
    tock: {
      url: process.env.TOCK_URL,
      authToken: "Basic " + new Buffer.from(process.env.TOCK_USER + ":" + process.env.TOCK_PASSWORD).toString("base64")
    }
  },
  // enables global context
  // Customising the editor
  paletteCategories: ['nlu', 'stt', 'setting', 'skills', 'subflows', 'input', 'output', 'function', 'social', 'mobile', 'storage', 'analysis', 'advanced'],
  editorTheme: {
    page: {
      title: "Room configuration",
      css: `${process.cwd()}/public/css/nodered-custom.css`,
      scripts: [`${process.cwd()}/public/js/nodered-custom.js`] // As of 0.17
    },
    header: {
      title: "LinTO",
      image: `${process.cwd()}/public/img/nodered-linto-logo.png`, // or null to remove image
      url: "" // optional url to make the header text/image a link to this url
    },
    palette: {
      editable: true, // Enable/disable the Palette Manager
      catalogues: [ // Alternative palette manager catalogues
        'https://catalogue.nodered.org/catalogue.json'
      ]
    },
    projects: {
      // To enable the Projects feature, set this value to true
      enabled: false
    },
    menu: {
      "menu-item-edit-palette": true
    },
    userMenu: false, // Hide the user-menu even if adminAuth is enabled
  }
}