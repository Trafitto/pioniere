var { google } = require('googleapis');

class YoutubeController {
    constructor() {
        this.client = google.youtube({
            version: "v3",
            auth: process.env.YOUTUBE_API_KEY
        });
        this.SEARCH_COUNTER = 0;
    }

    _collectSearchParams(query) {
        return {
            part: "snippet",
            type: "video",
            maxResults: 50,
            q: query,
            order: "viewCount"
        }
    }

    _remapSearchResults(items) {
        return items.reduce((map, item) => {
            map[item.id.videoId] = item.snippet
            return map
        }, {})
    }

    _doSearch(params) {
        return this.client.search.list(params).then(res => {
            console.log(`Search counter: ${this.SEARCH_COUNTER}`);
            this.SEARCH_COUNTER++;
            return res.data;
        })
    }

    async _moveToPage(pageNumber, query, pageToken) {
        let currentPage = 1

        const fetchPage = (pageToken) => {
            return this._doSearch({
                ...this._collectSearchParams(query),
                pageToken
            }).then(data => {
                currentPage++
                if (currentPage === pageNumber) {
                    return data;
                } else {
                    if (!data.nextPageToken) throw new Error('page token missing');
                    return fetchPage(data.nextPageToken);
                }
            })
        }

        return fetchPage(pageToken);
    }

    async getLessViews(query, maxResults = 10, expectedViews = 100) {
        let totalResults = null;
        let pagesNumber = null;

        let nextPageToken = null
        let firstSearchResult = null

        try {
            firstSearchResult = await this._doSearch(this._collectSearchParams(query));
            nextPageToken = firstSearchResult.pageToken;
            totalResults = firstSearchResult.pageInfo.totalResults;
            pagesNumber = Math.floor(totalResults / 50);
        } catch (e) {
            throw new Error(`Unable to fetch Youtube results, error: ${e.response.data.error.message}`);
        }

        if (pagesNumber > 20) {
            throw new Error("too many pages to fetch, please restrict your search");
        }

        const nextPage = Math.floor(pagesNumber / 2);
        let targetPage = null;
        try {
            targetPage = await this._moveToPage(nextPage, query, nextPageToken);
        } catch (e) {
            console.error(e);
            throw e;
        }

        console.log(targetPage);
    }

    getResults(query) {
        return this.getLessViews(query);
    }
}

module.exports = YoutubeController