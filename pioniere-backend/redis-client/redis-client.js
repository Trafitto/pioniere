var redis = require('redis');

class RedisClient {
    constructor() {
        this.client = this.getClientInstance();

        this.client.on('error', function (err) {
            console.log('Error ' + err);
        });

        this.client.on('connect', function () {
            console.log('Connected to Redis');
        });
    }

    getClientInstance() {
        if (this.client) return this.client
        const redisClient = redis.createClient({
            host: 'redis',
            port: process.env.REDIS_PORT || 6379
        })
        return redisClient
    }

    setObject(key, value) {
        this.client.set(key, JSON.stringify(value))
    }

    getObject(key, deserialize = true) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (error, value) => {
                if (error) reject(error)
                if (deserialize) value = JSON.parse(value)
                resolve(value)
            })
        })
    }
}

module.exports = RedisClient

