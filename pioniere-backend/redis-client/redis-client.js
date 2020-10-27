var redis = require('redis');

class RedisClient {
    constructor() {
        this.client= this.getClient()
        this.client.on('error', function (err) {
            console.log('Error ' + err);
        }); 
        
        this.client.on('connect', function() {
            console.log('Connected to Redis');
        });
    }
    getClient(){
        if(this.client)
            return this.client
        this.client = redis.createClient({host:'redis', port: 6379})
        return this.client 
    }

    setObject(key, value){
        this.client.set(key, JSON.stringify(value))
    }

    getObject(key){
        let value = this.client.get(key)
        return JSON.parse(value)
    }
}

module.exports = RedisClient

