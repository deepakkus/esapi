const express = require('express');
const {
	getAllDivisions,
	getDivisionById,
	createDivision,
	updateDivision,
	deleteDivision,
} = require('../controllers/division');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
// router.use(authorize('Admin'));

router.route('/getall').get(getAllDivisions);
router.route('/details/:id').get(getDivisionById);
router.route('/create').post(authorize('Admin'), createDivision);
router.route('/update/:id').put(authorize('Admin'), updateDivision);
router.route('/delete/:id').delete(authorize('Admin'), deleteDivision);

module.exports = router;
