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

        https.get(url, options, (res) => {

            let data = ""

            res.on("data", chunk => data += chunk)

            res.on("end", () => resolve(data))

        }).on("error", reject)

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

    const match = html.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/)

    if (match)
        return match[0]

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

    if (!streamUrl)
        return { streams: [] }

    return {
        streams: [
            {
                title: "Cineby 1080p",
                url: streamUrl,
                type: "hls"
            }
        ]
    }

})

module.exports = builder.getInterface()
