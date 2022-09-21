const mongoose = require('mongoose');
const Type = require('./Type');

const SubTypeSchema = new mongoose.Schema({
	subTypeName: {
		type: String,
		required: [true, 'Please add Sub Type Name'],
		// maxlength: [100, `Sub type Name should be less then 100 character's`],
	},
	division: {
		type: mongoose.Schema.ObjectId,
		ref: 'Division',
	},
	type: {
		type: mongoose.Schema.ObjectId,
		ref: 'Type',
	},
	active: {
		type: Boolean,
		default: true,
	},
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		// required: [true, 'Please Add User ID'],
		// select: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

SubTypeSchema.post('save', async function () {
	await Type.findByIdAndUpdate(
		{ _id: this.type },
		{ $push: { subTypes: this._id } },
		{
			new: true,
			runValidators: true,
		}
	);
});

module.exports = mongoose.model('SubType', SubTypeSchema);
