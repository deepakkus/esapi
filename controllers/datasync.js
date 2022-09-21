const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const DebitNotes = require('../models/DebitNote');
const Pcrs = require('../models/Pcr');
const GrossTares = require('../models/GrossTare');
const PurchseOrderDetails = require('../models/PurchaseOrderDetails');
const ScrapQualities = require('../models/ScrapQuality');
const PurchaseOrderDetails = require('../models/PurchaseOrderDetails');
const GateDetails = require('../models/GateDetails');
const { log } = require('./logger');

exports.getTransactionStatus = asyncHandler(async (req, res, next) => {
	console.log(req.params.division);
	console.log(req.params.searchtext);
	const gatedetails = await GateDetails.find({
		$and: [
			{
				$or: [
					{ gate_pass_no: { $regex: req.params.searchtext } },
					{ truck_no: { $regex: req.params.searchtext } },
				],
			},
			{ gp_division: { $regex: req.params.division.toUpperCase() } },
		],
	});

	const debitnote = await DebitNotes.find(
		{
			$and: [
				{
					$or: [
						{ gate_pass_no: { $regex: req.params.searchtext } },
						{ truck_no: { $regex: req.params.searchtext } },
					],
				},
				{ division: req.params.division.toUpperCase() },
			],
		},
		{ _id: 0 }
	);

	const pcr = await Pcrs.find(
		{
			$and: [
				{
					$or: [
						{ gate_pass_no: { $regex: req.params.searchtext } },
						{ truck_no: { $regex: req.params.searchtext } },
					],
				},
				{ division: req.params.division.toUpperCase() },
			],
		},
		{ _id: 0 }
	);

	const grosstare = await GrossTares.find(
		{
			$and: [
				{
					$or: [
						{ gate_pass_no: { $regex: req.params.searchtext } },
						{ truck_no: { $regex: req.params.searchtext } },
					],
				},
				{ gp_division: req.params.division.toUpperCase() },
			],
		},
		{ _id: 0 }
	);

	const purchaseorder = await PurchaseOrderDetails.find(
		{
			$and: [
				{
					gate_pass_no: req.params.searchtext,
				},
				{ divisions: req.params.division.toUpperCase() },
			],
		},
		{ _id: 0 }
	);

	const scrapquality = await ScrapQualities.find(
		{
			$and: [
				{
					$or: [
						{ gate_pass_no: { $regex: req.params.searchtext } },
						{ truck_no: { $regex: req.params.searchtext } },
					],
				},
				{ division: req.params.division.toUpperCase() },
			],
		},
		{ _id: 0 }
	);

	return res.status(200).json({
		success: true,
		message: 'Async Data Status',
		gatedetails,
		debitnote,
		pcr,
		grosstare,
		purchaseorder,
		scrapquality,
	});
});

exports.syncGateDetails = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';

	await Promise.all(
		req.body.map(async (gatedetail) => {
			const exists = await GateDetails.findOne({
				gate_pass_no: gatedetail.GP_NO,
			});

			if (exists) {
				skippedCount += 1;
			} else {
				await GateDetails.create({
					gp_division: gatedetail.GP_DIVN,
					gate_pass_no: gatedetail.GP_NO,
					gate_pass_date: gatedetail.GP_DT,
					truck_no: gatedetail.TRKNO,
					bill_no: gatedetail.BILLNO,
					bill_date: gatedetail.BILLDT,
					party_code: gatedetail.PARTY_CODE,
					party_name: gatedetail.PARTY_NM,
					purchase_order_no: gatedetail.PO_NO,
					indent_number: gatedetail.INDENT_NO,
					gate_pass_icdp: gatedetail.GP_ICDP,
					itnm: gatedetail.ITNM,
					gate_pass_qty: gatedetail.GP_QTY,
				});
				addedCount += 1;
				logType = 'info';
			}
		})
	);

	logType = logType || 'warning';
	message = `Gate Details - Added: ${addedCount}, Skipped: ${skippedCount}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `Gate Details - Added: ${addedCount}, Skipped: ${skippedCount}`,
	});
});

exports.syncDebitNote = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';

	await Promise.all(
		req.body.map(async (debitNote) => {
			const exists = await DebitNotes.findOne({
				gate_pass_no: debitNote.GP_NO,
			});

			if (exists) {
				skippedCount += 1;
			} else {
				await DebitNotes.create({
					division: debitNote.DIVN,
					type: debitNote.TY,
					id: debitNote.ID,
					idt: debitNote.IDT,
					adv_no: debitNote.ADV_NO,
					purchase_order_no: debitNote.PO_NO,
					purchase_receipt_no: debitNote.PR_NO,
					gate_pass_no: debitNote.GP_NO,
					gate_pass_date: debitNote.GP_DT,
					truck_no: debitNote.TRKNO,
					category_name: debitNote.CATEGORY_NM,
					catg_name: debitNote.CATG_NM,
					qty: debitNote.QTY,
					rate: debitNote.RATE,
					val: debitNote.VAL,
				});
				addedCount += 1;
				logType = 'info';
			}
		})
	);

	logType = logType || 'warning';
	message = `DebitNote - Added: ${addedCount}, Skipped: ${skippedCount}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `Debit Note - Added: ${addedCount}, Skipped: ${skippedCount}`,
	});
});

