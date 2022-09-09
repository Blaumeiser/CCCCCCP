import http from "http";
import url from "url";
import fs from "fs";
import path from "path";

function handleGet(req, res) {
  const root = "wwwroot";
  const map = {
    ".ico": "image/x-icon",
    ".html": "text/html",
  };
  const parsedUrl = url.parse(req.url);
  let pathname = `wwwroot${parsedUrl.pathname}`;
  let ext = path.parse(pathname).ext;
  if (!ext) ext = ".html";

  fs.stat(pathname, function (err, stat) {
    if (err) {
      res.statusCode = 404;
      res.end(`${err}`);
    } else {
      if (stat.isDirectory()) pathname += "index" + ext;

      fs.readFile(pathname, function (err, data) {
        if (err) {
          res.statusCode = 404;
          res.end(`${err}`);
        } else {
          res.setHeader("Content-type", map[ext] || "text/plain");
          res.end(data);
        }
      });
    }
  });
}

async function handlePost(req, res) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const json = Buffer.concat(buffers).toString();
  const publicBoard = JSON.parse(json);
  console.log(publicBoard);
  const pineapplePoint = Object.values(publicBoard.pineapples).at(0).loc;
  const lastPoint = coder.points.at(-1);
  const deltaX = pineapplePoint[0] - lastPoint.loc[0];
  const deltaY = pineapplePoint[1] - lastPoint.loc[1];
  const dir = Math.atan2(deltaY, deltaX);
  coder.dir = dir;

  const right = Math.random() * Math.PI * 0.25;
  const ret = {
    right,
  };
  const retJson = JSON.stringify(ret);
  res.end(retJson);
}

function serve(p) {
  const port = p || 9000;

  http
    .createServer(function (req, res) {
      // console.log(`${req.method} ${req.url}`);
      switch (req.method) {
        case "POST":
          handlePost(req, res);
          break;
        case "GET":
          handleGet(req, res);
          break;
      }
    })
    .listen(parseInt(port));

  console.log(`HTTP-Server listening on port ${port}`);
}

export default { serve };
