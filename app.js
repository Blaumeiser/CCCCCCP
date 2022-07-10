import { WebSocketServer, WebSocket } from "ws";
import serve from "./serve.js";
import test from "./test.js";
//test();

const root = {
  freq: 1000,
  segfault: 1000 * 10 * 6,
  squads: [
    {
      name: "Special-Project-Squad",
      coders: [
        {
          avatar:
            "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
        },
      ],
    },
  ],
  pineapples: [[0.2, 0.2]],
};

const root1 = {
  freq: 1000,
  segfault: 1000 * 10 * 6,
  squads: [
    {
      name: "Special-Project-Squad",
      coders: [
        {
          avatar:
            "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
        },
        {
          avatar:
            "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
        },
        {
          avatar:
            "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
        },
      ],
    },
    {
      name: "VX",
      coders: [
        {
          avatar:
            "https://www.pngkit.com/png/full/435-4356701_minus-frog-crafts-pond-life-gifs-kermit-the.png",
        },
        {
          avatar:
            "https://www.pngkit.com/png/full/435-4356701_minus-frog-crafts-pond-life-gifs-kermit-the.png",
        },
      ],
    },
    {
      name: "Aporia",
      coders: [
        {
          avatar:
            "https://static.vecteezy.com/system/resources/thumbnails/000/242/794/small_2x/girl-with-wavy-hair-and-glasses.jpg",
          avatarSize: 0.02,
        },
      ],
    },
  ],
  pineapples: [
    [Math.random(), Math.random() * 0.5],
    [Math.random(), Math.random() * 0.5],
    [Math.random(), Math.random() * 0.5],
  ],
};

function newCoder(avatar) {
  return {
    avatarSize: 0.01,
    //points: [[Math.random(), Math.random() * 0.25]],
    points: [[0.1, 0.1]],
    dir: Math.random() * Math.PI * 2,
    color:
      "#" +
      ("00000" + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6),
    ...avatar,
  };
}

let data = {};
function restart() {
  data = JSON.parse(JSON.stringify(root));
  data.head = new Date().toISOString();
  data.squads.forEach((squad) => (squad.coders = squad.coders.map(newCoder)));
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

function sendUpdates() {
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

  function moveCoder(squadId, coderId) {
    const squad = data.squads[squadId];
    const coder = squad.coders[coderId];
    moveCoderStraigth(coder);
    const lastPoint = coder.points[coder.points.length - 1];
    diff.push({
      op: "add",
      path: `/squads/${squadId}/coders/${coderId}/points/-`,
      value: lastPoint,
    });
  }

  function moveCoders() {
    for (let i = 0; i < data.squads.length; i++) {
      for (let j = 0; j < data.squads[i].coders.length; j++) {
        moveCoder(i, j);
      }
    }
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
    data.pineapples.splice(id, 1);
    diff.push({
      op: "remove",
      path: `/pineapples/${id}`,
    });
  }

  function countCapture(squadId, coderId) {
    const squad = data.squads[squadId];
    const coder = squad.coders[coderId];
    // Todo
  }

  function checkCapture(pinappleId, squadId, coderId) {
    const pineapple = data.pineapples[pinappleId];
    const squad = data.squads[squadId];
    const coder = squad.coders[coderId];
    const posPineapple = pineapple;
    const coderPoint = coder.points[coder.points.length - 1];
    const distance = Math.hypot(
      posPineapple[0] - coderPoint[0],
      posPineapple[1] - coderPoint[0]
    );
    if (distance < 0.01) {
      ceasePineapple(pinappleId);
      countCapture(squadId, coderId);
      spawnPineapple();
    }
  }

  function checkCaptures() {
    for (let p = 0; p < data.pineapples.length; p++) {
      for (let i = 0; i < data.squads.length; i++) {
        const squad = data.squads[i];
        for (let j = 0; j < squad.coders.length; j++) {
          checkCapture(p, i, j);
        }
      }
    }
  }

  moveCoders();
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
