var express = require('express');
var router = express.Router();
var YTController = require('../controllers/youtube-controller')

const ytController = new YTController();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.sendStatus(200)
});

/* GET videos */
router.get('/search', async (req, res, next) => {
  if (!req.query.q) {
    return res.send('Query not provided').status(400);
  }

  try {
    const items = await ytController.getLessViews(req.query.q);
    res.send(items).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
})

module.exports = router;
