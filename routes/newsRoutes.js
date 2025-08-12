const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, newsController.getNews);
router.post('/:id/read', authenticate, newsController.markRead);
router.post('/:id/favorite', authenticate, newsController.markFavorite);
router.get('/read', authenticate, newsController.getRead);
router.get('/favorites', authenticate, newsController.getFavorites);
router.get('/search/:keyword', authenticate, newsController.searchNews);

module.exports = router;
