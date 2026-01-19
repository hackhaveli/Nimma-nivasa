import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Upload, Check, Home, Building2, Store, Landmark, X } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useApp } from '@/contexts/AppContext';
import { useLocation } from '@/hooks/useLocation';
import type { Property } from '@/mocks/properties';

type CategoryType = 'House' | 'Plot' | 'Shop' | 'Land';
type PurposeType = 'Rent' | 'Sale';

export default function PostScreen() {
    const { addProperty, isAuthenticated } = useApp();
    const { location: userLocation, loading: locationLoading } = useLocation();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CategoryType>('House');
    const [purpose, setPurpose] = useState<PurposeType>('Sale');
    const [price, setPrice] = useState('');
    const [width, setWidth] = useState('');
    const [length, setLength] = useState('');
    const [description, setDescription] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [areaName, setAreaName] = useState('');
    const [city, setCity] = useState('');
    const [landmark, setLandmark] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [kitchen, setKitchen] = useState('');
    const [hall, setHall] = useState('');

    // Image and location state
    const [images, setImages] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Map picker modal state
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [tempLocation, setTempLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Please grant camera roll permissions to upload images');
                return;
            }

            setUploadingImage(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.7,
                selectionLimit: 5 - images.length,
            });

            if (!result.canceled && result.assets) {
                const newUris = result.assets.map(asset => asset.uri);
                setImages([...images, ...newUris].slice(0, 5));
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick images');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const useCurrentLocation = () => {
        if (userLocation) {
            setSelectedLocation({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            });

            if (userLocation.address) {
                if (!areaName) setAreaName(userLocation.address.area || '');
                if (!city) setCity(userLocation.address.city || '');
            }

            Alert.alert('Success', 'Current location captured!');
        } else if (locationLoading) {
            Alert.alert('Please Wait', 'Getting your location...');
        } else {
            Alert.alert('Error', 'Location not available. Please enable GPS and restart the app.');
        }
    };

    // Open map picker modal
    const openMapPicker = () => {
        // Start with current location or selected location or default to India center
        const initialLat = selectedLocation?.latitude || userLocation?.latitude || 28.6139;
        const initialLng = selectedLocation?.longitude || userLocation?.longitude || 77.2090;

        setTempLocation({
            latitude: initialLat,
            longitude: initialLng,
        });
        setMapModalVisible(true);
    };

    // Confirm location from map picker with reverse geocoding
    const confirmLocationFromMap = async () => {
        if (tempLocation) {
            setSelectedLocation(tempLocation);
            setMapModalVisible(false);

            try {
                // Reverse geocode to get address details
                const addresses = await Location.reverseGeocodeAsync({
                    latitude: tempLocation.latitude,
                    longitude: tempLocation.longitude,
                });

                if (addresses.length > 0) {
                    const address = addresses[0];
                    // Auto-fill area name and city if empty
                    const newAreaName = address.street || address.name || address.district || address.subregion || '';
                    const newCity = address.city || address.region || '';

                    if (!areaName && newAreaName) setAreaName(newAreaName);
                    if (!city && newCity) setCity(newCity);

                    Alert.alert(
                        'Location Selected',
                        `📍 ${newAreaName || 'Unknown Area'}${newCity ? ', ' + newCity : ''}\n\nCoordinates: ${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`
                    );
                } else {
                    Alert.alert('Location Selected', `Coordinates: ${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`);
                }
            } catch (error) {
                console.log('Reverse geocoding failed:', error);
                Alert.alert('Location Selected', `Coordinates: ${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`);
            }
        } else {
            setMapModalVisible(false);
        }
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            Alert.alert('Login Required', 'Please login to post a property');
            router.push('/profile');
            return;
        }

        if (!title || !price || !areaName || !city || !ownerName || !whatsappNumber) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (images.length === 0) {
            Alert.alert('Error', 'Please add at least one property image');
            return;
        }

        if (!selectedLocation) {
            Alert.alert('Error', 'Please capture location');
            return;
        }

        if (category === 'House' && (!bedrooms || !kitchen || !hall)) {
            Alert.alert('Error', 'Please fill house-specific fields');
            return;
        }

        const propertyData: Omit<Property, 'id' | 'views' | 'leads' | 'createdAt'> = {
            title,
            price: parseFloat(price),
            purpose,
            category,
            images,
            location: {
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                areaName,
                city,
                landmark: landmark || undefined,
            },
            width: parseFloat(width) || 0,
            length: parseFloat(length) || 0,
            description,
            ownerName,
            whatsappNumber,
        };

        if (category === 'House') {
            propertyData.bedrooms = parseInt(bedrooms) || 0;
            propertyData.kitchen = parseInt(kitchen) || 0;
            propertyData.hall = parseInt(hall) || 0;
        }

        try {
            await addProperty(propertyData);
            Alert.alert('Success', 'Property posted successfully!', [
                { text: 'OK', onPress: () => router.push('/') },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to post property. Please try again.');
        }
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <View style={styles.loginIconContainer}>
                        <Building2 size={56} color="#8B5CF6" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.loginTitle}>Login Required</Text>
                    <Text style={styles.loginSubtitle}>Please login to post your properties</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/profile')}
                    >
                        <Text style={styles.loginButtonText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const getCategoryIcon = (cat: CategoryType) => {
        switch (cat) {
            case 'House':
                return <Home size={18} color={category === cat ? '#FFFFFF' : '#6B7280'} />;
            case 'Plot':
                return <Landmark size={18} color={category === cat ? '#FFFFFF' : '#6B7280'} />;
            case 'Shop':
                return <Store size={18} color={category === cat ? '#FFFFFF' : '#6B7280'} />;
            case 'Land':
                return <Building2 size={18} color={category === cat ? '#FFFFFF' : '#6B7280'} />;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Post New Property</Text>
                    <Text style={styles.headerSubtitle}>Fill in the details below</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Basic Information</Text>
                            <Text style={styles.requiredBadge}>* Required</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Property Title *</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 3 BHK Luxury Villa with Garden"
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category *</Text>
                            <View style={styles.categoryGrid}>
                                {(['House', 'Plot', 'Shop', 'Land'] as CategoryType[]).map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryCard, category === cat && styles.categoryCardActive]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        {getCategoryIcon(cat)}
                                        <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Purpose *</Text>
                            <View style={styles.pillRow}>
                                {(['Sale', 'Rent'] as PurposeType[]).map((pur) => (
                                    <TouchableOpacity
                                        key={pur}
                                        style={[styles.purposePill, purpose === pur && styles.purposePillActive]}
                                        onPress={() => setPurpose(pur)}
                                    >
                                        {purpose === pur && <Check size={16} color="#FFFFFF" />}
                                        <Text style={[styles.purposePillText, purpose === pur && styles.purposePillTextActive]}>
                                            {pur}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Price (₹) *</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputPrefix}>₹</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter price"
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Property Images *</Text>
                            <Text style={styles.cardSubtitle}>
                                {images.length}/5 images • First image is cover
                            </Text>
                        </View>

                        {images.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.imageScroll}
                            >
                                {images.map((uri, index) => (
                                    <View key={index} style={styles.imagePreviewCard}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        {index === 0 && (
                                            <View style={styles.coverBadge}>
                                                <Text style={styles.coverBadgeText}>Cover</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(index)}
                                        >
                                            <X size={16} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyImageState}>
                                <Upload size={40} color="#CBD5E1" />
                                <Text style={styles.emptyImageText}>No images added yet</Text>
                            </View>
                        )}

                        {images.length < 5 && (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={pickImages}
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? (
                                    <ActivityIndicator color="#8B5CF6" />
                                ) : (
                                    <>
                                        <Upload size={20} color="#8B5CF6" />
                                        <Text style={styles.uploadButtonText}>
                                            {images.length === 0 ? 'Add Images' : 'Add More Images'}
                                        </Text>
                                        <Text style={styles.uploadButtonSubtext}>
                                            Select up to {5 - images.length} more photo{5 - images.length !== 1 ? 's' : ''}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Location Details *</Text>
                            <MapPin size={18} color="#8B5CF6" />
                        </View>

                        <View style={styles.mapContainer}>
                            {selectedLocation ? (
                                <MapView
                                    provider={PROVIDER_GOOGLE}
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: selectedLocation.latitude,
                                        longitude: selectedLocation.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={true}
                                    zoomEnabled={true}
                                    pitchEnabled={true}
                                    rotateEnabled={true}
                                >
                                    <Marker
                                        draggable
                                        coordinate={{
                                            latitude: selectedLocation.latitude,
                                            longitude: selectedLocation.longitude,
                                        }}
                                        title="Drag to adjust location"
                                        description="Move this pin to select exact location"
                                        onDragEnd={(e) => {
                                            setSelectedLocation({
                                                latitude: e.nativeEvent.coordinate.latitude,
                                                longitude: e.nativeEvent.coordinate.longitude,
                                            });
                                        }}
                                    />
                                </MapView>
                            ) : (
                                <TouchableOpacity
                                    style={styles.mapPlaceholder}
                                    onPress={openMapPicker}
                                >
                                    <MapPin size={40} color="#8B5CF6" />
                                    <Text style={styles.mapPlaceholderText}>Tap to Pick Location on Map</Text>
                                </TouchableOpacity>
                            )}

                            <View style={styles.locationButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.locationBtn, styles.currentLocationBtn]}
                                    onPress={useCurrentLocation}
                                    disabled={locationLoading}
                                >
                                    {locationLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <MapPin size={18} color="#FFFFFF" />
                                            <Text style={styles.locationBtnText}>
                                                {selectedLocation ? 'Update GPS' : 'Use GPS'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.locationBtn, styles.pickMapBtn]}
                                    onPress={openMapPicker}
                                >
                                    <MapPin size={18} color="#FFFFFF" />
                                    <Text style={styles.locationBtnText}>Pick on Map</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedLocation && (
                                <View style={styles.locationInfoBox}>
                                    {(areaName || city) && (
                                        <Text style={styles.locationNameText}>
                                            📍 {areaName}{areaName && city ? ', ' : ''}{city}
                                        </Text>
                                    )}
                                    <Text style={styles.coordsText}>
                                        {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.flex1]}>
                                <Text style={styles.label}>Area Name *</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Connaught Place"
                                        value={areaName}
                                        onChangeText={setAreaName}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, styles.flex1]}>
                                <Text style={styles.label}>City *</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Delhi"
                                        value={city}
                                        onChangeText={setCity}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Landmark (Optional)</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Near Central Park"
                                    value={landmark}
                                    onChangeText={setLandmark}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Property Dimensions</Text>
                            <Text style={styles.cardSubtitle}>In square feet</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.flex1]}>
                                <Text style={styles.label}>Width (ft)</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={width}
                                        onChangeText={setWidth}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                            <View style={styles.dimensionSeparator}>
                                <Text style={styles.dimensionSeparatorText}>×</Text>
                            </View>
                            <View style={[styles.inputGroup, styles.flex1]}>
                                <Text style={styles.label}>Length (ft)</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={length}
                                        onChangeText={setLength}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                        </View>

                        {width && length && (
                            <View style={styles.totalAreaCard}>
                                <Text style={styles.totalAreaLabel}>Total Area</Text>
                                <Text style={styles.totalAreaValue}>
                                    {(parseFloat(width) * parseFloat(length)).toLocaleString()} sq ft
                                </Text>
                            </View>
                        )}
                    </View>

                    {category === 'House' && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>House Details *</Text>
                                <Home size={18} color="#8B5CF6" />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, styles.flex1]}>
                                    <Text style={styles.label}>Bedrooms</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0"
                                            value={bedrooms}
                                            onChangeText={setBedrooms}
                                            keyboardType="numeric"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, styles.flex1]}>
                                    <Text style={styles.label}>Kitchen</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="0"
                                            value={kitchen}
                                            onChangeText={setKitchen}
                                            keyboardType="numeric"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Hall</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={hall}
                                        onChangeText={setHall}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Additional Details</Text>
                            <Text style={styles.cardSubtitle}>Tell us more</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe your property features, amenities, and highlights..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Contact Information *</Text>
                            <Text style={styles.cardSubtitle}>For potential buyers</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Owner Name</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter owner name"
                                    value={ownerName}
                                    onChangeText={setOwnerName}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>WhatsApp Number</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputPrefix}>📱</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="+91 9876543210"
                                    value={whatsappNumber}
                                    onChangeText={setWhatsappNumber}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Check size={20} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Post Property</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Map Picker Modal */}
            <Modal
                visible={mapModalVisible}
                animationType="slide"
                onRequestClose={() => setMapModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setMapModalVisible(false)}
                        >
                            <X size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Pick Location</Text>
                        <TouchableOpacity
                            style={styles.modalConfirmBtn}
                            onPress={confirmLocationFromMap}
                        >
                            <Check size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalMapContainer}>
                        {tempLocation && (
                            <MapView
                                style={styles.fullMap}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: tempLocation.latitude,
                                    longitude: tempLocation.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                onPress={(e) => {
                                    setTempLocation({
                                        latitude: e.nativeEvent.coordinate.latitude,
                                        longitude: e.nativeEvent.coordinate.longitude,
                                    });
                                }}
                            >
                                <Marker
                                    draggable
                                    coordinate={{
                                        latitude: tempLocation.latitude,
                                        longitude: tempLocation.longitude,
                                    }}
                                    title="Drag or tap to move"
                                    onDragEnd={(e) => {
                                        setTempLocation({
                                            latitude: e.nativeEvent.coordinate.latitude,
                                            longitude: e.nativeEvent.coordinate.longitude,
                                        });
                                    }}
                                />
                            </MapView>
                        )}
                    </View>

                    <View style={styles.modalFooter}>
                        <View style={styles.modalCoordsBox}>
                            <Text style={styles.modalCoordsLabel}>Selected Location:</Text>
                            <Text style={styles.modalCoordsValue}>
                                {tempLocation ?
                                    `${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`
                                    : 'Not selected'}
                            </Text>
                        </View>
                        <Text style={styles.modalHint}>
                            👆 Tap anywhere on the map or drag the marker
                        </Text>
                        <TouchableOpacity
                            style={styles.modalConfirmButton}
                            onPress={confirmLocationFromMap}
                        >
                            <Check size={22} color="#FFFFFF" />
                            <Text style={styles.modalConfirmText}>Confirm Location</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#6B7280',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        gap: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    requiredBadge: {
        fontSize: 11,
        fontWeight: '600',
        color: '#EF4444',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        gap: 10,
    },
    inputPrefix: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    input: {
        flex: 1,
        padding: 14,
        fontSize: 15,
        color: '#111827',
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    categoryGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    categoryCard: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    categoryCardActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    pillRow: {
        flexDirection: 'row',
        gap: 12,
    },
    purposePill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    purposePillActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    purposePillText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
    purposePillTextActive: {
        color: '#FFFFFF',
    },
    imageUploadContainer: {
        gap: 12,
    },
    imagePreview: {
        position: 'relative',
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    coverBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    coverBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    uploadButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 20,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        backgroundColor: '#FAFBFC',
    },
    uploadButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8B5CF6',
        marginTop: 4,
    },
    uploadButtonSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#EDE9FE',
        borderWidth: 1,
        borderColor: '#DDD6FE',
    },
    mapButtonContent: {
        flex: 1,
    },
    mapButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    mapButtonSubtext: {
        fontSize: 12,
        color: '#7C3AED',
        marginTop: 2,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
    },
    flex1: {
        flex: 1,
    },
    dimensionSeparator: {
        paddingBottom: 14,
    },
    dimensionSeparatorText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    totalAreaCard: {
        backgroundColor: '#EDE9FE',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    totalAreaLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7C3AED',
    },
    totalAreaValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#8B5CF6',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    loginIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    loginTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    loginSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 16,
        paddingHorizontal: 40,
        paddingVertical: 16,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    imageScroll: {
        marginVertical: 8,
    },
    imagePreviewCard: {
        position: 'relative',
        width: 160,
        height: 120,
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#EF4444',
        borderRadius: 16,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyImageState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyImageText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    mapButtonActive: {
        backgroundColor: '#D1FAE5',
        borderColor: '#A7F3D0',
    },
    mapButtonTextActive: {
        color: '#10B981',
    },
    mapContainer: {
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    map: {
        width: '100%',
        height: 200,
    },
    mapPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    mapPlaceholderText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '600',
    },
    // Location buttons
    locationButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    locationBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
    },
    currentLocationBtn: {
        backgroundColor: '#10B981',
    },
    pickMapBtn: {
        backgroundColor: '#8B5CF6',
    },
    locationBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    locationInfoBox: {
        marginTop: 12,
        backgroundColor: '#F0FDF4',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#86EFAC',
    },
    locationNameText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#166534',
        marginBottom: 4,
    },
    coordsText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    // Map Picker Modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalCloseBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalConfirmBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalMapContainer: {
        flex: 1,
    },
    fullMap: {
        width: '100%',
        height: '100%',
    },
    modalFooter: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    modalCoordsBox: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    modalCoordsLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    modalCoordsValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    modalHint: {
        fontSize: 13,
        color: '#8B5CF6',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalConfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#8B5CF6',
        padding: 16,
        borderRadius: 12,
    },
    modalConfirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
