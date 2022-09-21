const imageThumbnail = require('image-thumbnail');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Transactions = require('../models/Transactions');
const Division = require('../models/Divison');
const Type = require('../models/Type');
const SubType = require('../models/SubType');
const Images = require('../models/Images');
const Thumbnails = require('../models/Thumbnails');
const { v4: uuidv4 } = require('uuid');

// @decs        Get All Transactions without any transaction image
// @routes      GET /api/v1/transaction
// @access      Private
exports.getAllTransactions = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @decs        Get Single Transaction By Id
// @routes      GET /api/v1/transaction/details/:id
// @access      Private
exports.getTransactionById = asyncHandler(async (req, res, next) => {
	const transaction = await Transactions.findOne(
		{
			_id: req.params.id,
		},
		{ createdAt: 0 }
	);

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 400));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail`,
		data: transaction,
	});
});

// @decs        Get Single Transaction By ERPRefNo
// @routes      GET /api/v1/transaction/erprefno
// @access      Private
exports.getTransactionByERPRefNo = asyncHandler(async (req, res, next) => {
	const transaction = await Transactions.findOne(
		{
			ERPRefNo: req.params.erpno,
		},
		{ createdAt: 0 }
	);

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 400));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail`,
		data: transaction,
	});
});

// @decs        Get Single Transaction detail thumbnail id
// @routes      GET /api/v1/transactiondetails/:id
// @access      Private
exports.searchByDate = asyncHandler(async (req, res, next) => {
	var start = new Date(req.body.from);
	start.setHours(0, 0, 0, 0);

	var end = new Date(req.body.to);
	end.setHours(23, 59, 59, 999);

	const transaction = await Transactions.find({
		createdAt: { $gte: new Date(start), $lte: end },
	});

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 400));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail`,
		total: transaction.length,
		data: transaction,
	});
});

// @decs        Get Single Transaction detail thumbnail id
// @routes      GET /api/v1/transactiondetails/:id
// @access      Private
exports.searchBy = asyncHandler(async (req, res, next) => {
	// console.log(req.body.search);
	const transaction = await Transactions.find({
		$or: [
			{ vehicleNo: { $regex: req.body.search } },
			{ partyName: { $regex: req.body.search } },
			{ ERPRefNo: { $regex: req.body.search } },
		],
	});

	if (!transaction) {
		return next(new ErrorResponse(`No Transaction Details`, 400));
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Detail`,
		total: transaction.length,
		data: transaction,
	});
});

// @decs        Get transaction thumbnails
// @routes      GET /api/v1/transactiondetails/:id/thumbnail
// @access      Private
exports.getTransactionThumbnail = asyncHandler(async (req, res, next) => {
	const thumbnail = await Thumbnails.find(
		{
			transactionId: req.params.id,
		},
		{ _id: 0, createdAt: 0 }
	);

	if (!thumbnail) {
		return next(new ErrorResponse(`No Transaction Details`, 400));
	}

	return res.status(200).json({
		success: true,
		message: `Thumbnails`,
		thumbnail,
	});
});

// @decs        Get transaction image
// @routes      GET /api/v1/transactiondetails/:id/image
// @access      Private
exports.getTransactionImage = asyncHandler(async (req, res, next) => {
	const image = await Images.findOne(
		{
			imageId: req.params.id,
		},
		{ _id: 0, createdAt: 0 }
	);

	if (!image) {
		return next(new ErrorResponse(`No Image`, 400));
	}

	return res.status(200).json({
		success: true,
		message: `Image`,
		image,
	});
});

