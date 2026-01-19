const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
require('dotenv').config();

console.log('🔍 Starting MongoDB Connection Test...\n');

async function testDatabase() {
    try {
        // Test 1: Connection
        console.log('Test 1: Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully\n');

        // Test 2: Write User
        console.log('Test 2: Creating test user...');
        const testUser = new User({
            name: 'Test User',
            mobile: '+919876543210',
            password: 'password123',
            email: 'test@example.com'
        });
        await testUser.save();
        console.log('✅ Test user created:', testUser.name);
        console.log('   ID:', testUser._id);
        console.log('   Mobile:', testUser.mobile, '\n');

        // Test 3: Write Property
        console.log('Test 3: Creating test property...');
        const testProperty = new Property({
            title: '3 BHK Luxury Villa',
            category: 'House',
            purpose: 'Sale',
            price: 5000000,
            images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'],
            location: {
                latitude: 28.7041,
                longitude: 77.1025,
                areaName: 'Connaught Place',
                city: 'New Delhi'
            },
            width: 2000,
            length: 3000,
            description: 'Beautiful villa with modern amenities',
            ownerName: 'Test Owner',
            whatsappNumber: '+919999999999',
            bedrooms: 3,
            kitchen: 1,
            hall: 1,
            owner: testUser._id
        });
        await testProperty.save();
        console.log('✅ Test property created:', testProperty.title);
        console.log('   ID:', testProperty._id);
        console.log('   Category:', testProperty.category);
        console.log('   Price: ₹', testProperty.price.toLocaleString(), '\n');

        // Test 4: Read Operations
        console.log('Test 4: Reading data from database...');
        const users = await User.find();
        const properties = await Property.find();
        console.log('✅ Found', users.length, 'user(s)');
        console.log('✅ Found', properties.length, 'property(ies)\n');

        // Test 5: Cleanup
        console.log('Test 5: Cleaning up test data...');
        await User.deleteOne({ _id: testUser._id });
        await Property.deleteOne({ _id: testProperty._id });
        console.log('✅ Test data cleaned up\n');

        // Success Summary
        console.log('✅✅✅ All tests passed! ✅✅✅');
        console.log('\nYour MongoDB database is ready to use!');
        console.log('You can now start the backend server with:');
        console.log('  npm run dev\n');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your .env file has the correct MONGODB_URI');
        console.log('2. Ensure your MongoDB Atlas cluster is running');
        console.log('3. Verify IP whitelist includes 0.0.0.0/0');
        console.log('4. Check username and password in connection string\n');
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit();
    }
}

testDatabase();
