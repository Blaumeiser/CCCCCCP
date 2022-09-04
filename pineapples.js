import crypto from "node:crypto";

function spawnPineapple(board) {
  const newPineapple = {
    id: crypto.randomUUID(),
    loc: [Math.random(), Math.random() * 0.5],
  };
  board.pineapples[newPineapple.id] = newPineapple;
  // console.log('spawnPineapple', Object.keys(data.pineapples));
  if (Object.keys(board.pineapples).length >= 10)
    ceasePineapple(board, Object.keys(board.pineapples)[0]);
}

function ceasePineapple(board, id) {
  // console.log('ceasePineapple', Object.keys(data.pineapples));
  delete board.pineapples[id];
}

export default { spawnPineapple, ceasePineapple };