// @decs        Create Transactions
// @routes      POST /api/v1/transaction
// @access      Private
exports.createTransaction = asyncHandler(async (req, res, next) => {
	//   req.body.userId = req.user._id;
	const txnData = {
		division: req.body.division,
		type: req.body.type,
		subType: req.body.subType,
		userId: req.user._id,
		vehicleNo: req.body.vehicleNo,
		gateInOut: req.body.gateInOut,
		partyName: req.body.partyName,
		ERPRefNo: req.body.ERPRefNo,
		ERPRefDate: new Date(req.body.ERPRefDate),
		entryDate: new Date(req.body.entryDate),
	};

	const division = await Division.findById({
		_id: txnData.division,
	});

	if (!division) {
		return next(new ErrorResponse(`Invalid Divisision `, 404));
	}

	const type = await Type.findById({
		_id: txnData.type,
	});

	if (!type) {
		return next(new ErrorResponse(`Invalid Type `, 404));
	}

	const subType = await SubType.findById({
		_id: txnData.subType,
	});

	if (!subType) {
		return next(new ErrorResponse(`Invalid Sub Type `, 404));
	}

	const transaction = await Transactions.create(txnData);

	const options = { percentage: 10, responseType: 'base64' };
	req.body.images.forEach(async (img, index) => {
		let uuid = uuidv4();
		let imageData = {
			transactionId: transaction._id,
			imageId: uuid,
			captureTime: img.captureTime,
			imageName: 'image' + ++index,
			image: img.base64,
		};
		let thumbnailImage = await imageThumbnail(img.base64, options);
		let thumbnailData = {
			transactionId: transaction._id,
			imageId: uuid,
			captureTime: img.captureTime,
			thumbnailName: 'image' + index,
			thumbnail: thumbnailImage,
		};

		const image = await Images.create(imageData);
		const thumbnail = await Thumbnails.create(thumbnailData);
	});

	if (!transaction) {
		return next(new ErrorResponse(`Unable to create Transaction`, 401));
	}

	if (transaction) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Transaction Created Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(201).json({
		success: true,
		message: `Transaction Created`,
		data: transaction,
	});
});

