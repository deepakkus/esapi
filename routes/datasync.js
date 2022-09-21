const express = require('express');
const {
	syncGateDetails,
	getTransactionStatus,
	syncDebitNote,
	syncPcr,
	syncGrossTare,
	syncPODetails,
	syncScrapQuality,
} = require('../controllers/datasync');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.route('/datastatus/:searchtext/:division').get(getTransactionStatus);
router.route('/gatedetails').post(syncGateDetails);
router.route('/debitnote').post(syncDebitNote);
router.route('/pcr').post(syncPcr);
router.route('/grosstare').post(syncGrossTare);
router.route('/purchaseorder').post(syncPODetails);
router.route('/scrapquality').post(syncScrapQuality);

module.exports = router;
