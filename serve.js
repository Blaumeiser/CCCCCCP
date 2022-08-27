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

function handlePost(req, res) {
  res.end('{}');
}

export default function serve() {
  const port = 9000;

  http
    .createServer(function (req, res) {
      console.log(`${req.method} ${req.url}`);
      switch(req.method) {
        case 'POST':
          handlePost(req, res);
          break;
        case 'GET':
          handleGet(req, res);
          break;
        }
    })
    .listen(parseInt(port));

  console.log(`Server listening on port ${port}`);
}
