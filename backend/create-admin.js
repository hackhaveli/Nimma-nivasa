const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists:');
            console.log(`   Name: ${existingAdmin.name}`);
            console.log(`   Mobile: ${existingAdmin.mobile}`);
            console.log(`   Email: ${existingAdmin.email}`);
        } else {
            // Create admin user
            const admin = new User({
                name: 'Admin',
                mobile: '9999999999',
                email: 'admin@aiprop.com',
                password: 'admin123', // Change this in production!
                isAdmin: true,
                isVerified: true
            });

            await admin.save();

            console.log('✅ Admin user created successfully!');
            console.log('   Mobile: 9999999999');
            console.log('   Password: admin123');
            console.log('   ⚠️  Please change the password in production!');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createAdmin();
