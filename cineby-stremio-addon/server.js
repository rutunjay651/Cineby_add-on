const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")

const manifest = {
    id: "org.cineby.vidking",
    version: "1.0.0",
    name: "Cineby",
    description: "Watch movies and series from Cineby",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"]
}

const builder = new addonBuilder(manifest)

builder.defineStreamHandler(({ type, id }) => {

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

const addonInterface = builder.getInterface()

serveHTTP(addonInterface, { port: process.env.PORT || 7000 })
