const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        trim: true,
        sparse: true, // Allow null but ensure uniqueness when present
        validate: {
            validator: function (v) {
                // If mobile is provided, it should be 10 digits
                return !v || /^\d{10}$/.test(v);
            },
            message: 'Mobile number must be 10 digits'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true, // Allow null but ensure uniqueness when present
        validate: {
            validator: function (v) {
                // If email is provided, it should be valid format
                return !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: function () {
            return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    postings: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    leads: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    googleId: {
        type: String,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    savedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    location: {
        city: String,
        state: String,
        country: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        address: String
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Check if either mobile or email is provided
    if (!this.mobile && !this.email && this.authProvider === 'local') {
        return next(new Error('Either mobile number or email is required'));
    }

    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output and transform _id to id
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    user.id = user._id.toString();
    delete user._id;
    delete user.__v;
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
