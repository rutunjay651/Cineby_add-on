const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")
const https = require("https")

const TMDB_API_KEY = "PASTE_YOUR_TMDB_API_KEY_HERE"

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

function imdbToTmdb(imdbId) {
    return new Promise((resolve, reject) => {

        const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`

        https.get(url, (res) => {

            let data = ""

            res.on("data", chunk => data += chunk)

            res.on("end", () => {
                try {
                    const json = JSON.parse(data)

                    if (json.movie_results && json.movie_results.length > 0)
                        resolve(json.movie_results[0].id)

                    else if (json.tv_results && json.tv_results.length > 0)
                        resolve(json.tv_results[0].id)

                    else
                        resolve(null)

                } catch (err) {
                    resolve(null)
                }
            })

        }).on("error", () => resolve(null))

    })
}

builder.defineStreamHandler(async ({ type, id }) => {

    const imdbId = id.split(":")[0]

    const tmdbId = await imdbToTmdb(imdbId)

    if (!tmdbId)
        return { streams: [] }

    let streamUrl

    if (type === "movie") {

        streamUrl = `https://www.vidking.net/embed/movie/${tmdbId}`

    } else {

        const parts = id.split(":")
        const season = parts[1]
        const episode = parts[2]

        streamUrl = `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}`

    }

    return {
        streams: [
            {
                title: "Cineby (Vidking)",
                url: streamUrl
            }
        ]
    }

})

const addonInterface = builder.getInterface()

serveHTTP(addonInterface, { port: process.env.PORT || 7000 })
