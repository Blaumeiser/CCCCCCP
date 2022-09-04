import boards from "./boards.js";
import move from "./move.js";
import httpServe from "./serve.js";
import ws from "./servews.js";
import test from "./test.js";
import captures from "./captures.js";
import pineapples from "./pineapples.js";

test();

const board = {};

function restart() {
  Object.assign(board, boards.createNewBoard());
}

async function sendUpdates() {
  board.head = new Date().toISOString();
  board.segfault -= board.freq;
  if (board.segfault <= 0) {
    restart();
  }
  await move.moveCoders(board);
  captures.checkCaptures(board);
  //pineapples.spawnPineapple(board);
}

httpServe.serve();
ws.startWebsocket(board);
restart();
setInterval(sendUpdates, board.freq);
