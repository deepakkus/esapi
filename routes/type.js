const express = require('express');
const {
	getAllTypes,
	getTypeById,
	getTypeByDivisionId,
	createType,
	updateType,
	deleteType,
} = require('../controllers/type');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
// router.use(authorize('Admin'));

router.route('/getall').get(getAllTypes);
router.route('/details/:id').get(getTypeById);
router.route('/division/:id').get(getTypeByDivisionId);
router.route('/create').post(authorize('Admin'), createType);
router.route('/update/:id').put(authorize('Admin'), updateType);
router.route('/delete/:id').delete(authorize('Admin'), deleteType);

module.exports = router;
