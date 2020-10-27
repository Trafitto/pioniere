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

    // Search inside Redis
    //  TODO: Fix Redis get
    //let items =  redisClient.getObject(query);
    let items =  null
    
    console.log(items)
    if (!items){
      console.log("Object not found on redis, search on YT")
      ytController.getLessViews(query).then(response =>{
      items = response
      redisClient.setObject(query, items);
     }).catch(error => {
      console.log(error)
     })
    }
    console.log(items)
    res.send(items).status(200);
  } catch (e) {
    console.error(e)
    res.send(e).status(500);
  }
})

module.exports = router;