// @decs        Update Transactions
// @routes      PUT /api/v1/transaction/:id
// @access      Private
exports.updateTransaction = asyncHandler(async (req, res, next) => {
	const txnData = {
		division: req.body.division,
		type: req.body.type,
		subType: req.body.subType,
		vehicleNo: req.body.vehicleNo,
		gateInOut: req.body.gateInOut,
		partyName: req.body.partyName,
		ERPRefNo: req.body.ERPRefNo,
		ERPRefDate: new Date(req.body.ERPRefDate),
		entryDate: new Date(req.body.entryDate),
	};

	const division = await Division.findById({
		_id: txnData.division,
	});

	if (!division) {
		return next(new ErrorResponse(`Invalid Divisision `, 404));
	}

	const type = await Type.findById({
		_id: txnData.type,
	});

	if (!type) {
		return next(new ErrorResponse(`Invalid Type `, 404));
	}

	const subType = await SubType.findById({
		_id: txnData.subType,
	});

	if (!subType) {
		return next(new ErrorResponse(`Invalid Sub Type `, 404));
	}

	const dbImageData = await Images.find(
		{ transactionId: req.params.txnid },
		{ imageId: 1, _id: 0 }
	);

	const dbImageId = [];
	dbImageData.forEach((data) => {
		dbImageId.push(data.imageId);
	});

	const reqImageId = [];
	req.body.images.forEach(async (imgData, index) => {
		reqImageId.push(imgData.imageId);
	});

	let differenceId = dbImageId.filter((x) => !reqImageId.includes(x));

	differenceId.forEach(async (id) => {
		await Thumbnails.findOneAndDelete({ imageId: id });
		await Images.findOneAndDelete({ imageId: id });
	});

	const options = { percentage: 10, responseType: 'base64' };
	req.body.images.forEach(async (img, index) => {
		if (!img.imageId) {
			let uuid = uuidv4();
			let imageData = {
				transactionId: req.params.id,
				imageId: uuid,
				captureTime: img.captureTime,
				imageName: 'image' + ++index,
				image: img.base64,
			};
			let thumbnailImage = await imageThumbnail(img.base64, options);
			let thumbnailData = {
				transactionId: req.params.txnid,
				imageId: uuid,
				captureTime: img.captureTime,
				thumbnailName: 'image' + index,
				thumbnail: thumbnailImage,
			};

			const image = await Images.create(imageData);
			const thumbnail = await Thumbnails.create(thumbnailData);
		}
	});

	const transaction = await Transactions.findOneAndUpdate(
		{ _id: req.params.txnid },
		txnData,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!transaction) {
		return next(new ErrorResponse(`Unable to Update Transaction`, 401));
	}

	if (transaction) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Transaction Updated Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Updated`,
		data: transaction,
	});
});

// @decs        Update Transactions Image
// @routes      POST /api/v1/transaction/update/:id/image
// @access      Private
exports.updateTransactionImage = asyncHandler(async (req, res, next) => {
	// req.body.userId = req.user._id;
	if (!req.body.imageId) {
		return next(new ErrorResponse(`Please add image id`, 404));
	}
	const options = { percentage: 10, responseType: 'base64' };

	let imageData = {
		image: req.body.images[0].base64,
	};
	let thumbnailImage = await imageThumbnail(req.body.images[0].base64, options);
	let thumbnailData = {
		thumbnail: thumbnailImage,
	};

	const image = await Images.findOneAndUpdate(
		{ imageId: req.body.imageId },
		imageData,
		{ new: true, runValidators: true }
	);
	const thumbnail = await Thumbnails.findOneAndUpdate(
		{ imageId: req.body.imageId },
		thumbnailData,
		{ new: true, runValidators: true }
	);

	return res.status(200).json({
		success: true,
		message: `Transaction Image Updated`,
		thumbnail,
	});
});

// @decs        Delete Transactions
// @routes      PUT /api/v1/transaction/delete/:id/transaction
// @access      Private
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
	const transaction = await Transactions.findById({
		_id: req.params.id,
	});

	if (!transaction) {
		return next(new ErrorResponse(`Unable to Find Transaction`, 401));
	}

	await transaction.remove();

    if (transaction) {
		const data = {
			logType: 'info',
			method: req.originalUrl.slice(8),
			message: 'Transaction Deleted Successful',
			user: req.user._id,
		};
		log(data);
	}

	return res.status(200).json({
		success: true,
		message: `Transaction Deleted`,
		data: {},
	});
});

// @decs        Delete Transactions Image
// @routes      DELETE /api/v1/transaction/delete/:id/image
// @access      Private
exports.deleteTransactionImage = asyncHandler(async (req, res, next) => {
	let image = await Images.findOne({ imageId: req.params.id });
	if (!image) {
		return next(new ErrorResponse(`No Image Record Found`, 404));
	}
	const { images, thumbnails } = await Transactions.findOne(
		{ images: image._id },
		{ images: 1, thumbnails: 1 }
	);

	// console.log(image);
	images.forEach((id, index) => {
		if (id.toString() === image._id.toString()) {
			console.log('ID Metched', id);
			images.splice(index, 1);
			thumbnails.splice(index, 1);
		}
	});
	// console.log(images);
	await Transactions.findByIdAndUpdate(
		{ _id: image.transactionId },
		{ images, thumbnails },
		{ new: true, runValidators: true }
	);
	await Thumbnails.findOneAndDelete({ imageId: req.params.id });
	await Images.findOneAndDelete({ imageId: req.params.id });

	return res.status(200).json({
		success: true,
		message: `Transaction Image Deleted`,
		data: {},
	});
});

// @decs        Delete Transactions Image
// @routes      DELETE /api/v1/transaction/delete/:id/thumbnail
// @access      Private
exports.deleteTransactionImageByThumbnail = asyncHandler(
	async (req, res, next) => {
		let thumbnail = await Thumbnails.findOne({ imageId: req.params.id });
		// console.log(thumbnail);
		if (!thumbnail) {
			return next(new ErrorResponse(`No Thumbnail Record Found`, 404));
		}
		const { images, thumbnails } = await Transactions.findOne(
			{ thumbnails: thumbnail._id },
			{ images: 1, thumbnails: 1 }
		);

		// console.log(images, thumbnail._id);
		thumbnails.forEach((id, index) => {
			if (id.toString() === thumbnail._id.toString()) {
				// console.log('ID Metched', id);
				images.splice(index, 1);
				thumbnails.splice(index, 1);
			}
		});
		// console.log(images);
		await Transactions.findByIdAndUpdate(
			{ _id: thumbnail.transactionId },
			{ images, thumbnails },
			{ new: true, runValidators: true }
		);
		await Thumbnails.findOneAndDelete({ imageId: req.params.id });
		await Images.findOneAndDelete({ imageId: req.params.id });

		return res.status(200).json({
			success: true,
			message: `Transaction Image Deleted`,
			data: {},
		});
	}
);
