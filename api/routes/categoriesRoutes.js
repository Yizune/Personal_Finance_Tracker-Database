const app = require('express');

const categoriesController = require('../controllers/categoriesController');

const router = app.Router();
router.get('/', categoriesController.getCategories);

module.exports = router;