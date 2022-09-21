const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please Add User Name'],
		// maxlength: [50, `Name should be less then 50 character's`],
	},
	userName: {
		type: String,
		required: [true, 'Please Add User Name'],
		unique: true,
		// maxlength: [50, `User Name should be less then 50 character's`],
	},
	email: {
		type: String,
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			'Please match valid email',
		],
		maxlength: [100, `Email should be less then 100 character's`],
	},
	mobileNo: {
		type: Number,
		// minlength: [10, 'Mobile No Should be minimum 10 digites'],
		requires: [true, 'Please add mobile number'],
        // maxlength: [15, `Mobile Number should less then 15 Number's`],
	},
	role: {
		type: String,
		enum: ['Admin', 'User'],
		default: 'User',
	},
	active: {
		type: Boolean,
		default: true,
	},
	password: {
		type: String,
		select: false,
		required: [true, 'Please add password'],
		minlength: [5, 'Password shoud be 5 characters'],
		match: [
			/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/,
			'Please Add strong Password',
		],
	},
	activityId: {
		type: mongoose.Schema.ObjectId,
		ref: 'UserActivity',
		// select: false,
	},
    loginExpire: {
        type: Date,
    },
	deviceses: {
		type: [mongoose.Schema.ObjectId],
		ref: 'AllowDeviceses',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Encrypt Passwotd
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Metch User entered password
UserSchema.methods.metchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = async function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

module.exports = mongoose.model('User', UserSchema);
