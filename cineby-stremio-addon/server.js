const http = require("http");

const PORT = 7000;

const manifest = require("./manifest.json");

const server = http.createServer((req, res) => {

  if (req.url === "/manifest.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(manifest));
    return;
  }

  if (req.url.startsWith("/stream/")) {
    const response = {
      streams: [
        {
          title: "Cineby (Vidking)",
          url: "https://www.vidking.net/embed/movie/1078605"
        }
      ]
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Addon running on port " + PORT);
});
