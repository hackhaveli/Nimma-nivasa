const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Property = require('../models/Property');

const router = express.Router();

// Helper function to transform MongoDB _id to id
const transformProperty = (property) => {
    if (!property) return property;
    const propObj = property.toJSON ? property.toJSON() : property;
    const { _id, __v, ...rest } = propObj;
    return {
        id: _id?.toString() || propObj.id,
        ...rest,
        owner: propObj.owner ? transformOwner(propObj.owner) : undefined
    };
};

const transformOwner = (owner) => {
    if (!owner) return owner;
    const ownerObj = owner.toJSON ? owner.toJSON() : owner;
    const { _id, __v, ...rest } = ownerObj;
    return {
        id: _id?.toString() || ownerObj.id,
        ...rest
    };
};

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   GET /api/users/my-listings
// @desc    Get current user's properties
// @access  Private
router.get('/my-listings', authenticate, async (req, res) => {
    try {
        const properties = await Property.find({
            owner: req.userId,
            isActive: true
        }).sort({ createdAt: -1 });

        // Transform properties to have id instead of _id
        const transformedProperties = properties.map(transformProperty);

        res.json({
            success: true,
            count: transformedProperties.length,
            properties: transformedProperties
        });

    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// @route   GET /api/users/saved-properties
// @desc    Get user's saved properties
// @access  Private
router.get('/saved-properties', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: 'savedProperties',
            match: { isActive: true },
            populate: {
                path: 'owner',
                select: 'name mobile avatar'
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Transform properties to have id instead of _id
        const transformedProperties = user.savedProperties.map(transformProperty);

        res.json({
            success: true,
            count: transformedProperties.length,
            properties: transformedProperties
        });

    } catch (error) {
        console.error('Get saved properties error:', error);
        res.status(500).json({ error: 'Failed to fetch saved properties' });
    }
});

// @route   POST /api/users/save-property/:propertyId
// @desc    Save/unsave a property
// @access  Private
router.post('/save-property/:propertyId', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const propertyId = req.params.propertyId;
        const isSaved = user.savedProperties.includes(propertyId);

        if (isSaved) {
            // Remove from saved
            user.savedProperties = user.savedProperties.filter(
                id => id.toString() !== propertyId
            );
        } else {
            // Add to saved
            user.savedProperties.push(propertyId);
        }

        await user.save();

        res.json({
            success: true,
            isSaved: !isSaved,
            savedProperties: user.savedProperties
        });

    } catch (error) {
        console.error('Save property error:', error);
        res.status(500).json({ error: 'Failed to save property' });
    }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
    try {
        const allowedUpdates = ['name', 'email', 'avatar', 'location'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field]) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
