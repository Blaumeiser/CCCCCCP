import { WebSocketServer, WebSocket } from "ws";
import * as jsonpatch from "fast-json-patch/index.mjs";

let wss;
let board;
let observer;

function startWebsocket(b, p) {
  const port = p || 8080;
  board = b;
  observer = jsonpatch.observe(board);
  wss = new WebSocketServer({
    port,
    perMessageDeflate: true,
  });
  wss.on("connection", sendCompleteBoard);
  console.log(`Websocket listening on port ${port}`);
  setInterval(sendPatch, 100);
}

function sendCompleteBoard(ws) {
  const patch = jsonpatch.compare({}, board);
  const json = JSON.stringify(patch);
  ws.send(json);
}

function sendPatch() {
  const patch = jsonpatch.generate(observer);
  //console.log(patch);
  if (patch.length > 0) {
    const json = JSON.stringify(patch);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    });
  }
}
export default { startWebsocket };
