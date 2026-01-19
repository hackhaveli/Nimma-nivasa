const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['House', 'Plot', 'Shop', 'Land']
    },
    purpose: {
        type: String,
        required: true,
        enum: ['Rent', 'Sale']
    },
    price: {
        type: Number,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    location: {
        // Legacy fields (keep for backward compatibility)
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        // GeoJSON for geospatial queries
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude] - GeoJSON format
            index: '2dsphere'
        },
        areaName: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        landmark: String
    },
    width: {
        type: Number,
        default: 0
    },
    length: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    ownerName: {
        type: String,
        required: true
    },
    whatsappNumber: {
        type: String,
        required: true
    },

    // Conditional fields for House
    bedrooms: Number,
    kitchen: Number,
    hall: Number,

    // Metadata
    views: {
        type: Number,
        default: 0
    },
    leads: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Admin moderation fields
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Auto-approve for now, change to 'pending' for moderation
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Pre-save hook to populate GeoJSON coordinates from lat/lng
propertySchema.pre('save', function (next) {
    if (this.location && this.location.latitude && this.location.longitude) {
        // Populate GeoJSON coordinates [longitude, latitude]
        this.location.coordinates = [this.location.longitude, this.location.latitude];
        this.location.type = 'Point';
    }
    next();
});

// Index for geospatial queries (2dsphere for GeoJSON)
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ category: 1, purpose: 1 });
propertySchema.index({ price: 1 });

module.exports = mongoose.model('Property', propertySchema);
