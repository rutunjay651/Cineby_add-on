const { AddonBuilder } = require("stremio-addon-sdk")
const http = require("http")

const manifest = {
  id: "org.cineby.vidking",
  version: "1.0.0",
  name: "Cineby",
  description: "Watch movies from Cineby",
  resources: ["stream"],
  types: ["movie","series"],
  idPrefixes: ["tt"],
  catalogs: []
}

const builder = new AddonBuilder(manifest)

builder.defineStreamHandler(({ type }) => {

  let url

  if (type === "movie") {
    url = "https://www.vidking.net/embed/movie/1078605"
  } else {
    url = "https://www.vidking.net/embed/tv/119051/1/1"
  }

  return Promise.resolve({
    streams: [
      {
        title: "Cineby (Vidking)",
        url: url
      }
    ]
  })
})

const port = 7000

http.createServer(builder.getInterface()).listen(port)

console.log("Addon running on port " + port)
