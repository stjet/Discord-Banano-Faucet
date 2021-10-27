let http = require('http');

http.createServer(function (req, res) {
  res.write("Starting...");
  res.write("I'm alive");
  res.end();
}).listen(8080);