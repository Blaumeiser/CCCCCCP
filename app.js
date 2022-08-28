import { WebSocketServer, WebSocket } from "ws";
import https from 'node:https';
import serve from "./serve.js";
import test from "./test.js";
import crypto from 'node:crypto';
test();

const coder1 =  {
  id: crypto.randomUUID(),
  name: 'jb',
  webhook: "https://9000-blaumeiser-ccccccp-g8by99q83g4.ws-eu63.gitpod.io",
  avatar:
    "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
};

const squad1 = {
  id: crypto.randomUUID(),
  name: 'Special-projects-Squad',
  coders: {},
};

squad1.coders[coder1.id] = coder1;

const root = {
  freq: 1000,
  segfault: 1000 * 10 * 6,
  squads: { },
  pineapples: [[0.2, 0.2]],
};

root.squads[squad1.id] = squad1;

const root1 = {
  freq: 1000,
  segfault: 1000 * 10 * 6,
  squads: {
    "Special-Projects-Squad": {
      name: "Special-Projects-Squad",
      coders: {
        '0': {
          name: '0',
          avatar:
            "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
        },
        '1':{
          name: '1',
          avatar:
            "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
        },
        '2':{
          name:'2',
          avatar:
            "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
        },
      },
    },
    "VX":{
      name: "VX",
      coders: {
        '3':{
          name:'3',
          avatar:
            "https://www.pngkit.com/png/full/435-4356701_minus-frog-crafts-pond-life-gifs-kermit-the.png",
        },
        '4':{
          name:'4',
          avatar:
            "https://www.pngkit.com/png/full/435-4356701_minus-frog-crafts-pond-life-gifs-kermit-the.png",
        },
      },
    },
    "Aporia":{
      name: "Aporia",
      coders: {
        '5':{
          name:'5',
          avatar:
            "https://static.vecteezy.com/system/resources/thumbnails/000/242/794/small_2x/girl-with-wavy-hair-and-glasses.jpg",
          avatarSize: 0.02,
        },
      },
    },
  },
  pineapples: [
    [Math.random(), Math.random() * 0.5],
    [Math.random(), Math.random() * 0.5],
    [Math.random(), Math.random() * 0.5],
  ],
};

function objMap(obj, func) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v)]));
}

function newCoder(coder) {
  return {
    avatarSize: 0.01,
    //points: [[Math.random(), Math.random() * 0.25]],
    points: [[0.1, 0.1]],
    dir: Math.random() * Math.PI * 2,
    color:
      "#" +
      ("00000" + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6),
    ...coder,
  };
}

let data = {};
function restart() {
  data = JSON.parse(JSON.stringify(root));
  data.head = new Date().toISOString();
  Object.values(data.squads).forEach((squad) => (squad.coders = objMap(squad.coders, newCoder)));
  //data.pineapples = data.pineapples.map(() => [Math.random(), Math.random()]);
  const json = JSON.stringify({ full: data });
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {},
});
wss.on("connection", sendData);

function sendData(ws) {
  ws.send(JSON.stringify({ full: data }));
}

