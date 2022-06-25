import { WebSocketServer, WebSocket } from "ws";
import rfc6902 from "rfc6902";

const squads = [
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
];

function newCoder(avatar) {
  return {
    avatarSize: 0.01,
    points: [[Math.random(), Math.random() * 0.25]],
    dir: Math.random() * 360,
    color:
      "#" +
      ("00000" + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6),
    ...avatar,
  };
}

let data = {};
function restart() {
  data.head = new Date().toISOString();
  data.squads = JSON.parse(JSON.stringify(squads));
  data.squads.forEach((squad) => (squad.coders = squad.coders.map(newCoder)));

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
  data.head = new Date().toISOString();
  let diff = [];

  diff.push({
    op: "replace",
    path: "/head",
    value: data.head,
  });

  function moveCoder(squadId, coderId, coder) {
    right(coder, Math.random() * 25);
    forward(coder, Math.random() * 0.005);
    const lastPoint = coder.points[coder.points.length - 1];
    diff.push({
      op: "add",
      path: `/squads/${squadId}/coders/${coderId}/points/-`,
      value: lastPoint,
    });
  }

  for (let i = 0; i < data.squads.length; i++) {
    const squad = data.squads[i];
    for (let j = 0; j < squad.coders.length; j++) {
      const coder = squad.coders[j];
      moveCoder(i, j, coder);
    }
  }

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
  coder.dir -= angle * (Math.PI / 180);
}

function right(coder, angle) {
  coder.dir += angle * (Math.PI / 180);
}

restart();
//setInterval(restart, 10000);
setInterval(sendUpdates, 250);
