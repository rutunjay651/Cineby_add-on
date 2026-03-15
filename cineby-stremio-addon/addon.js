const { addonBuilder } = require("stremio-addon-sdk")
const https = require("https")
const manifest = require("./manifest.json")

const TMDB_API_KEY = "e4598ac9cb6d28883dac12852c670c5a"

const builder = new addonBuilder(manifest)

function fetch(url) {
    return new Promise((resolve, reject) => {

        const options = {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://www.vidking.net/"
            }
        }

        const req = https.get(url, options, (res) => {

            // follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetch(res.headers.location))
            }

            let data = ""

            res.on("data", chunk => data += chunk)

            res.on("end", () => resolve(data))
        })

        req.on("error", reject)

        // timeout protection
        req.setTimeout(10000, () => {
            req.destroy()
            reject(new Error("Request timeout"))
        })
    })
}

async function imdbToTmdb(imdbId) {

    const url =
        "https://api.themoviedb.org/3/find/" +
        imdbId +
        "?api_key=" +
        TMDB_API_KEY +
        "&external_source=imdb_id"

    const data = await fetch(url)
    const json = JSON.parse(data)

    if (json.movie_results && json.movie_results.length)
        return { type: "movie", id: json.movie_results[0].id }

    if (json.tv_results && json.tv_results.length)
        return { type: "tv", id: json.tv_results[0].id }

    return null
}

async function extractStream(embedUrl) {

    const html = await fetch(embedUrl)

    console.log("Embed page length:", html.length)

    const match = html.match(/https?:\\?\/\\?\/[^"' ]+\.(m3u8|mp4|mkv)[^"' ]*/)

    if (match) {
        console.log("Detected stream:", match[0])
        return match[0]
    }

    return null
}

builder.defineStreamHandler(async ({ type, id }) => {

    const imdbId = id.split(":")[0]

    const tmdb = await imdbToTmdb(imdbId)

    if (!tmdb)
        return { streams: [] }

    let embedUrl

    if (tmdb.type === "movie") {

        embedUrl = "https://www.vidking.net/embed/movie/" + tmdb.id

    } else {

        const season = id.split(":")[1]
        const episode = id.split(":")[2]

        embedUrl =
            "https://www.vidking.net/embed/tv/" +
            tmdb.id +
            "/" +
            season +
            "/" +
            episode
    }

    const streamUrl = await extractStream(embedUrl)

    if (!streamUrl) {
    return {
        streams: [
            {
                title: "Cineby Test",
                url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                type: "hls"
            }
        ]
    }
}

    return {
        streams: [
            {
                title: "Cineby 1080p",
                url: streamUrl,
                type: streamUrl.includes(".m3u8") ? "hls" : "mp4"
            }
        ]
    }

})

module.exports = builder.getInterface()
