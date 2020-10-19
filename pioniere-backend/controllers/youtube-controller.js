var YTAPIClient = require('../lib/youtube-api-client');

class YoutubeController {
    constructor(){
        this.client = new YTAPIClient();
    }


}

module.exports = YoutubeController