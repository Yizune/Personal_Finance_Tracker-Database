const app = require('express');

const settingsController = require('../controllers/settingsController');

const router = app.Router();
router.get('/', settingsController.getSettings);
router.put('/', settingsController.putSettings);

module.exports = router;