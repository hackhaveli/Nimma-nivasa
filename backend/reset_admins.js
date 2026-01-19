const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetAdmins = async () => {
    const targetEmail = 'coderrohit2927@gmail.com';

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // 1. Demote EVERYONE to 'user'
        const demoteResult = await User.updateMany(
            {},
            { $set: { role: 'user', isAdmin: false } }
        );
        console.log(`📉 Demoted ${demoteResult.modifiedCount} users to standard user.`);

        // 2. Promote ONLY the target email
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.log(`❌ User not found: ${targetEmail}`);
            process.exit(1);
        }

        user.role = 'admin';
        user.isAdmin = true;
        await user.save();

        console.log(`\n👑 SUCCESS!`);
        console.log(`The ONLY admin is now: ${user.email}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

resetAdmins();