exports.syncPcr = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';

	await Promise.all(
		req.body.map(async (pcr) => {
			const exists = await Pcrs.findOne({ gate_pass_no: pcr.GP_NO });

			if (exists) {
				skippedCount += 1;
			} else {
				await Pcrs.create({
					division: pcr.DIVN,
					type: pcr.TY,
					id: pcr.ID,
					idt: pcr.IDT,
					purchase_order_no: pcr.PO_NO,
					purchase_recipt_no: pcr.PR_NO,
					gate_pass_no: pcr.GP_NO,
					truck_no: pcr.TRKNO,
					icdp: pcr.ICDP,
					itnm: pcr.ITNM,
					qty: pcr.QTY,
					rate: pcr.RATE,
					upgst_amt: pcr.UPGST_AMT,
					cgst_amt: pcr.CGST_AMT,
					igst_amt: pcr.IGST_AMT,
					val: pcr.VAL,
				});
				addedCount += 1;
				logType = 'info';
			}
		})
	);

	logType = logType || 'warning';
	message = `Pcr - Added: ${addedCount}, Skipped: ${skippedCount}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `Pcr - Added: ${addedCount}, Skipped: ${skippedCount}`,
	});
});

exports.syncGrossTare = asyncHandler(async (req, res, next) => {
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';

	await Promise.all(
		req.body.map(async (grosstare) => {
			const exists = await GrossTares.findOne({
				gate_pass_no: grosstare.GP_NO,
			});

			if (exists) {
				skippedCount += 1;
			} else {
				await GrossTares.create({
					gp_division: grosstare.GP_DIVN,
					gate_pass_no: grosstare.GP_NO,
					truck_no: grosstare.TRKNO,
					token_id: grosstare.TOKEN_ID,
					gate_pass_date: grosstare.GP_DT,
					gross_wt: grosstare.GROSS_WT,
					tare_wt: grosstare.TARE_WT,
				});
				addedCount += 1;
				logType = 'info';
			}
		})
	);

	logType = logType || 'warning';
	message = `GrossTare - Added: ${addedCount}, Skipped: ${skippedCount}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `GrossTare - Added: ${addedCount}, Skipped: ${skippedCount}`,
	});
});

exports.syncPODetails = asyncHandler(async (req, res, next) => {

	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';

	await Promise.all(
		req.body.map(async (purchasedetail) => {
			const exists = await PurchseOrderDetails.findOne({
				gate_pass_no: purchasedetail.GP_NO,
			});

			if (exists) {
				skippedCount += 1;
			} else {
				await PurchseOrderDetails.create({
					divisions: purchasedetail.DIVN,
					order_no: purchasedetail.PO_NO,
					order_date: purchasedetail.PO_DT,
					pr_cno: purchasedetail.PR_CNO,
					category_name: purchasedetail.CATEGORY_NM,
					gate_pass_no: purchasedetail.GP_NO,
					rate: purchasedetail.RATE,
					qty: purchasedetail.PO_QTY,
					rec_qty: purchasedetail.REC_QTY,
				});
				addedCount += 1;
				logType = 'info';
			}
		})
	);

	logType = logType || 'warning';
	message = `Purchase Order - Added: ${addedCount}, Skipped: ${skippedCount}`;
	const user = await req.user._id;
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message,
		user,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `Purchase Order - Added: ${addedCount}, Skipped: ${skippedCount}`,
	});
});

exports.syncScrapQuality = asyncHandler(async (req, res, next) => {
	debugger;
	let skippedCount = 0;
	let addedCount = 0;
	let logType = '';
	let message = '';

	await Promise.all(
		req.body.map(async (scrapquality) => {
			const exists = await ScrapQualities.findOne({
				gate_pass_no: scrapquality.GP_NO,
			});

			if (exists) {
				skippedCount += 1;
			} else {
				await ScrapQualities.create({
					division: scrapquality.DIVN,
					divisionId: scrapquality.ID,
					date: scrapquality.DT,
					gate_pass_no: scrapquality.GP_NO,
					gate_pass_date: scrapquality.GP_DT,
					truck_no: scrapquality.TRKNO,
					item_category: scrapquality.ITM_CATG,
					category_name: scrapquality.CATG_NM,
					weight: scrapquality.WT,
					per: scrapquality.PER,
				});
				addedCount += 1;
				logType = 'info';
			}
		})
	);

	logType = logType || 'warning';
	let method = req.url || req.path;
	method = method.slice(1);
	const data = {
		logType,
		method,
		message: `Scrap Quality - Added: ${addedCount}, Skipped: ${skippedCount}`,
		user: req.user._id,
	};
	log(data);

	return res.status(201).json({
		success: true,
		message: `Scrap Quality - Added: ${addedCount}, Skipped: ${skippedCount}`,
	});
});
