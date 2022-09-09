import boards from "./boards.js";
import move from "./move.js";
import httpServe from "./serve.js";
import wsServe from "./servews.js";
import test from "./test.js";
import captures from "./captures.js";
import pineapples from "./pineapples.js";

test();

const world = {};

function restart() {
  if (!!world.boardId) delete world[world.boardId];
  const newBoard = boards.createNewBoard();
  world.boardId = newBoard.id;
  world[world.boardId] = newBoard;
}

async function sendUpdates() {
  const board = world[world.boardId];
  board.head = new Date().toISOString();
  if (board.gamestart + board.segfaultingIn <= new Date().getTime()) {
    restart();
  }
  await move.moveCoders(board);
  captures.checkCaptures(board);
  //pineapples.spawnPineapple(board);
}

httpServe.serve();
wsServe.startWebsocket(world);
restart();
setInterval(sendUpdates, world[world.boardId].freq);
