import http from "http";
import url from "url";
import fs from "fs";
import path from "path";

export default function serve() {
  const port = 9000;
  const root = "wwwroot";
  const map = {
    ".ico": "image/x-icon",
    ".html": "text/html",
  };

  http
    .createServer(function (req, res) {
      console.log(`${req.method} ${req.url}`);
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
    })
    .listen(parseInt(port));

  console.log(`Server listening on port ${port}`);
}
