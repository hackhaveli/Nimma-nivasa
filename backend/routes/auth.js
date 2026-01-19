const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;

        // Validation
        if (!name || (!mobile && !email) || !password) {
            return res.status(400).json({
                error: 'Please provide name, password, and either mobile or email'
            });
        }

        // Check if user already exists
        const orConditions = [];
        if (mobile) orConditions.push({ mobile });
        if (email) orConditions.push({ email });

        if (orConditions.length > 0) {
            const existingUser = await User.findOne({ $or: orConditions });
            if (existingUser) {
                if (mobile && existingUser.mobile === mobile) {
                    return res.status(400).json({ error: 'User with this mobile number already exists' });
                }
                if (email && existingUser.email === email) {
                    return res.status(400).json({ error: 'User with this email already exists' });
                }
            }
        }

        // Create new user
        const userData = {
            name,
            password,
            admin: false // Default to false
        };

        if (mobile) userData.mobile = mobile;
        if (email) userData.email = email;

        const user = new User(userData);

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        // Handle unique constraint violations that might slip through
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Mobile number or email already in use' });
        }
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { mobile, email, password, identifier } = req.body;

        // Validation
        const loginId = identifier || mobile || email;

        if (!loginId || !password) {
            return res.status(400).json({
                error: 'Please provide mobile/email and password'
            });
        }

        // Find user by mobile or email
        const user = await User.findOne({
            $or: [
                { mobile: loginId },
                { email: loginId.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// @route   POST /api/auth/google
// @desc    Google Sign-In
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { idToken, user: googleUser } = req.body;

        // In production, verify the idToken with Google
        // For now, we trust the data from the client (Expo Google Auth)

        if (!googleUser || !googleUser.email) {
            return res.status(400).json({
                error: 'Invalid Google user data'
            });
        }

        const { email, name, id: googleId, photo } = googleUser;

        // Check if user exists with this Google ID or email
        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                if (photo && !user.avatar.includes('pravatar')) {
                    user.avatar = photo;
                }
                await user.save();
            }
        } else {
            // Create new user
            user = new User({
                name: name || 'Google User',
                email,
                googleId,
                mobile: `google_${Date.now()}_${Math.floor(Math.random() * 10000)}`, // Unique placeholder mobile
                password: `google_${Date.now()}_${Math.random()}`, // Random password (won't be used)
                avatar: photo || undefined,
                authProvider: 'google',
                isVerified: true // Google accounts are verified
            });

            await user.save();
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.toJSON(),
            isNewUser: !user.mobile || user.mobile.startsWith('google_')
        });

    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(500).json({ error: 'Failed to sign in with Google' });
    }
});

// @route   PUT /api/auth/complete-profile
// @desc    Complete profile after Google Sign-In (add mobile number)
// @access  Private
router.put('/complete-profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({ error: 'Mobile number is required' });
        }

        // Check if mobile already exists
        const existingUser = await User.findOne({
            mobile,
            _id: { $ne: decoded.id }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'This mobile number is already registered'
            });
        }

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { mobile },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
