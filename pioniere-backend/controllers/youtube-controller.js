var { google } = require('googleapis');

class YoutubeController {
    constructor() {
        this.client = google.youtube({
            version: "v3",
            auth: process.env.YOUTUBE_API_KEY
        });
        this.SEARCH_COUNTER = 0;
    }

    /**
     * Create the object required to call Youtube APIs
     * 
     * @param {string} query - The search term
     */
    _collectSearchParams(query) {
        return {
            part: "snippet",
            type: "video",
            maxResults: 50,
            q: query,
            order: "viewCount"
        }
    }

    /**
     * Create an object where video IDs are keys, and 'snippet' is the value
     * useful when extracting video statistics
     * 
     * @param {object[]} items - Youtube API results
     */
    _remapSearchResults(items) {
        return items.reduce((map, item) => {
            map[item.id.videoId] = item.snippet
            return map
        }, {})
    }

    /**
     * Send an API call to Google
     * implemented a basic counter to check how many requests are being made to Youtube
     * 
     * @param {object} params - Youtube API search params
     */
    _doSearch(params) {
        return this.client.search.list(params).then(res => {
            console.log(`Search counter: ${this.SEARCH_COUNTER}`);
            this.SEARCH_COUNTER++;
            return res.data;
        })
    }

    /**
     * Send API calls to Youtube and increase currentPage until
     * reaches 'pageNumber' provided, then return that page's response
     * Recursive 'fetchPage' inside
     * 
     * 
     * @param {int} pageNumber - Target page number
     * @param {string} query - The search term
     * @param {string} pageToken - The first pageToken to be used
     */
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

    /**
     * The method which starts the algorithm
     * 
     * @param {string} query - The search term
     * @param {int} maxResults - The number of maximum filtered results
     * @param {int} expectedViews - Target number of views
     */
    async getLessViews(query, maxResults = 10, expectedViews = 100) {
        let totalResults = null;
        let pagesNumber = null;

        let nextPageToken = null
        let firstSearchResult = null

        // Fetch first page to check number of total results
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

        // Move to a specific page
        const nextPage = Math.floor(pagesNumber / 2);
        let targetPage = null;
        try {
            targetPage = await this._moveToPage(nextPage, query, nextPageToken);
        } catch (e) {
            console.error(e);
            throw e;
        }

        console.log(targetPage);

        // TODO get target page video views
    }
}

module.exports = YoutubeController