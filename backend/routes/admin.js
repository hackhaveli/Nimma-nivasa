const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Property = require('../models/Property');

const router = express.Router();

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.userId = decoded.id;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

//  @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const [
            totalUsers,
            totalProperties,
            activeProperties,
            totalViews,
            totalLeads
        ] = await Promise.all([
            User.countDocuments(),
            Property.countDocuments(),
            Property.countDocuments({ isActive: true }),
            Property.aggregate([
                { $group: { _id: null, total: { $sum: '$views' } } }
            ]),
            Property.aggregate([
                { $group: { _id: null, total: { $sum: '$leads' } } }
            ])
        ]);

        // Get top properties by views
        const topProperties = await Property.find({ isActive: true })
            .sort({ views: -1 })
            .limit(5)
            .select('title views leads price purpose category location');

        // Get recent properties
        const recentProperties = await Property.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title price purpose category location createdAt isActive');

        // Category distribution
        const categoryStats = await Property.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Purpose distribution
        const purposeStats = await Property.aggregate([
            { $group: { _id: '$purpose', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProperties,
                activeProperties,
                inactiveProperties: totalProperties - activeProperties,
                totalViews: totalViews[0]?.total || 0,
                totalLeads: totalLeads[0]?.total || 0,
            },
            topProperties,
            recentProperties,
            categoryStats,
            purposeStats
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                limit
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// @route   DELETE /api/admin/users/:userId
// @desc    Delete/ban a user
// @access  Admin
router.delete('/users/:userId', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }

        // Delete user's properties
        await Property.deleteMany({ owner: userId });

        // Delete user
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User and their properties deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// @route   GET /api/admin/properties
// @desc    Get all properties with pagination
// @access  Admin
router.get('/properties', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || 'all'; // all, active, inactive

        const query = status === 'all' ? {} : { isActive: status === 'active' };

        const [properties, total] = await Promise.all([
            Property.find(query)
                .populate('owner', 'name mobile email')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Property.countDocuments(query)
        ]);

        res.json({
            success: true,
            properties,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProperties: total,
                limit
            }
        });

    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// @route   DELETE /api/admin/properties/:propertyId
// @desc    Delete a property
// @access  Admin
router.delete('/properties/:propertyId', authenticateAdmin, async (req, res) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findByIdAndDelete(propertyId);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Remove from users' saved properties
        await User.updateMany(
            { savedProperties: propertyId },
            { $pull: { savedProperties: propertyId } }
        );

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });

    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// @route   PUT /api/admin/properties/:propertyId/status
// @desc    Toggle property active status
// @access  Admin
router.put('/properties/:propertyId/status', authenticateAdmin, async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { isActive } = req.body;

        const property = await Property.findByIdAndUpdate(
            propertyId,
            { isActive },
            { new: true }
        );

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json({
            success: true,
            property,
            message: `Property ${isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Update property status error:', error);
        res.status(500).json({ error: 'Failed to update property status' });
    }
});

// @route   GET /api/admin/user/:userId/properties
// @desc    Get all properties by a specific user
// @access  Admin
router.get('/user/:userId/properties', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const properties = await Property.find({ owner: userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            properties,
            count: properties.length
        });

    } catch (error) {
        console.error('Get user properties error:', error);
        res.status(500).json({ error: 'Failed to fetch user properties' });
    }
});

module.exports = router;
