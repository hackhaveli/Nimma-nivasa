# Location Feature Implementation Guide

## Critical Missing Feature: Location-Aware Property Listings

### What's Missing?

The app currently shows ALL properties without considering user location. Per spec:
- **Must be location-aware**
- **Never show empty list** if properties exist in DB
- Show distance from user
- Fallback to nearby properties if none in current location

---

## Implementation Steps

### Step 1: Install Location Package

```bash
cd AIProp
npx expo install expo-location
```

### Step 2: Add MongoDB Geospatial Index

**File:** `backend/models/Property.js`

Add after the schema definition:

```javascript
// Add 2dsphere index for geospatial queries
propertySchema.index({ 'location.coordinates': '2dsphere' });
```

Update location field in schema:

```javascript
location: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
    },
    areaName: String,
    city: String,
    landmark: String,
    latitude: Number,  // Keep for backward compatibility
    longitude: Number
}
```

### Step 3: Create Location Hook

**File:** `AIProp/hooks/useLocation.ts`

```typescript
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy: number | null;
}

export function useLocation() {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                setError('Location permission denied');
                setLoading(false);
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLocation({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                accuracy: currentLocation.coords.accuracy,
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to get location');
            setLoading(false);
        }
    };

    return { location, loading, error, refresh: requestLocationPermission };
}
```

### Step 4: Update AppContext with Location

**File:** `AIProp/contexts/AppContext.tsx`

Add to context:

```typescript
const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

// Add to context value
{
    // ... existing values
    userLocation,
    setUserLocation,
}
```

### Step 5: Update Backend Property Routes

**File:** `backend/routes/properties.js`

Add new route for location-based queries:

```javascript
// GET /api/properties/nearby
router.get('/nearby', async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 5000, limit = 20 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // Try to find properties within radius
        let properties = await Property.find({
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat] // MongoDB uses [lng, lat]
                    },
                    $maxDistance: parseInt(maxDistance) // meters
                }
            },
            isActive: true
        })
        .populate('owner', 'name mobile')
        .limit(parseInt(limit));

        let isFallback = false;

        // FALLBACK LOGIC: If no properties found, expand search
        if (properties.length === 0) {
            // Try 50km
            properties = await Property.find({
                'location.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        $maxDistance: 50000 // 50km
                    }
                },
                isActive: true
            })
            .populate('owner', 'name mobile')
            .limit(parseInt(limit));

            isFallback = true;
        }

        // ULTIMATE FALLBACK: If still no properties, show all
        if (properties.length === 0) {
            properties = await Property.find({ isActive: true })
                .populate('owner', 'name mobile')
                .limit(parseInt(limit));
            
            isFallback = true;
        }

        // Calculate distances
        properties = properties.map(prop => {
            const propObj = prop.toJSON ? prop.toJSON() : prop;
            const distance = calculateDistance(
                lat,
                lng,
                propObj.location.coordinates[1],
                propObj.location.coordinates[0]
            );
            return {
                ...propObj,
                distance: distance.toFixed(2) // km
            };
        });

        res.json({
            success: true,
            properties,
            isFallback,
            userLocation: { latitude: lat, longitude: lng }
        });

    } catch (error) {
        console.error('Nearby properties error:', error);
        res.status(500).json({ error: 'Failed to fetch nearby properties' });
    }
});

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
```

### Step 6: Update Frontend API Service

**File:** `AIProp/services/api.ts`

Add to propertiesAPI:

```typescript
getNearby: async (latitude: number, longitude: number, maxDistance = 5000) => {
    const response = await api.get('/properties/nearby', {
        params: { latitude, longitude, maxDistance }
    });
    return response.data;
},
```

### Step 7: Update Home Screen

**File:** `AIProp/app/(tabs)/index.tsx`

```typescript
import { useLocation } from '@/hooks/useLocation';

export default function HomeScreen() {
    const { location, loading: locationLoading } = useLocation();
    const [properties, setProperties] = useState([]);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        if (location) {
            loadNearbyProperties();
        }
    }, [location]);

    const loadNearbyProperties = async () => {
        try {
            const result = await propertiesAPI.getNearby(
                location.latitude,
                location.longitude
            );
            setProperties(result.properties);
            setIsFallback(result.isFallback);
        } catch (error) {
            console.error('Failed to load properties:', error);
        }
    };

    return (
        <>
            {isFallback && (
                <View style={styles.fallbackBanner}>
                    <Text style={styles.fallbackText}>
                        No properties found nearby, showing available options
                    </Text>
                </View>
            )}
            {/* Property cards with distance */}
            {properties.map(property => (
                <PropertyCard 
                    key={property.id}
                    property={property}
                    distance={property.distance} // NEW: show distance
                />
            ))}
        </>
    );
}
```

### Step 8: Update Property Card to Show Distance

**File:** Update PropertyCard component

```typescript
<View style={styles.distanceBadge}>
    <MapPin size={12} color="#8B5CF6" />
    <Text style={styles.distanceText}>{distance} km away</Text>
</View>
```

---

## Testing Checklist

- [ ] Location permission requested on app launch
- [ ] Properties sorted by distance
- [ ] Distance shown on each card
- [ ] User in location with NO properties → sees nearby fallback
- [ ] Fallback banner shows when appropriate
- [ ] Search/filter still work during fallback
- [ ] Manual location change updates results
- [ ] Never shows empty list (if properties exist in DB)

---

## Files to Create/Modify

### New Files:
1. `AIProp/hooks/useLocation.ts`

### Files to Modify:
1. `backend/models/Property.js` - Add geospatial index
2. `backend/routes/properties.js` - Add nearby endpoint + fallback logic
3. `AIProp/contexts/AppContext.tsx` - Add user location state
4. `AIProp/services/api.ts` - Add getNearby method
5. `AIProp/app/(tabs)/index.tsx` - Use location-based queries
6. Property card component - Show distance

---

## Expected Behavior

1. **App opens** → Requests location permission
2. **Permission granted** → Gets lat/lng
3. **Loads properties** → Queries within 5km radius
4. **If found** → Shows sorted by distance
5. **If not found** → Expands to 50km
6. **Still not found** → Shows all properties
7. **Banner shows** → "No properties nearby, showing available options"
8. **User sees** → Never an empty screen

This ensures users always see listings and can browse/search!
