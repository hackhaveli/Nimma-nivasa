const mongoose = require('mongoose');
const Property = require('./models/Property');
const User = require('./models/User');
require('dotenv').config();

// Sample properties across different locations in India
const sampleProperties = [
    {
        title: "Luxury Villa in Bangalore",
        category: "House",
        purpose: "Sale",
        price: 12500000,
        images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
        ],
        location: {
            latitude: 12.9716,
            longitude: 77.5946,
            areaName: "Koramangala",
            city: "Bangalore",
            landmark: "Near Sony World Junction"
        },
        width: 2400,
        length: 3000,
        description: "Beautiful 4BHK villa with modern amenities in prime Koramangala location",
        ownerName: "Rajesh Kumar",
        whatsappNumber: "9876543210",
        bedrooms: 4,
        kitchen: 2,
        hall: 2
    },
    {
        title: "Commercial Shop in Delhi",
        category: "Shop",
        purpose: "Rent",
        price: 75000,
        images: [
            "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800",
            "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800"
        ],
        location: {
            latitude: 28.7041,
            longitude: 77.1025,
            areaName: "Connaught Place",
            city: "New Delhi",
            landmark: "Near Rajiv Chowk Metro"
        },
        width: 800,
        length: 1200,
        description: "Prime location shop in CP, perfect for retail business",
        ownerName: "Amit Sharma",
        whatsappNumber: "9123456789"
    },
    {
        title: "Residential Plot in Mumbai",
        category: "Plot",
        purpose: "Sale",
        price: 8900000,
        images: [
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"
        ],
        location: {
            latitude: 19.0760,
            longitude: 72.8777,
            areaName: "Andheri West",
            city: "Mumbai",
            landmark: "Near DN Nagar Metro"
        },
        width: 1500,
        length: 2000,
        description: "Ready to build residential plot in prime Mumbai location",
        ownerName: "Priya Patel",
        whatsappNumber: "9988776655"
    },
    {
        title: "Modern Apartment in Hyderabad",
        category: "House",
        purpose: "Rent",
        price: 35000,
        images: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
        ],
        location: {
            latitude: 17.3850,
            longitude: 78.4867,
            areaName: "Gachibowli",
            city: "Hyderabad",
            landmark: "Near IT Park"
        },
        width: 1800,
        length: 2200,
        description: "Spacious 3BHK apartment with all modern facilities",
        ownerName: "Suresh Reddy",
        whatsappNumber: "9876549876",
        bedrooms: 3,
        kitchen: 1,
        hall: 1
    },
    {
        title: "Agricultural Land in Pune",
        category: "Land",
        purpose: "Sale",
        price: 5500000,
        images: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
        ],
        location: {
            latitude: 18.5204,
            longitude: 73.8567,
            areaName: "Hinjewadi",
            city: "Pune",
            landmark: "Near Rajiv Gandhi Infotech Park"
        },
        width: 5000,
        length: 8000,
        description: "fertile agricultural land perfect for farming or investment",
        ownerName: "Ganesh Bhosale",
        whatsappNumber: "9765432109"
    }
];

async function seedDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if properties already exist
        const existingCount = await Property.countDocuments();
        console.log(`📊 Existing properties: ${existingCount}\n`);

        if (existingCount > 0) {
            console.log('⚠️  Database already has properties. Skipping seed.\n');
            console.log('💡 To reseed, delete existing properties first or modify this script.');
            process.exit(0);
        }

        // Find or create a default user for the properties
        let defaultUser = await User.findOne({ mobile: '9999999999' });

        if (!defaultUser) {
            console.log('Creating default user...');
            defaultUser = await User.create({
                name: 'Admin User',
                mobile: '9999999999',
                password: 'admin123',
                isAdmin: true
            });
            console.log('✅ Default user created\n');
        }

        // Insert sample properties
        console.log('🌱 Seeding sample properties...\n');

        for (const propData of sampleProperties) {
            const property = await Property.create({
                ...propData,
                owner: defaultUser._id
            });
            console.log(`✅ Created: ${property.title}`);
            console.log(`   Location: ${property.location.city}, ${property.location.areaName}`);
            console.log(`   Coordinates: [${property.location.coordinates}]\n`);
        }

        console.log(`\n🎉 Successfully seeded ${sampleProperties.length} properties!`);
        console.log('\n📍 Properties are distributed across:');
        console.log('   - Bangalore (Koramangala)');
        console.log('   - Delhi (Connaught Place)');
        console.log('   - Mumbai (Andheri West)');
        console.log('   - Hyderabad (Gachibowli)');
        console.log('   - Pune (Hinjewadi)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
