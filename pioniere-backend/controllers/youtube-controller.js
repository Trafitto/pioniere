var { google } = require('googleapis');

class YoutubeController {
    constructor() {
        this.client = google.youtube({
            version: "v3",
            auth: process.env.YOUTUBE_API_KEY
        });
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
     * Get all video ids from a 'search.list' result items list
     * 
     * @param {object[]} items - Youtube API results
     */
    _collectPageVideoIds(items) {
        return items.map(item => item.id.videoId)
    }

    /**
     * Create an object where video IDs are keys, and 'snippet' is the value
     * useful when extracting video statistics
     * 
     * @param {object[]} items - Youtube API results
     */
    _remapSearchResults(items) {
        return items.reduce((map, item) => {
            map[item.id.videoId.toString()] = item.snippet;
            return map;
        }, {});
    }

    /**
     * Create an object where video IDs are keys
     * and their viewCount is value
     * 
     * @param {object[]} items - Youtube API results
     */
    _remapStatisticResults(items) {
        return items.reduce((map, item) => {
            map[item.id.toString()] = parseInt(item.statistics.viewCount);
            return map;
        }, {});
    }

    /**
     * Send an API call to Google
     * implemented a basic counter to check how many requests are being made to Youtube
     * 
     * @param {object} params - Youtube API search params
     */
    _doSearch(params) {
        return this.client.search.list(params).then(res => {
            return res.data;
        })
    }

    /**
     * Retrieve all statistics for a list of videos
     * 
     * @param {string[]} videoIds - List of retrieved video IDs
     */
    _getVideoStatistics(videoIds) {
        return this.client.videos.list({
            part: "statistics",
            id: videoIds.join(',')
        }).then(res => res.data)
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
        let targetPage = null

        // Fetch first page to check number of total results
        try {
            targetPage = await this._doSearch(this._collectSearchParams(query));
            nextPageToken = targetPage.pageToken;
            totalResults = targetPage.pageInfo.totalResults;
            pagesNumber = Math.floor(totalResults / 50);
        } catch (e) {
            throw new Error(`Unable to fetch Youtube results, error: ${e.response.data.error.message}`);
        }

        /*
        // Move to a specific page
        if (pagesNumber > 20) {
            throw new Error("too many pages to fetch, please restrict your search");
        }
        const nextPage = Math.floor(pagesNumber / 2);
        try {
            targetPage = await this._moveToPage(nextPage, query, nextPageToken);
        } catch (e) {
            console.error(e);
            throw e;
        }
        */

        const pageItems = targetPage.items;
        if(!targetPage.items.length){
            throw new Error("There are no results for this search");
        }

        const pageVideoIds = this._collectPageVideoIds(pageItems);

        let pageViews = null;
        try {
            pageViews = await this._getVideoStatistics(pageVideoIds)
                .then(data => this._remapStatisticResults(data.items));
        } catch (e) {
            throw new Error(`Unable to retrieve page statistics, error: ${e.response.data.error.message}`);
        }

        return pageViews;
    }
}

module.exports = YoutubeController