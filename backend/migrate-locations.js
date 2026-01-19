const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

async function migratePropertyLocations() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all properties
        const properties = await Property.find({});
        console.log(`📊 Found ${properties.length} properties\n`);

        let updated = 0;
        let skipped = 0;

        for (const property of properties) {
            // Check if coordinates already exist and are valid
            if (property.location.coordinates &&
                Array.isArray(property.location.coordinates) &&
                property.location.coordinates.length === 2) {
                console.log(`⏭️  Skipping: ${property.title} (coordinates already exist)`);
                skipped++;
                continue;
            }

            // Populate coordinates from lat/lng
            if (property.location.latitude && property.location.longitude) {
                property.location.coordinates = [
                    property.location.longitude,
                    property.location.latitude
                ];
                property.location.type = 'Point';

                await property.save();
                console.log(`✅ Updated: ${property.title}`);
                console.log(`   Location: [${property.location.longitude}, ${property.location.latitude}]`);
                updated++;
            } else {
                console.log(`⚠️  Missing lat/lng: ${property.title}`);
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   Total properties: ${properties.length}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Missing data: ${properties.length - updated - skipped}`);

        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migratePropertyLocations();
