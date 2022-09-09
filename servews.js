import { WebSocketServer, WebSocket } from "ws";
import * as jsonpatch from "fast-json-patch/index.mjs";

let wss;
let board;
let observer;

function startWebsocket(b, p) {
  const port = p || 8080;
  board = b;
  observer = jsonpatch.observe(board, (patch) => {
    if (patch.length === 0) return;
    const clients = [...wss.clients].filter(
      (client) => client.readyState === WebSocket.OPEN
    );
    if (clients.length === 0) return;
    const json = JSON.stringify(patch);
    clients.forEach((client) => {
      client.send(json);
    });
  });
  wss = new WebSocketServer({
    port,
    perMessageDeflate: true,
  });
  wss.on("connection", (ws) => {
    const patch = jsonpatch.compare({}, board);
    const json = JSON.stringify(patch);
    ws.send(json);
  });
  console.log(`Websocket listening on port ${port}`);
  setInterval(() => jsonpatch.generate(observer), 100);
}

export default { startWebsocket };
