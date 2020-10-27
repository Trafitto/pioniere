var express = require('express');
var router = express.Router();
var YTController = require('../controllers/youtube-controller')
var RedisClient = require('../redis-client/redis-client')


const ytController = new YTController();
const redisClient = new RedisClient();

/* GET home page. */
router.get('/', async (req, res, next) => {
  res.sendStatus(200)
});

/* GET videos */
router.get('/search', async (req, res, next) => {
  if (!req.query.q) {
    return res.send('Query not provided').status(400);
  }

  try {
    const query = decodeURIComponent(req.query.q);

    let items
    try {
      items = await redisClient.getObject(query);
    } catch (e) {
      res.send(e).status(500);
    }

    if (items) {
      console.log('Sending back items from redis');
      res.json(items).status(200);
    } else {
      items = await ytController.getLessViews(query);
      try {
        await redisClient.setObject(query, items);
        console.log('Sending back items from APIs');
        res.send(items).status(200);
      } catch (e) {
        res.send(e).status(500);
      }
    }
  } catch (e) {
    console.error(e)
    res.send(e).status(500);
  }
})

module.exports = router;
