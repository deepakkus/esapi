const mongoose = require('mongoose');

const DivisionSchema = new mongoose.Schema({
	division: {
		type: String,
		required: [true, 'Please add Division'],
	},
	divisionName: {
		type: String,
		required: [true, 'Please add Division Name'],
		// maxlength: [100, `Division Name should be less then 100 character's`],
	},
	city: {
		type: String,
		required: [true, 'Please add City'],
		// maxlength: [50, `City Name should be less then 50 character's`],
	},
	unit: {
		type: String,
		required: [true, 'Please add Unit'],
		uppercase: true,
		// maxlength: [2, `Unit should not be more then 2 character`],
	},
	active: {
		type: Boolean,
		default: true,
	},
	typeId: {
		type: [mongoose.Schema.ObjectId],
		ref: 'Type',
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

module.exports = mongoose.model('Division', DivisionSchema);
