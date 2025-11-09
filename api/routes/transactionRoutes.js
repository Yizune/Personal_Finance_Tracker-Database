const app = require('express');

// Get access to the Controller
const transactionController = require('../controllers/transactionController');

const router = app.Router();
router.get('/', transactionController.getSortingFilter);

router.get('/', transactionController.getTransactions);
router.get('/', transactionController.getFilteredTransactions);

router.get('/:id', transactionController.getSingleTransaction);
router.post('/', transactionController.postTransaction);
router.put('/:id', transactionController.putTransaction);
router.delete('/', transactionController.deleteTransaction); // - '/:id' for single item removal

module.exports = router;