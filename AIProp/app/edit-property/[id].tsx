import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, MapPin, X, Check } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAllProperties } from '@/contexts/AppContext';
import { propertiesAPI } from '@/services/api';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function EditPropertyScreen() {
    const { id } = useLocalSearchParams();
    const { properties, refresh: refreshProperties } = useAllProperties();
    const property = properties.find(p => p.id === id);

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [kitchen, setKitchen] = useState('');
    const [hall, setHall] = useState('');
    const [balcony, setBalcony] = useState('');
    const [area, setArea] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [location, setLocation] = useState<any>(null);

    // Map picker modal state
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [tempLocation, setTempLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        if (property) {
            const p = property as any; // Cast for optional fields
            setTitle(p.title || '');
            setPrice(p.price?.toString() || '');
            setDescription(p.description || '');
            setBedrooms(p.bedrooms?.toString() || '');
            setBathrooms(p.bathrooms?.toString() || '');
            setKitchen(p.kitchen?.toString() || '');
            setHall(p.hall?.toString() || '');
            setBalcony(p.balcony?.toString() || '');
            setArea(p.area?.toString() || '');
            setOwnerName(p.ownerName || '');
            setWhatsappNumber(p.whatsappNumber || '');
            setLocation(p.location || null);
        }
    }, [property]);

    const handleSave = async () => {
        if (!title || !price || !ownerName || !whatsappNumber) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            setLoading(true);

            const updateData: any = {
                title,
                price: parseFloat(price),
                description,
                ownerName,
                whatsappNumber,
            };

            // Add optional fields
            if (area) updateData.area = parseFloat(area);
            if (bedrooms) updateData.bedrooms = parseInt(bedrooms);
            if (bathrooms) updateData.bathrooms = parseInt(bathrooms);
            if (kitchen) updateData.kitchen = parseInt(kitchen);
            if (hall) updateData.hall = parseInt(hall);
            if (balcony) updateData.balcony = parseInt(balcony);
            if (location) updateData.location = location;

            await propertiesAPI.update(id as string, updateData);
            await refreshProperties();

            Alert.alert('Success', 'Property updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update property');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationUpdate = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            const coords = currentLocation.coords;

            // Reverse geocode to get address
            const addresses = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
            });

            if (addresses.length > 0) {
                const address = addresses[0];
                setLocation({
                    ...location,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    areaName: address.street || address.name || location?.areaName || 'Unknown Area',
                    city: address.city || location?.city || 'Unknown City',
                });
                Alert.alert('Success', 'Location updated to current GPS');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get location');
        }
    };

    // Open map picker modal
    const openMapPicker = () => {
        const initialLat = location?.latitude || 28.6139;
        const initialLng = location?.longitude || 77.2090;

        setTempLocation({
            latitude: initialLat,
            longitude: initialLng,
        });
        setMapModalVisible(true);
    };

    // Confirm location from map picker with reverse geocoding
    const confirmLocationFromMap = async () => {
        if (tempLocation) {
            setMapModalVisible(false);

            try {
                // Reverse geocode to get address details
                const addresses = await Location.reverseGeocodeAsync({
                    latitude: tempLocation.latitude,
                    longitude: tempLocation.longitude,
                });

                if (addresses.length > 0) {
                    const address = addresses[0];
                    const newAreaName = address.street || address.name || address.district || address.subregion || location?.areaName || 'Unknown Area';
                    const newCity = address.city || address.region || location?.city || 'Unknown City';

                    setLocation({
                        ...location,
                        latitude: tempLocation.latitude,
                        longitude: tempLocation.longitude,
                        areaName: newAreaName,
                        city: newCity,
                    });

                    Alert.alert(
                        'Location Updated',
                        `📍 ${newAreaName}${newCity ? ', ' + newCity : ''}\n\nCoordinates: ${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`
                    );
                } else {
                    setLocation({
                        ...location,
                        latitude: tempLocation.latitude,
                        longitude: tempLocation.longitude,
                    });
                    Alert.alert('Location Updated', `Coordinates: ${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`);
                }
            } catch (error) {
                console.log('Reverse geocoding failed:', error);
                setLocation({
                    ...location,
                    latitude: tempLocation.latitude,
                    longitude: tempLocation.longitude,
                });
                Alert.alert('Location Updated', `Coordinates: ${tempLocation.latitude.toFixed(6)}, ${tempLocation.longitude.toFixed(6)}`);
            }
        } else {
            setMapModalVisible(false);
        }
    };

    if (!property) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Property not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Property</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.headerButton, styles.saveButton]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Save size={20} color="#FFFFFF" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Property title"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price (₹) *</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            placeholder="Enter price"
                            keyboardType="numeric"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Property description"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Area (sq ft)</Text>
                        <TextInput
                            style={styles.input}
                            value={area}
                            onChangeText={setArea}
                            placeholder="Enter area"
                            keyboardType="numeric"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {property.category === 'House' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>House Details</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Bedrooms</Text>
                                <TextInput
                                    style={styles.input}
                                    value={bedrooms}
                                    onChangeText={setBedrooms}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Bathrooms</Text>
                                <TextInput
                                    style={styles.input}
                                    value={bathrooms}
                                    onChangeText={setBathrooms}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Kitchen</Text>
                                <TextInput
                                    style={styles.input}
                                    value={kitchen}
                                    onChangeText={setKitchen}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Hall</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hall}
                                    onChangeText={setHall}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Balcony</Text>
                            <TextInput
                                style={styles.input}
                                value={balcony}
                                onChangeText={setBalcony}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Owner Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={ownerName}
                            onChangeText={setOwnerName}
                            placeholder="Enter owner name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WhatsApp Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={whatsappNumber}
                            onChangeText={setWhatsappNumber}
                            placeholder="+91 9876543210"
                            keyboardType="phone-pad"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>

                    {location && (
                        <>
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    provider={PROVIDER_GOOGLE}
                                    initialRegion={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: location.latitude,
                                            longitude: location.longitude,
                                        }}
                                    />
                                </MapView>
                            </View>
                            <View style={styles.locationInfoBox}>
                                {(location.areaName || location.city) && (
                                    <Text style={styles.locationNameText}>
                                        📍 {location.areaName}{location.areaName && location.city ? ', ' : ''}{location.city}
                                    </Text>
                                )}
                                <Text style={styles.coordsText}>
                                    {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                                </Text>
                            </View>
                        </>
                    )}

                    <View style={styles.locationButtonsRow}>
                        <TouchableOpacity
                            style={[styles.locationBtn, styles.gpsBtn]}
                            onPress={handleLocationUpdate}
                        >
                            <MapPin size={18} color="#FFFFFF" />
                            <Text style={styles.locationBtnText}>Use GPS</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.locationBtn, styles.pickMapBtn]}
                            onPress={openMapPicker}
                        >
                            <MapPin size={18} color="#FFFFFF" />
                            <Text style={styles.locationBtnText}>Pick on Map</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#8B5CF6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginTop: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    mapContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    locationInfoBox: {
        marginBottom: 12,
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
    locationButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    locationBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
    },
    gpsBtn: {
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
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal styles
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