async function sendUpdates() {
  let diff = [];

  data.head = new Date().toISOString();
  diff.push({
    op: "replace",
    path: "/head",
    value: data.head,
  });

  data.segfault -= data.freq;
  if (data.segfault <= 0) {
    restart();
  }

  diff.push({
    op: "replace",
    path: "/segfault",
    value: data.segfault,
  });

  function moveCoderStraigth(coder) {
    const pineapplePoint = data.pineapples[0];
    const lastPoint = coder.points[coder.points.length - 1];
    const oposite = pineapplePoint[1] - lastPoint[1];
    const adjacent = pineapplePoint[0] - lastPoint[0];
    const dir = Math.atan(oposite / adjacent);
    coder.dir = dir;
    //const dirDiff = coder.dir - dir;
    //right(coder, dirDiff);
    forward(coder, 0.005);
  }

  function moveCoderRandom(coder) {
    right(coder, Math.random() * Math.PI * 0.25);
    forward(coder, Math.random() * 0.005);
  }

  function moveCoderLocal(board, squad, coder) {
    moveCoderStraigth(coder);
  }

  async function moveCoders(board) {
    for (const squad of Object.values(data.squads)) {
      for (const coder of Object.values(squad.coders)) {
        //moveCoderLocal(board, squad, coder);
        await moveCoderRemote(board, squad, coder);

        const lastPoint = coder.points.slice(-1)[0];
        diff.push({
          op: "add",
          path: `/squads/${squad.id}/coders/${coder.id}/points/-`,
          value: lastPoint,
        });
       }
    }
  }

  function moveCoderRemote(board, squad, coder) {
    return new Promise((resolve, reject) => {
      const state  =  {
        coderName: coder.name,
        board
      };
      const json = JSON.stringify(state);
      const options = {
        method: 'POST',
        timeout: 1000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(json)
      }
    };
      const url = coder.webhook;

      const request = https.request(url, options, async (res) => {
        const buffers = [];
        for await (const chunk of res) {
          buffers.push(chunk);
        }
        const json = Buffer.concat(buffers).toString();
        if (json.length) {
          const obj  = JSON.parse(json);
          // console.log(obj);
          right(coder, obj.right);
          forward(coder, obj.forward);
          resolve();
        }
      });
      request.on('timeout', () => {
        request.destroy();
    });
    request.on('error', (e) => {
        // console.error(e);
      })
      request.write(json);
      request.end();
    });
  }

  function spawnPineapple() {
    const newPineapple = [Math.random(), Math.random() * 0.5];
    data.pineapples.push(newPineapple);
    diff.push({
      op: "add",
      path: "/pineapples/-",
      value: newPineapple,
    });
    if (data.pineapples.length >= 10) ceasePineapple(0);
  }

  function ceasePineapple(id) {
    data.pineapples.slice(id, 1);
    diff.push({
      op: "remove",
      path: `/pineapples/${id}`,
    });
  }

  function countCapture(squad, coder) {
    // Todo
  }

  function checkCapture(pinappleId, squad, coder) {
    const pineapple = data.pineapples[pinappleId];
    const posPineapple = pineapple;
    const coderPoint = coder.points.slice(-1)[0];
    const distance = Math.hypot(
      posPineapple[0] - coderPoint[0],
      posPineapple[1] - coderPoint[0]
    );
    if (distance < 0.01) {
      ceasePineapple(pinappleId);
      countCapture(squad, coder);
      spawnPineapple();
    }
  }

  function checkCaptures() {
    for (let p = 0; p < data.pineapples.length; p++) {
      for (const squad of Object.values(data.squads)) {
        for (const coder of Object.values(squad.coders)) {
          checkCapture(p, squad, coder);
        }
      }
    }
  }

  function getPublicBoardState() {
    let obj = {};
    obj.squads = objMap(data.squads, squad => ( {
      id: squad.id,
      name: squad.name,
      coders : objMap(squad.coders, coder => ({
        id: coder.id,
        name: coder.name,
        point: coder.points.slice(-1)[0],
        direction: coder.direction
      }))
    }));
    return obj;
  }

  const board = getPublicBoardState();
  await moveCoders(board);
  checkCaptures();
  //spawnPineapple();

  const json = JSON.stringify({ diff });
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

function forward(coder, dist) {
  const lastPoint = coder.points[coder.points.length - 1];
  const x = lastPoint[0] + dist * Math.cos(coder.dir);
  const y = lastPoint[1] + dist * Math.sin(coder.dir);
  coder.points.push([x, y]);
}

function left(coder, angle) {
  coder.dir -= angle;
}

function right(coder, angle) {
  coder.dir += angle;
}

serve();
restart();
setInterval(sendUpdates, data.freq);
