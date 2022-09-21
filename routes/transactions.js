const express = require('express');
const {
	getAllTransactions,
	getTransactionById,
	getTransactionByERPRefNo,
	searchByDate,
	searchBy,
	getTransactionThumbnail,
	getTransactionImage,
	createTransaction,
	updateTransaction,
	updateTransactionImage,
	deleteTransaction,
	deleteTransactionImage,
	deleteTransactionImageByThumbnail,
} = require('../controllers/transactions');
const Transactions = require('../models/Transactions');
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
// router.use(authorize('Admin'));

router.route('/getall').get(advancedResults(Transactions), getAllTransactions);
router.route('/searchby').post(searchBy);
router.route('/details/:id').get(getTransactionById);
router.route('/erprefno/:erpno').get(getTransactionByERPRefNo);
router.route('/searchbydate').post(searchByDate);
router.route('/create').post(createTransaction);
router.route('/update/:txnid').put(updateTransaction);
router.route('/update/:id/image').put(updateTransactionImage);
router.route('/:id/thumbnail').get(getTransactionThumbnail);
router.route('/:id/image').get(getTransactionImage);
router.route('/delete/:id/transaction').delete(deleteTransaction);
router.route('/delete/:id/image').delete(deleteTransactionImage);
router.route('/delete/:id/thumbnail').delete(deleteTransactionImageByThumbnail);

module.exports = router;
