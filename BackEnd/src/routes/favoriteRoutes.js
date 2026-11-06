const { Router } = require('express');
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam, paginationQuery } = require('../validators/commonValidator');
const { favoriteRules } = require('../validators/miscValidator');

const router = Router();

router.use(authenticateToken);

router.get('/', paginationQuery, validate, favoriteController.listFavorites);
router.post('/', favoriteRules, validate, favoriteController.addFavorite);
router.get('/:productId/check', idParam('productId'), validate, favoriteController.checkFavorite);
router.delete('/:productId', idParam('productId'), validate, favoriteController.removeFavorite);

module.exports = router;
