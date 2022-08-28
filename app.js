import { WebSocketServer, WebSocket } from "ws";
import https from 'node:https';
import serve from "./serve.js";
import test from "./test.js";
import board from "./board.js";
import pineapple from "./pineapple.js";
test();

function objMap(obj, func) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v)]));
}

let data = {};

function restart() {
  data = board.create();
  data.head = new Date().toISOString();
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
  const diff = [];

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
    const pineapplePoint = Object.values(data.pineapples).at(0).loc;
    const lastPoint = coder.points.at(-1);
    const oposite = pineapplePoint[1] - lastPoint.loc[1];
    const adjacent = pineapplePoint[0] - lastPoint.loc[0];
    const dir = Math.atan(oposite / adjacent);
    coder.dir = dir;
    //const dirDiff = coder.dir - dir;
    //right(coder, dirDiff);
    moveCoderForward(coder, 0.005);
  }

  function moveCoderRandom(coder) {
    moveCoderRight(coder, Math.random() * Math.PI * 0.25);
    moveCoderForward(coder, Math.random() * 0.005);
  }

  async function moveCoderLocal(board, squad, coder) {
    moveCoderStraigth(coder);
    return {squad, coder};
  }

  async function moveCoders(board) {
    const arr = [];
    for (const squad of Object.values(data.squads)) {
      for (const coder of Object.values(squad.coders)) {
        const movePromise = moveCoderLocal(board, squad, coder);
        //const movePromise = moveCoderRemote(board, squad, coder);
        arr.push(movePromise);
      }
    }
    await Promise.all(arr);
    for(const move of arr) {
      const result  = await move;
      const lastPoint = result.coder.points.at(-1);
      diff.push({
        op: "add",
        path: `/squads/${result.squad.id}/coders/${result.coder.id}/points/-`,
        value: lastPoint,
      });
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
          moveCoderRight(coder, obj.right);
          moveCoderForward(coder, obj.forward);
          resolve({squad, coder});
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
    const newPineapple = {id: crypto.randomUUID(), loc: [Math.random(), Math.random() * 0.5] };
    data.pineapples[newPineapple.id] = newPineapple;
    // console.log('spawnPineapple', Object.keys(data.pineapples));
    diff.push({
      op: "add",
      path: "/pineapples/-",
      value: newPineapple,
    });
    if (Object.keys(data.pineapples).length >= 10) ceasePineapple(Object.keys(data.pineapples)[0]);
  }

  function ceasePineapple(id) {
    // console.log('ceasePineapple', Object.keys(data.pineapples));
    delete data.pineapples[id];
    diff.push({
      op: "remove",
      path: `/pineapples/${id}`,
    });
  }

  function countCapture(squad, coder) {
    // Todo
  }

  function checkCapture(pineapple, squad, coder) {
    const posPineapple = pineapple.loc;
    const coderPoint = coder.points.at(-1);
    const distance = Math.hypot(
      posPineapple[0] - coderPoint.loc[0],
      posPineapple[1] - coderPoint.loc[1]
    );
    if (distance < 0.01) {
      ceasePineapple(pineapple.id);
      countCapture(squad, coder);
      spawnPineapple();
    }
  }

  function checkCaptures() {
    for (const pineapple of Object.values(data.pineapples)) {
      for (const squad of Object.values(data.squads)) {
        for (const coder of Object.values(squad.coders)) {
          checkCapture(pineapple, squad, coder);
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
        point: coder.points.at(-1),
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

function moveCoderForward(coder, dist) {
  const lastPoint = coder.points.at(-1);
  const x = lastPoint.loc[0] + dist * Math.cos(coder.dir);
  const y = lastPoint.loc[1] + dist * Math.sin(coder.dir);
  coder.points.push({loc:[x, y]});
}

function moveCoderLeft(coder, angle) {
  coder.dir -= angle;
}

function moveCoderRight(coder, angle) {
  coder.dir += angle;
}

serve();
restart();
setInterval(sendUpdates, data.freq);
