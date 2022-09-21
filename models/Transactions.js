const mongoose = require('mongoose');

const TransactionsSchema = new mongoose.Schema({
	division: {
		type: mongoose.Schema.ObjectId,
		ref: 'Division',
		required: [true, 'Please Add Division'],
	},
	type: {
		type: mongoose.Schema.ObjectId,
		ref: 'Type',
		required: [true, `Please Add Type`],
	},
	subType: {
		type: mongoose.Schema.ObjectId,
		ref: 'SubType',
		required: [true, `Please Add Sub Type`],
	},
	date: {
		type: Date,
	},
	vehicleNo: {
		type: String,
		required: [true, `Please Add Vehicle Number`],
		// maxlength: [50, `Vehicle Number should be less then 50 character's`],
	},
	gateInOut: {
		type: [String],
		required: [true, `Please Add Gate In Out Number`],
		// maxlength: [100, `Gate In Out should be less then 100 character's`],
	},
	partyName: {
		type: String,
		required: [true, `Please Add Party Name`],
		// maxlength: [100, `Party Name should be less then 100 character's`],
	},
	ERPRefNo: {
		type: String,
		required: [true, `Please Add ERP Ref Number`],
		// maxlength: [50, `ERP Ref Number should be less then 50 character's`],
	},
	ERPRefDate: {
		type: Date,
		// required: [true, `Please Add ERP Ref Date`],
	},
	entryDate: {
		type: Date,
		// required: [true, `Please Add Entry Date`],
	},
	remark: {
		type: String,
		// maxlength: [200, `Remark should be less then 30 character's`],
	},
	// images: {
	// 	type: [mongoose.Schema.ObjectId],
	// 	ref: 'Images',
	// },
	// thumbnails: {
	// 	type: [mongoose.Schema.ObjectId],
	// 	ref: 'Thumbnails',
	// },
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		// required: [true, `Please Add Useer ID`],
	},
	active: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

TransactionsSchema.pre('remove', async function (next) {
	console.log(
		`Thumbnails and Images being deleted from transaction ${this._id}`
	);
	await this.model('Images').deleteMany({ transactionId: this._id });
	await this.model('Thumbnails').deleteMany({ transactionId: this._id });
	next();
});

module.exports = mongoose.model('Transactions', TransactionsSchema);
