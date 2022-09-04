import pineapples from "./pineapples.js";

function countCapture(squad, coder) {
  // Todo
}

function checkCapture(board, pineapple, squad, coder) {
  const posPineapple = pineapple.loc;
  const coderPoint = coder.points.at(-1);
  const distance = Math.hypot(
    posPineapple[0] - coderPoint.loc[0],
    posPineapple[1] - coderPoint.loc[1]
  );
  if (distance < 0.01) {
    pineapples.ceasePineapple(board, pineapple.id);
    countCapture(squad, coder);
    pineapples.spawnPineapple(board);
  }
}

function checkCaptures(board) {
  for (const pineapple of Object.values(board.pineapples)) {
    for (const squad of Object.values(board.squads)) {
      for (const coder of Object.values(squad.coders)) {
        checkCapture(board, pineapple, squad, coder);
      }
    }
  }
}

export default { checkCaptures };
