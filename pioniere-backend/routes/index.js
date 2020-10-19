var express = require('express');
var router = express.Router();
var YTController = require('../controllers/youtube-controller')

const ytController = new YTController();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.sendStatus(200)
});

/* GET videos with 'IMG_' */
router.get('/img', async (req, res, next) => {
  try {
    const items = await ytController.getResultsForIMG()
    res.send(items).status(200)
  } catch (e) {
    res.send(e).status(500)
  }
})

/* GET videos with 'IMG_', retrieve IDs only */
router.get('/img-id', async (req, res, next) => {
  try {
    const items = await ytController.getResultsForIMG()
      .then(items => items.map(i => i.id.videoId))
    res.send(items).status(200)
  } catch (e) {
    res.send(e).status(500)
  }
})

module.exports = router;
