import boards from "./boards.js";
import https from "node:https";

function moveCoderStraigth(publicBoard, squad, coder) {
  const pineapplePoint = Object.values(publicBoard.pineapples).at(0).loc;
  const lastPoint = coder.points.at(-1);
  const oposite = pineapplePoint[1] - lastPoint.loc[1];
  const adjacent = pineapplePoint[0] - lastPoint.loc[0];
  const dir = Math.atan(oposite / adjacent);
  coder.dir = dir;
  //const dirDiff = coder.dir - dir;
  //right(coder, dirDiff);
  moveCoderForward(coder, 0.005);
  return Promise.resolve();
}

function moveCoderRandom(publicBoard, squad, coder) {
  moveCoderRight(coder, Math.random() * Math.PI * 0.25);
  moveCoderForward(coder, Math.random() * 0.005);
  return Promise.resolve();
}

function moveCoderRemote(publicBoard, squad, coder) {
  return new Promise((resolve, reject) => {
    const state = {
      coderName: coder.name,
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
    const url = coder.webhook;

    const request = https.request(url, options, async (res) => {
      const buffers = [];
      for await (const chunk of res) {
        buffers.push(chunk);
      }
      const json = Buffer.concat(buffers).toString();
      if (json.length) {
        const obj = JSON.parse(json);
        // console.log(obj);
        moveCoderRight(coder, obj.right);
        moveCoderForward(coder, obj.forward);
        resolve();
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
      //const movePromise = moveCoderRandom(publicBoard, squad, coder);
      //const movePromise = moveCoderRemote(publicBoard, squad, coder);
      arr.push(movePromise);
    }
  }
  await Promise.all(arr);
}

export default { moveCoders };
