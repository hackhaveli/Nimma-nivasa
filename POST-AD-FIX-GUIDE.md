# Post Ad Screen - Implementation Guide

## Issues Found

### 1. Image Upload Not Working ❌
- **Line 40-42**: Images are hardcoded
- **Line 227**: Upload button has no `onPress` handler
- **Need**: Integration with `expo-image-picker`

### 2. Location Pin Not Working ❌
- **Line 241**: Map button has no `onPress` handler
- **Line 68-69**: Location hardcoded to Delhi
- **Need**: Integration with `expo-location` or map picker

## Quick Fix Implementation

### Step 1: Install Required Packages
```bash
cd AIProp
npx expo install expo-image-picker expo-location
```

### Step 2: Update Post Screen

Add these state variables:
```typescript
const [images, setImages] = useState<string[]>([]);
const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
const [pickingLocation, setPickingLocation] = useState(false);
```

Add image picker function:
```typescript
const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
        const uris = result.assets.map(asset => asset.uri);
        setImages([...images, ...uris].slice(0, 5));
    }
};
```

Add location picker function:
```typescript
const pickLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant location permissions');
        return;
    }

   setPickingLocation(true);
    const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });
    
    setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
    });
    setPickingLocation(false);
    
    Alert.alert('Success', 'Location captured successfully!');
};
```

### Step 3: Update UI Elements

**Upload Button** (Line 227):
```typescript
<TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
```

**Map Button** (Line 241):
```typescript
<TouchableOpacity 
    style={styles.mapButton} 
    onPress={pickLocation}
    disabled={pickingLocation}
>
    <MapPin size={20} color="#8B5CF6" />
    <View style={styles.mapButtonContent}>
        <Text style={styles.mapButtonText}>
            {location ? 'Location Captured ✓' : 'Pick Location on Map'}
        </Text>
        <Text style={styles.mapButtonSubtext}>
            {location 
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : 'Pinpoint exact location'
            }
        </Text>
    </View>
</TouchableOpacity>
```

### Step 4: Update Submit Handler

```typescript
const handleSubmit = async () => {
    // ... existing validation ...
    
    if (images.length === 0) {
        Alert.alert('Error', 'Please add at least one image');
        return;
    }
    
    if (!location) {
        Alert.alert('Error', 'Please select location on map');
        return;
    }
    
    const propertyData = {
        // ... existing fields ...
        images: images,
        location: {
            latitude: location.latitude,
            longitude: location.longitude,
            areaName,
            city,
            landmark: landmark || undefined,
        },
    };
    
    await addProperty(propertyData);
    Alert.alert('Success', 'Property posted successfully!');
};
```

## Alternative: Simple Manual Location Entry

If map picker is complex, allow manual lat/lng entry:

```typescript
const [latitude, setLatitude] = useState('');
const [longitude, setLongitude] = useState('');

// In UI:
<View style={styles.row}>
    <View style={[styles.inputGroup, styles.flex1]}>
        <Text style={styles.label}>Latitude</Text>
        <TextInput
            style={styles.input}
            placeholder="28.7041"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="decimal-pad"
        />
    </View>
    <View style={[styles.inputGroup, styles.flex1]}>
        <Text style={styles.label}>Longitude</Text>
        <TextInput
            style={styles.input}
            placeholder="77.1025"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="decimal-pad"
        />
    </View>
</View>
```

## Files to Modify

1. `AIProp/app/(tabs)/post.tsx` - Main post screen
2. `AIProp/services/imageUpload.ts` - Image upload service (if using Cloudinary)

## Testing Steps

1. ✅ Test image picker opens
2. ✅ Multiple images can be selected
3. ✅ Images preview correctly
4. ✅ Location permission requested
5. ✅ GPS coordinates captured
6. ✅ Form submission works with real data
7. ✅ Property appears in database with images & location
