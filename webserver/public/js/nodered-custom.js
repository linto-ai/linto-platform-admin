// NB: axios.min.js is included in nodered.settings.js
// NB: this file is included in nodered.settings.js
/*
const iframe = window.frameElement;
const appUrl = iframe.getAttribute('appUrl');
const apiUri = appUrl + '/api';
const contextFrame = iframe.getAttribute('contextFrame');
async function getFullFlow() {
  return RED.nodes.createCompleteNodeSet();
}

if (contextFrame == 'room-manage') {
  RED.events.on('nodes:change', async function () {
    try {
      const fullFlow = await getFullFlow();
      const iframe = window.frameElement;
      const roomId = iframe.getAttribute('roomId');
      let room = await fetch(new Request(`${apiUri}/room/${roomId}`), {
        method: 'get',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        })
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return data
        })

      room.nodeRedDraft = fullFlow;

      await fetch(new Request(`${apiUri}/room/${roomId}`), {
        method: 'put',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(room)
      })
    } catch (e) {
      console.error(e);
    }
  })
} else if (contextFrame == 'pattern-manager') {
  RED.events.on('nodes:change', async function () {
    try {
      const fullFlow = await getFullFlow();
      let updateTmp = await fetch(new Request(`${apiUri}/flow/tmp`), {
        method: 'put',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ 'payload': fullFlow })
      })
      if (updateTmp.status !== 200) {
        console.error('error on updating datas')
      }
    } catch (err) {
      console.error(err)
    }
  })
}*/

console.log('bonjour NODERED')
