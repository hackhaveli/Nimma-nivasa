const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
require('dotenv').config();

console.log('🌱 Seeding database with sample data...\n');

const sampleProperties = [
    {
        title: "Luxury 3 BHK Villa with Swimming Pool",
        category: "House",
        purpose: "Sale",
        price: 8500000,
        images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
        ],
        location: {
            latitude: 28.7041,
            longitude: 77.1025,
            areaName: "Connaught Place",
            city: "New Delhi",
            landmark: "Near Central Park"
        },
        width: 2500,
        length: 3000,
        description: "Stunning luxury villa with modern amenities, spacious rooms, and a beautiful swimming pool. Perfect for families looking for comfort and style.",
        ownerName: "Rajesh Kumar",
        whatsappNumber: "+919876543210",
        bedrooms: 3,
        kitchen: 1,
        hall: 2
    },
    {
        title: "Modern 2 BHK Apartment in Prime Location",
        category: "House",
        purpose: "Rent",
        price: 35000,
        images: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
        ],
        location: {
            latitude: 28.5355,
            longitude: 77.3910,
            areaName: "Noida Sector 62",
            city: "Noida",
            landmark: "Near Metro Station"
        },
        width: 1200,
        length: 1500,
        description: "Well-maintained 2 BHK apartment in a gated community with all modern facilities including gym, park, and 24/7 security.",
        ownerName: "Priya Sharma",
        whatsappNumber: "+919876543211",
        bedrooms: 2,
        kitchen: 1,
        hall: 1
    },
    {
        title: "Commercial Plot in IT Hub Area",
        category: "Plot",
        purpose: "Sale",
        price: 12000000,
        images: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
        ],
        location: {
            latitude: 28.4595,
            longitude: 77.0266,
            areaName: "Gurgaon Cyber City",
            city: "Gurgaon",
            landmark: "Opposite DLF Phase 2"
        },
        width: 1000,
        length: 1500,
        description: "Prime commercial plot in the heart of Gurgaon's IT hub. Perfect for building offices or commercial complex.",
        ownerName: "Amit Verma",
        whatsappNumber: "+919876543212"
    },
    {
        title: "Spacious 4 BHK Penthouse with Terrace",
        category: "House",
        purpose: "Sale",
        price: 15000000,
        images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
        ],
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            areaName: "Vasant Vihar",
            city: "New Delhi",
            landmark: "Near Diplomatic Enclave"
        },
        width: 3000,
        length: 3500,
        description: "Exclusive penthouse with panoramic city views, private terrace, and premium finishes throughout.",
        ownerName: "Sanjay Patel",
        whatsappNumber: "+919876543213",
        bedrooms: 4,
        kitchen: 1,
        hall: 2
    },
    {
        title: "Prime Retail Shop in Shopping Complex",
        category: "Shop",
        purpose: "Rent",
        price: 85000,
        images: [
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
        ],
        location: {
            latitude: 28.6692,
            longitude: 77.4538,
            areaName: "Indirapuram",
            city: "Ghaziabad",
            landmark: "Shipra Mall Complex"
        },
        width: 400,
        length: 600,
        description: "Well-located retail shop in busy shopping complex with high footfall. Ideal for clothing, electronics, or food business.",
        ownerName: "Neha Gupta",
        whatsappNumber: "+919876543214"
    },
    {
        title: "Agricultural Land with Water Connection",
        category: "Land",
        purpose: "Sale",
        price: 3500000,
        images: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
        ],
        location: {
            latitude: 28.8955,
            longitude: 76.6066,
            areaName: "Sonipat Ring Road",
            city: "Sonipat",
            landmark: "Near NH-1"
        },
        width: 5000,
        length: 10000,
        description: "Fertile agricultural land with water connection and electricity. Perfect for farming or future development.",
        ownerName: "Harish Singh",
        whatsappNumber: "+919876543215"
    },
    {
        title: "Studio Apartment for Young Professionals",
        category: "House",
        purpose: "Rent",
        price: 18000,
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
        ],
        location: {
            latitude: 28.4089,
            longitude: 77.3178,
            areaName: "Nehru Place",
            city: "New Delhi",
            landmark: "Near Metro Station"
        },
        width: 400,
        length: 500,
        description: "Compact and modern studio apartment perfect for single professionals. Fully furnished with all amenities.",
        ownerName: "Kavita Mehra",
        whatsappNumber: "+919876543216",
        bedrooms: 1,
        kitchen: 1,
        hall: 0
    },
    {
        title: "Corner Plot in Residential Colony",
        category: "Plot",
        purpose: "Sale",
        price: 4500000,
        images: [
            "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800"
        ],
        location: {
            latitude: 28.4744,
            longitude: 77.5040,
            areaName: "Greater Noida West",
            city: "Greater Noida",
            landmark: "Gaur City"
        },
        width: 800,
        length: 1200,
        description: "Corner plot in well-developed residential colony. Ideal for building your dream home with proper connectivity.",
        ownerName: "Deepak Agarwal",
        whatsappNumber: "+919876543217"
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Create a demo user
        console.log('Creating demo user...');
        const demoUser = await User.findOne({ mobile: '+919876543210' });

        let userId;
        if (demoUser) {
            console.log('✅ Demo user already exists:', demoUser.name);
            userId = demoUser._id;
        } else {
            const newUser = new User({
                name: 'Demo User',
                mobile: '+919876543210',
                password: 'password123',
                email: 'demo@aiprop.com',
                isVerified: true,
                isPremium: false
            });
            await newUser.save();
            userId = newUser._id;
            console.log('✅ Demo user created:', newUser.name);
        }

        // Check if properties already exist
        const existingCount = await Property.countDocuments();
        if (existingCount > 0) {
            console.log(`\n⚠️  Database already has ${existingCount} properties`);
            console.log('Do you want to:');
            console.log('1. Keep existing and add more samples (run again)');
            console.log('2. Clear all and reseed (delete manually in MongoDB Atlas)');
            console.log('\nSkipping seed to avoid duplicates...\n');
        } else {
            // Insert sample properties
            console.log('\nInserting sample properties...');

            const propertiesWithOwner = sampleProperties.map(prop => ({
                ...prop,
                owner: userId
            }));

            const insertedProperties = await Property.insertMany(propertiesWithOwner);
            console.log(`✅ Inserted ${insertedProperties.length} sample properties\n`);

            // Update user's posting count
            await User.findByIdAndUpdate(userId, {
                postings: insertedProperties.length,
                views: Math.floor(Math.random() * 1000) + 500,
                leads: Math.floor(Math.random() * 50) + 10
            });
            console.log('✅ Updated user stats\n');
        }

        // Show summary
        const totalProperties = await Property.countDocuments();
        const totalUsers = await User.countDocuments();

        console.log('📊 Database Summary:');
        console.log(`   Users: ${totalUsers}`);
        console.log(`   Properties: ${totalProperties}`);
        console.log('\n✅✅✅ Database seeded successfully! ✅✅✅\n');
        console.log('You can now:');
        console.log('1. Start the backend: npm run dev');
        console.log('2. Login with: +919876543210 / password123');
        console.log('3. Browse the sample properties in your app!\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your .env file has the correct MONGODB_URI');
        console.log('2. Ensure MongoDB Atlas IP whitelist includes your IP');
        console.log('3. Verify the connection string format\n');
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit();
    }
}

seedDatabase();
