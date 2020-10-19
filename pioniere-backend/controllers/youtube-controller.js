var { google } = require('googleapis');
const { redis } = require('googleapis/build/src/apis/redis');

class YoutubeController {
    constructor() {
        this.client = google.youtube({
            version: "v3",
            auth: process.env.YOUTUBE_API_KEY
        });
    }

    _doSearch(query) {
        return this.client.search.list({
            part: "snippet",
            type: "video",
            maxResults: 50,
            q: query
        }).then(res => res.data)
            .then(data => data.items)
    }

    getVideoStatistics(videoIDs) {
        return this.client.videos.list({
            part: "statistics",
            id: videoIDs.join(',')
        }).then(res => res.data)
            .then(data => {
                console.log(data)
                return data
            })
    }

    getFirstResultPage(search, expectedViewCount) {
        return this._doSearch(search);
    }

    getResultsForIMG(expectedViewCount) {
        return this._doSearch("IMG_");
    }
}

module.exports = YoutubeController