import boards from "./boards.js";
import https from "node:https";

function moveCoderStraigth(publicBoard, squad, coder) {
  const pineapplePoint = Object.values(publicBoard.pineapples).at(0).loc;
  const lastPoint = coder.points.at(-1);
  const deltaX = pineapplePoint[0] - lastPoint.loc[0];
  const deltaY = pineapplePoint[1] - lastPoint.loc[1];
  const dir = Math.atan2(deltaY, deltaX);
  let dirDiff = dir - coder.dir;
  if (dirDiff < -Math.PI) dirDiff += 2 * Math.PI;
  return Promise.resolve({ right: dirDiff });
}

function moveCoderRandom() {
  return Promise.resolve({ right: Math.random() * Math.PI * 0.25 });
}

function moveCoderRemote(publicBoard, squad, coder) {
  return new Promise((resolve, reject) => {
    const state = {
      squadId2Move: squad.id,
      coderId2Move: coder.id,
      board: publicBoard,
    };
    const json = JSON.stringify(state);
    const options = {
      method: "POST",
      timeout: 1000,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(json),
      },
    };

    const request = https.request(coder.webhook, options, async (res) => {
      const buffers = [];
      for await (const chunk of res) {
        buffers.push(chunk);
      }
      const json = Buffer.concat(buffers).toString();
      if (json.length) {
        const obj = JSON.parse(json);
        resolve(obj);
      }
    });
    request.on("timeout", () => {
      request.destroy();
    });
    request.on("error", (e) => {
      // console.error(e);
    });
    request.write(json);
    request.end();
  });
}

function moveCoderForward(coder, dist) {
  const lastPoint = coder.points.at(-1);
  const x = lastPoint.loc[0] + dist * Math.cos(coder.dir);
  const y = lastPoint.loc[1] + dist * Math.sin(coder.dir);
  coder.points.push({ loc: [x, y] });
}

function moveCoderLeft(coder, angle) {
  coder.dir -= angle;
}

function moveCoderRight(coder, angle) {
  coder.dir += angle;
}

async function moveCoders(board) {
  const publicBoard = boards.getPublicBoardState(board);
  const arr = [];
  for (const squad of Object.values(board.squads)) {
    for (const coder of Object.values(squad.coders)) {
      const movePromise = moveCoderStraigth(publicBoard, squad, coder);
      //const movePromise = moveCoderRandom();
      //const movePromise = moveCoderRemote(publicBoard, squad, coder);
      const p = movePromise.then((move) => {
        const maxDirDiff = publicBoard.maxDirDiff;
        let right = move.right || 0;
        if (right > maxDirDiff) right = maxDirDiff;
        else if (right < -maxDirDiff) right = -maxDirDiff;
        moveCoderRight(coder, right);
        moveCoderForward(coder, publicBoard.forwardStep);
      });
      arr.push(p);
    }
  }
  await Promise.all(arr);
}

export default { moveCoders };
