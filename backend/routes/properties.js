const express = require('express');
const jwt = require('jsonwebtoken');
const Property = require('../models/Property');
const User = require('../models/User');

const router = express.Router();

// Helper function to transform MongoDB _id to id for lean queries
const transformProperty = (property) => {
    if (!property) return property;
    const { _id, __v, ...rest } = property;
    return {
        id: _id?.toString() || property.id,
        ...rest,
        owner: property.owner ? transformOwner(property.owner) : undefined
    };
};

const transformOwner = (owner) => {
    if (!owner) return owner;
    const { _id, __v, ...rest } = owner;
    return {
        id: _id?.toString() || owner.id,
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

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            purpose,
            minPrice,
            maxPrice,
            search,
            latitude,
            longitude,
            maxDistance = 50000 // 50km default
        } = req.query;

        let query = { isActive: true };

        // Apply filters
        if (category && category !== 'All') query.category = category;
        if (purpose) query.purpose = purpose;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Search by title, area, or landmark
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'location.areaName': { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } },
                { 'location.landmark': { $regex: search, $options: 'i' } }
            ];
        }

        let properties = await Property.find(query)
            .populate('owner', 'name mobile avatar')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate distance if user location provided
        if (latitude && longitude) {
            const userLat = Number(latitude);
            const userLon = Number(longitude);

            properties = properties.map(property => {
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    property.location.latitude,
                    property.location.longitude
                );
                return { ...property, distance };
            });

            // Sort by distance
            properties.sort((a, b) => a.distance - b.distance);

            // Filter by max distance if needed
            if (maxDistance) {
                properties = properties.filter(p => p.distance <= Number(maxDistance));
            }
        }

        // Transform properties to have id instead of _id
        const transformedProperties = properties.map(transformProperty);

        res.json({
            success: true,
            count: transformedProperties.length,
            properties: transformedProperties
        });

    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// @route   GET /api/properties/nearby
// @desc    Get nearby properties with fallback logic
// @access  Public
router.get('/nearby', async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 5000, limit = 50 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        let properties = [];
        let isFallback = false;
        let fallbackRadius = 0;

        // Try with initial radius
        properties = await Property.find({
            isActive: true,
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat] // [longitude, latitude]
                    },
                    $maxDistance: parseInt(maxDistance) // meters
                }
            }
        })
            .populate('owner', 'name mobile avatar')
            .limit(parseInt(limit))
            .lean();

        // FALLBACK LOGIC: If no properties found, expand search
        if (properties.length === 0) {
            // Try 50km
            properties = await Property.find({
                isActive: true,
                'location.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        $maxDistance: 50000 // 50km
                    }
                }
            })
                .populate('owner', 'name mobile avatar')
                .limit(parseInt(limit))
                .lean();

            if (properties.length > 0) {
                isFallback = true;
                fallbackRadius = 50;
            }
        }

        // ULTIMATE FALLBACK: If still no properties, show all
        if (properties.length === 0) {
            properties = await Property.find({ isActive: true })
                .populate('owner', 'name mobile avatar')
                .limit(parseInt(limit))
                .lean();

            if (properties.length > 0) {
                isFallback = true;
                fallbackRadius = 0; // 0 means "all properties"
            }
        }

        // Calculate distances and transform
        properties = properties.map(prop => {
            const distance = calculateDistance(
                lat,
                lng,
                prop.location.latitude,
                prop.location.longitude
            );
            return {
                ...transformProperty(prop),
                distance: distance.toFixed(2) // km
            };
        });

        // Sort by distance
        properties.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        res.json({
            success: true,
            properties,
            isFallback,
            fallbackRadius,
            count: properties.length,
            userLocation: { latitude: lat, longitude: lng }
        });

    } catch (error) {
        console.error('Nearby properties error:', error);
        res.status(500).json({ error: 'Failed to fetch nearby properties' });
    }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name mobile email avatar isVerified');

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Increment views
        property.views += 1;
        await property.save();

        res.json({
            success: true,
            property
        });

    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ error: 'Failed to fetch property' });
    }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private
router.post('/', authenticate, async (req, res) => {
    try {
        const propertyData = {
            ...req.body,
            owner: req.userId
        };

        // Validation
        const requiredFields = ['title', 'category', 'purpose', 'price', 'images', 'location', 'ownerName', 'whatsappNumber'];
        for (const field of requiredFields) {
            if (!propertyData[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // If House category, validate house-specific fields
        if (propertyData.category === 'House') {
            if (!propertyData.bedrooms || !propertyData.kitchen || !propertyData.hall) {
                return res.status(400).json({
                    error: 'Bedrooms, kitchen, and hall are required for House category'
                });
            }
        }

        const property = new Property(propertyData);
        await property.save();

        // Update user's posting count
        await User.findByIdAndUpdate(req.userId, {
            $inc: { postings: 1 }
        });

        res.status(201).json({
            success: true,
            property
        });

    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Failed to create property' });
    }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Owner or Admin)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Get user to check if admin
        const user = await User.findById(req.userId);

        // Check ownership or admin status
        const isOwner = property.owner.toString() === req.userId;
        const isAdmin = user && user.email === 'coderrohit2927@gmail.com';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to update this property' });
        }

        Object.assign(property, req.body);
        await property.save();

        res.json({
            success: true,
            property
        });

    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Check ownership
        if (property.owner.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this property' });
        }

        await property.deleteOne();

        // Update user's posting count
        await User.findByIdAndUpdate(req.userId, {
            $inc: { postings: -1 }
        });

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });

    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// @route   POST /api/properties/:id/lead
// @desc    Increment lead count
// @access  Public
router.post('/:id/lead', async (req, res) => {
    try {
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { $inc: { leads: 1 } },
            { new: true }
        );

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json({
            success: true,
            property
        });

    } catch (error) {
        console.error('Increment lead error:', error);
        res.status(500).json({ error: 'Failed to increment lead' });
    }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

module.exports = router;
