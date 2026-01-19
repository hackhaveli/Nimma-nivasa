import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Animated,
    Dimensions,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search as SearchIcon, SlidersHorizontal, Heart, TrendingUp, Eye, Home, Building2, Store, Sparkles, Navigation, X, Check, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useLocation } from '@/hooks/useLocation';
import { propertiesAPI } from '@/services/api';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import type { Property } from '@/mocks/properties';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CategoryType = 'All' | 'House' | 'Plot' | 'Shop' | 'Land';

export default function HomeScreen() {
    const { toggleSaveProperty, isPropertySaved } = useApp();
    const { location, loading: locationLoading, error: locationError } = useLocation();

    const [properties, setProperties] = useState<Property[]>([]);
    const [otherProperties, setOtherProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackRadius, setFallbackRadius] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');

    // Filter states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState<'All' | 'Sale' | 'Rent'>('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Custom location picker states
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [customLocation, setCustomLocation] = useState<{
        latitude: number;
        longitude: number;
        name: string;
    } | null>(null);
    const [tempMapLocation, setTempMapLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // Get the active location (custom or device location)
    const activeLocation = customLocation || location;

    // Load nearby properties when location is available, or all properties as fallback
    useEffect(() => {
        loadProperties();
    }, [activeLocation]);

    // Reload when filters change
    useEffect(() => {
        if (!isLoading) {
            loadProperties();
        }
    }, [selectedPurpose, minPrice, maxPrice]);

    const loadProperties = async () => {
        try {
            setIsLoading(true);

            if (activeLocation) {
                // Load nearby properties
                const nearbyResult = await propertiesAPI.getNearby(
                    activeLocation.latitude,
                    activeLocation.longitude
                );

                let nearbyProps = nearbyResult.properties || [];

                // Apply filters
                nearbyProps = applyFilters(nearbyProps);

                setProperties(nearbyProps);
                setIsFallback(nearbyResult.isFallback || false);
                setFallbackRadius(nearbyResult.fallbackRadius || 0);

                // If we found nearby properties (and not just fallback), load others too
                if (!nearbyResult.isFallback) {
                    const allProps = await propertiesAPI.getAll();
                    const existingIds = new Set(nearbyProps.map((p: Property) => p.id));
                    const others = applyFilters((allProps || []).filter((p: Property) => !existingIds.has(p.id)));
                    setOtherProperties(others);
                } else {
                    setOtherProperties([]);
                }
            } else {
                // Fallback: Load all properties
                const allProps = await propertiesAPI.getAll();
                setProperties(applyFilters(allProps || []));
                setOtherProperties([]);
                setIsFallback(true);
                setFallbackRadius(0);
            }
        } catch (error) {
            console.error('Failed to load properties:', error);
            try {
                const fallbackProps = await propertiesAPI.getAll();
                setProperties(fallbackProps || []);
                setOtherProperties([]);
                setIsFallback(true);
            } catch (fallbackError) {
                setProperties([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Apply purpose and price filters
    const applyFilters = (props: Property[]) => {
        return props.filter(property => {
            // Purpose filter
            if (selectedPurpose !== 'All' && property.purpose !== selectedPurpose) {
                return false;
            }
            // Min price filter - Convert lakhs to rupees (multiply by 100000)
            if (minPrice && property.price < parseFloat(minPrice) * 100000) {
                return false;
            }
            // Max price filter - Convert lakhs to rupees (multiply by 100000)
            if (maxPrice && property.price > parseFloat(maxPrice) * 100000) {
                return false;
            }
            return true;
        });
    };

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [140, 80],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Title appears when scrolling (opposite of location header)
    const titleOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const categories: { name: CategoryType; icon: React.ComponentType<any> }[] = [
        { name: 'All', icon: Sparkles },
        { name: 'House', icon: Home },
        { name: 'Plot', icon: Building2 },
        { name: 'Shop', icon: Store },
    ];

    const filteredProperties = useMemo(() => {
        return properties.filter((property: Property) => {
            const matchesSearch =
                property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.location.areaName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || property.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [properties, searchQuery, selectedCategory]);

    const featuredProperties = useMemo(() => {
        return properties
            .filter((p: Property) => p.purpose === 'Sale')
            .sort((a: Property, b: Property) => b.views - a.views)
            .slice(0, 5);
    }, [properties]);

    const trendingProperties = useMemo(() => {
        return properties
            .sort((a: Property, b: Property) => (b.views + b.leads * 2) - (a.views + a.leads * 2))
            .slice(0, 3);
    }, [properties]);

    const totalViews = useMemo(() => {
        return properties.reduce((sum: number, p: Property) => sum + p.views, 0);
    }, [properties]);

    const totalListings = properties.length;

    const calculateDistance = (property: Property): string => {
        if (!activeLocation) return 'N/A';

        // If distance is already calculated from backend, use it
        if ((property as any).distance) {
            return `${(property as any).distance} km`;
        }

        // Otherwise calculate it
        const R = 6371;
        const dLat = ((property.location.latitude - activeLocation.latitude) * Math.PI) / 180;
        const dLon = ((property.location.longitude - activeLocation.longitude) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((activeLocation.latitude * Math.PI) / 180) *
            Math.cos((property.location.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
    };

    const formatPrice = (price: number): string => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`;
        } else if (price >= 100000) {
            return `₹${(price / 100000).toFixed(2)} L`;
        } else if (price >= 1000) {
            return `₹${(price / 1000).toFixed(0)}K`;
        }
        return `₹${price}`;
    };

    // Location picker functions
    const openLocationPicker = () => {
        const initialLat = activeLocation?.latitude || 28.6139;
        const initialLng = activeLocation?.longitude || 77.2090;
        setTempMapLocation({ latitude: initialLat, longitude: initialLng });
        setShowLocationModal(true);
    };

    const confirmCustomLocation = async () => {
        if (tempMapLocation) {
            setShowLocationModal(false);

            try {
                // Reverse geocode to get location name
                const addresses = await Location.reverseGeocodeAsync({
                    latitude: tempMapLocation.latitude,
                    longitude: tempMapLocation.longitude,
                });

                let locationName = 'Selected Location';
                if (addresses.length > 0) {
                    const addr = addresses[0];
                    locationName = addr.street || addr.name || addr.district || addr.city || 'Selected Location';
                    if (addr.city && locationName !== addr.city) {
                        locationName += `, ${addr.city}`;
                    }
                }

                setCustomLocation({
                    latitude: tempMapLocation.latitude,
                    longitude: tempMapLocation.longitude,
                    name: locationName,
                });
            } catch (error) {
                setCustomLocation({
                    latitude: tempMapLocation.latitude,
                    longitude: tempMapLocation.longitude,
                    name: 'Selected Location',
                });
            }
        }
    };

    const resetToCurrentLocation = () => {
        setCustomLocation(null);
        setShowLocationModal(false);
    };

    // Get display name for header
    const getLocationDisplayName = () => {
        if (locationLoading) return 'Getting location...';
        if (customLocation) return customLocation.name;
        if (location?.address?.area) return `${location.address.area}, ${location.address.city}`;
        if (location) return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        return 'Location unavailable';
    };

    const renderPropertyCard = (property: Property) => {
        const isSaved = isPropertySaved(property.id);

        return (
            <TouchableOpacity
                key={property.id}
                style={styles.propertyCard}
                onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
                    <View style={styles.purposeBadge}>
                        <Text style={styles.purposeBadgeText}>{property.purpose.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleSaveProperty(property.id);
                        }}
                    >
                        <Heart
                            size={20}
                            color={isSaved ? '#EF4444' : '#FFFFFF'}
                            fill={isSaved ? '#EF4444' : 'none'}
                        />
                    </TouchableOpacity>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>{formatPrice(property.price)}</Text>
                    </View>
                </View>
                <View style={styles.propertyDetails}>
                    <Text style={styles.propertyTitle} numberOfLines={2}>
                        {property.title}
                    </Text>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {property.location.areaName} • {calculateDistance(property)} away
                        </Text>
                    </View>
                    <View style={styles.propertyMeta}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{property.category}</Text>
                        </View>
                        <Text style={styles.sizeText}>
                            {property.width} × {property.length} sqft
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <Animated.View style={[styles.locationHeader, { opacity: headerOpacity }]}>
                        <TouchableOpacity
                            style={styles.locationBadge}
                            onPress={openLocationPicker}
                            activeOpacity={0.7}
                        >
                            <MapPin size={16} color="#8B5CF6" />
                            <View style={styles.locationInfo}>
                                <View style={styles.locationTitleRow}>
                                    <Text style={styles.locationTitle} numberOfLines={1}>
                                        {getLocationDisplayName()}
                                    </Text>
                                    <ChevronDown size={14} color="#6B7280" />
                                </View>
                                <Text style={styles.locationSubtitle}>
                                    {customLocation ? 'Tap to change location' : (location ? 'Current Location • Tap to change' : 'Enable location for better results')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* App Title - Appears when scrolling */}
                    <Animated.View style={[styles.appTitleContainer, { opacity: titleOpacity }]}>
                        <Text style={styles.appTitleMain}>Nimma</Text>
                        <Text style={styles.appTitleAccent}>Nivasa</Text>
                        <View style={styles.appTitleBadge}>
                            <Text style={styles.appTitleBadgeText}>🏠</Text>
                        </View>
                    </Animated.View>

                    <View style={styles.searchContainer}>
                        <SearchIcon size={18} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search properties, location..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setShowFilterModal(true)}
                        >
                            <SlidersHorizontal size={18} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <X size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Purpose Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Purpose</Text>
                                <View style={styles.filterOptions}>
                                    {['All', 'Sale', 'Rent'].map(purpose => (
                                        <TouchableOpacity
                                            key={purpose}
                                            style={[
                                                styles.filterOption,
                                                selectedPurpose === purpose && styles.filterOptionActive
                                            ]}
                                            onPress={() => setSelectedPurpose(purpose as any)}
                                        >
                                            <Text style={[
                                                styles.filterOptionText,
                                                selectedPurpose === purpose && styles.filterOptionTextActive
                                            ]}>
                                                {purpose}
                                            </Text>
                                            {selectedPurpose === purpose && (
                                                <Check size={16} color="#FFFFFF" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Price Range */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Price Range (₹ in Lakhs)</Text>
                                <Text style={styles.priceHint}>Enter amount in Lakhs (e.g., 50 = ₹50 Lakh)</Text>
                                <View style={styles.priceInputs}>
                                    <View style={styles.priceInputContainer}>
                                        <Text style={styles.priceInputLabel}>Min (Lakhs)</Text>
                                        <TextInput
                                            style={styles.priceInput}
                                            placeholder="0"
                                            value={minPrice}
                                            onChangeText={setMinPrice}
                                            keyboardType="numeric"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                    <View style={styles.priceInputContainer}>
                                        <Text style={styles.priceInputLabel}>Max (Lakhs)</Text>
                                        <TextInput
                                            style={styles.priceInput}
                                            placeholder="∞"
                                            value={maxPrice}
                                            onChangeText={setMaxPrice}
                                            keyboardType="numeric"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                                {/* Quick Price Presets */}
                                <View style={styles.pricePresets}>
                                    <TouchableOpacity
                                        style={styles.presetButton}
                                        onPress={() => { setMinPrice('0'); setMaxPrice('50'); }}
                                    >
                                        <Text style={styles.presetButtonText}>Under 50L</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.presetButton}
                                        onPress={() => { setMinPrice('50'); setMaxPrice('100'); }}
                                    >
                                        <Text style={styles.presetButtonText}>50L - 1Cr</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.presetButton}
                                        onPress={() => { setMinPrice('100'); setMaxPrice(''); }}
                                    >
                                        <Text style={styles.presetButtonText}>Above 1Cr</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.filterActions}>
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={() => {
                                        setSelectedPurpose('All');
                                        setMinPrice('');
                                        setMaxPrice('');
                                    }}
                                >
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={() => setShowFilterModal(false)}
                                >
                                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Location Picker Modal */}
            <Modal
                visible={showLocationModal}
                animationType="slide"
                onRequestClose={() => setShowLocationModal(false)}
            >
                <SafeAreaView style={styles.locationModalContainer}>
                    <View style={styles.locationModalHeader}>
                        <TouchableOpacity
                            style={styles.locationModalCloseBtn}
                            onPress={() => setShowLocationModal(false)}
                        >
                            <X size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.locationModalTitle}>Choose Location</Text>
                        <TouchableOpacity
                            style={styles.locationModalConfirmBtn}
                            onPress={confirmCustomLocation}
                        >
                            <Check size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.locationModalMapContainer}>
                        {tempMapLocation && (
                            <MapView
                                style={styles.locationModalMap}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: tempMapLocation.latitude,
                                    longitude: tempMapLocation.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05,
                                }}
                                onPress={(e) => {
                                    setTempMapLocation({
                                        latitude: e.nativeEvent.coordinate.latitude,
                                        longitude: e.nativeEvent.coordinate.longitude,
                                    });
                                }}
                            >
                                <Marker
                                    draggable
                                    coordinate={{
                                        latitude: tempMapLocation.latitude,
                                        longitude: tempMapLocation.longitude,
                                    }}
                                    title="Search properties here"
                                    onDragEnd={(e) => {
                                        setTempMapLocation({
                                            latitude: e.nativeEvent.coordinate.latitude,
                                            longitude: e.nativeEvent.coordinate.longitude,
                                        });
                                    }}
                                />
                            </MapView>
                        )}
                    </View>

                    <View style={styles.locationModalFooter}>
                        <Text style={styles.locationModalHint}>
                            👆 Tap on map or drag marker to select a different location
                        </Text>

                        <View style={styles.locationModalButtons}>
                            <TouchableOpacity
                                style={styles.locationModalGpsBtn}
                                onPress={resetToCurrentLocation}
                            >
                                <Navigation size={18} color="#8B5CF6" />
                                <Text style={styles.locationModalGpsBtnText}>Use My Location</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.locationModalConfirmButton}
                                onPress={confirmCustomLocation}
                            >
                                <Check size={20} color="#FFFFFF" />
                                <Text style={styles.locationModalConfirmText}>Search Here</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>

            <Animated.ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <Animated.View style={[styles.statsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Building2 size={20} color="#8B5CF6" />
                            </View>
                            <Text style={styles.statValue}>{totalListings}</Text>
                            <Text style={styles.statLabel}>Properties</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <Eye size={20} color="#06B6D4" />
                            </View>
                            <Text style={styles.statValue}>{totalViews.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total Views</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                <TrendingUp size={20} color="#10B981" />
                            </View>
                            <Text style={styles.statValue}>{trendingProperties.length}</Text>
                            <Text style={styles.statLabel}>Trending</Text>
                        </View>
                    </View>
                </Animated.View>

                <View style={styles.categoriesWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContent}
                    >
                        {categories.map((category) => {
                            const IconComponent = category.icon;
                            return (
                                <TouchableOpacity
                                    key={category.name}
                                    style={[
                                        styles.categoryPill,
                                        selectedCategory === category.name && styles.categoryPillActive,
                                    ]}
                                    onPress={() => setSelectedCategory(category.name)}
                                    activeOpacity={0.7}
                                >
                                    <IconComponent
                                        size={18}
                                        color={selectedCategory === category.name ? '#FFFFFF' : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryPillText,
                                            selectedCategory === category.name && styles.categoryPillTextActive,
                                        ]}
                                    >
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Fallback Banner */}
                {isFallback && (
                    <View style={styles.fallbackBanner}>
                        <Navigation size={16} color="#F59E0B" />
                        <Text style={styles.fallbackText}>
                            {fallbackRadius === 0
                                ? 'No properties found nearby, showing all available properties'
                                : `No properties in your area, showing properties within ${fallbackRadius}km`
                            }
                        </Text>
                    </View>
                )}

                {selectedCategory === 'All' && (
                    <View style={styles.featuredSection}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Featured Properties</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredScroll}
                        >
                            {featuredProperties.map((property) => (
                                <TouchableOpacity
                                    key={property.id}
                                    style={styles.featuredCard}
                                    onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })}
                                    activeOpacity={0.9}
                                >
                                    <Image source={{ uri: property.images[0] }} style={styles.featuredImage} />
                                    <View style={styles.featuredOverlay}>
                                        <View style={styles.featuredBadge}>
                                            <Text style={styles.featuredBadgeText}>FEATURED</Text>
                                        </View>
                                        <View style={styles.featuredInfo}>
                                            <Text style={styles.featuredTitle} numberOfLines={2}>
                                                {property.title}
                                            </Text>
                                            <Text style={styles.featuredPrice}>{formatPrice(property.price)}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.sectionHeaderRow}>
                    <View>
                        <Text style={styles.sectionTitle}>
                            {selectedCategory === 'All' ? 'Nearby Listings' : `${selectedCategory} Listings`}
                        </Text>
                        <Text style={styles.sectionCount}>
                            {filteredProperties.length} properties found
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={styles.loadingText}>
                            {locationLoading ? 'Getting your location...' : 'Loading properties...'}
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.propertiesList}>
                            {filteredProperties.map((property: Property) => renderPropertyCard(property))}
                        </View>

                        {/* Show "Other Properties" only when viewing All categories and not searching */}
                        {selectedCategory === 'All' && !searchQuery && otherProperties.length > 0 && (
                            <View style={styles.otherPropertiesSection}>
                                <View style={styles.sectionHeaderRow}>
                                    <View>
                                        <Text style={styles.sectionTitle}>Explore More</Text>
                                        <Text style={styles.sectionCount}>Properties in other locations</Text>
                                    </View>
                                </View>
                                <View style={styles.propertiesList}>
                                    {otherProperties.map((property: Property) => renderPropertyCard(property))}
                                </View>
                            </View>
                        )}

                        {filteredProperties.length === 0 && otherProperties.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No properties found</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {searchQuery || selectedCategory !== 'All'
                                        ? 'Try adjusting your filters'
                                        : 'No properties available at the moment'}
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        zIndex: 10,
    },
    headerContent: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    locationHeader: {
        marginBottom: 12,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 8,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    locationSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 50,
        gap: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    filterButton: {
        backgroundColor: '#F5F3FF',
        padding: 8,
        borderRadius: 10,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    statsSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    categoriesWrapper: {
        paddingVertical: 16,
    },
    categoriesContent: {
        paddingHorizontal: 16,
        gap: 10,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryPillActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    categoryPillTextActive: {
        color: '#FFFFFF',
    },
    featuredSection: {
        marginBottom: 24,
    },
    featuredScroll: {
        paddingHorizontal: 16,
        gap: 16,
    },
    featuredCard: {
        width: SCREEN_WIDTH * 0.7,
        height: 240,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
    },
    featuredOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'space-between',
        padding: 16,
    },
    featuredBadge: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    featuredBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    featuredInfo: {
        gap: 8,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    featuredPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    sectionCount: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    propertiesList: {
        paddingHorizontal: 16,
        gap: 16,
    },
    propertyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 240,
    },
    propertyImage: {
        width: '100%',
        height: '100%',
    },
    purposeBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 10,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
    },
    purposeBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    priceBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    priceText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
    propertyDetails: {
        padding: 18,
        gap: 10,
    },
    propertyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
    },
    propertyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    categoryBadge: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    sizeText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    otherPropertiesSection: {
        marginTop: 24,
        borderTopWidth: 8,
        borderTopColor: '#F3F4F6',
        paddingTop: 24,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    fallbackBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        marginHorizontal: 20,
        marginVertical: 12,
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    fallbackText: {
        flex: 1,
        fontSize: 14,
        color: '#92400E',
        fontWeight: '600',
        lineHeight: 20,
    },
    // Filter Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    filterSection: {
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    priceHint: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    filterOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    filterOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        gap: 6,
    },
    filterOptionActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterOptionTextActive: {
        color: '#FFFFFF',
    },
    priceInputs: {
        flexDirection: 'row',
        gap: 12,
    },
    priceInputContainer: {
        flex: 1,
    },
    priceInputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    priceInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    pricePresets: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    presetButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    presetButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // App Title Styles (appears when scrolling)
    appTitleContainer: {
        position: 'absolute',
        top: 45, // Moved slightly up
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    appTitleMain: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: 0,
    },
    appTitleAccent: {
        fontSize: 20,
        fontWeight: '800',
        color: '#8B5CF6',
        letterSpacing: 0,
    },
    appTitleBadge: {
        marginLeft: 8,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
    },
    appTitleBadgeText: {
        fontSize: 14,
    },
    // Location Header Styles
    locationTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    // Location Modal Styles
    locationModalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    locationModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    locationModalCloseBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    locationModalConfirmBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationModalMapContainer: {
        flex: 1,
    },
    locationModalMap: {
        width: '100%',
        height: '100%',
    },
    locationModalFooter: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    locationModalHint: {
        fontSize: 13,
        color: '#8B5CF6',
        textAlign: 'center',
        marginBottom: 16,
    },
    locationModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    locationModalGpsBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    locationModalGpsBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    locationModalConfirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
    },
    locationModalConfirmText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
