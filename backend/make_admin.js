const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('please provide an email address.');
        console.log('Usage: node make_admin.js <email>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        user.role = 'admin';
        // Ensure isAdmin is also true for backward compatibility or extra checks
        user.isAdmin = true;

        await user.save();

        console.log(`\n🎉 SUCCESS!`);
        console.log(`User  : ${user.name}`);
        console.log(`Email : ${user.email}`);
        console.log(`Role  : ${user.role}`);
        console.log(`\nYou can now access the Admin Dashboard in the app!`);
        console.log(`(Go to Profile tab -> Tap "Admin Dashboard")`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

makeAdmin();
