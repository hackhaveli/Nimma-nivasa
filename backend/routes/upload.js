const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware to verify JWT token (optional - for authenticated uploads)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        }
        next();
    } catch (error) {
        next();
    }
};

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'properties') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `aiprop/${folder}`,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
};

// @route   POST /api/upload/single
// @desc    Upload a single image
// @access  Public (but can be authenticated)
router.post('/single', optionalAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'properties');

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images (up to 5)
// @access  Public (but can be authenticated)
router.post('/multiple', optionalAuth, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No image files provided' });
        }

        const uploadPromises = req.files.map(file =>
            uploadToCloudinary(file.buffer, 'properties')
        );

        const results = await Promise.all(uploadPromises);

        const urls = results.map(result => ({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        }));

        res.json({
            success: true,
            count: urls.length,
            images: urls
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete an image from Cloudinary
// @access  Private (authenticated users only)
router.delete('/:publicId', optionalAuth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const publicId = decodeURIComponent(req.params.publicId);

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', optionalAuth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'avatars');

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

module.exports = router;
