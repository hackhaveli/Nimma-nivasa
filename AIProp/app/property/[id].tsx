import React, { useState, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Linking,
    Alert,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MapPin, Home, Maximize2, MessageCircle, ArrowLeft, Share2, Bed, Bath, Sofa, Eye, TrendingUp, Edit2 } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAllProperties, useApp } from '@/contexts/AppContext';
import { propertiesAPI } from '@/services/api';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
    const { id } = useLocalSearchParams();
    const { properties: allProperties } = useAllProperties();
    const { toggleSaveProperty, isPropertySaved, user } = useApp();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Track property view
    React.useEffect(() => {
        if (id && typeof id === 'string') {
            // Increment view count in backend
            propertiesAPI.incrementLead(id).catch(err => {
                console.log('View tracking failed:', err);
            });
        }
    }, [id]);

    const property = allProperties.find((p) => p.id === id);

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

    const isSaved = isPropertySaved(property.id);

    // Check if user can edit (owner or admin)
    const canEdit = user && (
        (property as any).owner?.id === user.id ||
        user.email === 'coderrohit2927@gmail.com'
    );

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

    const handleWhatsApp = () => {
        const message = `Hi, I'm interested in your property: ${property.title}`;
        const url = `https://wa.me/${property.whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open WhatsApp');
        });
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setCurrentImageIndex(index);
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                            <ArrowLeft size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle} numberOfLines={1}>Property Details</Text>
                        {canEdit ? (
                            <TouchableOpacity
                                style={[styles.headerButton, styles.editButton]}
                                onPress={() => router.push(`/edit-property/${id}` as any)}
                            >
                                <Edit2 size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.headerButton}>
                                <Share2 size={22} color="#111827" />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </Animated.View>

            <Animated.ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.imageSliderContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {property.images.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={styles.propertyImage} />
                        ))}
                    </ScrollView>
                    <View style={styles.imageIndicatorContainer}>
                        {property.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.imageIndicator,
                                    currentImageIndex === index && styles.imageIndicatorActive,
                                ]}
                            />
                        ))}
                    </View>
                    <SafeAreaView edges={['top']} style={styles.imageHeaderOverlay}>
                        <View style={styles.imageHeaderButtons}>
                            <TouchableOpacity
                                style={styles.imageBackButton}
                                onPress={() => router.back()}
                            >
                                <ArrowLeft size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <View style={styles.topRightButtons}>
                                <TouchableOpacity style={styles.shareButton}>
                                    <Share2 size={22} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.favoriteButtonDetail}
                                    onPress={() => toggleSaveProperty(property.id)}
                                >
                                    <Heart
                                        size={22}
                                        color={isSaved ? '#EF4444' : '#FFFFFF'}
                                        fill={isSaved ? '#EF4444' : 'none'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>

                <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
                    <View style={styles.headerCard}>
                        <View style={styles.titleRow}>
                            <View style={styles.titleSection}>
                                <Text style={styles.propertyTitle}>{property.title}</Text>
                                <View style={styles.badgeRow}>
                                    <View style={styles.purposeBadgeDetail}>
                                        <Text style={styles.purposeBadgeTextDetail}>{property.purpose.toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.categoryBadgeDetail}>
                                        <Home size={14} color="#8B5CF6" />
                                        <Text style={styles.categoryBadgeTextDetail}>{property.category}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.priceRow}>
                            <View>
                                <Text style={styles.priceDetail}>{formatPrice(property.price)}</Text>
                                {property.purpose === 'Rent' && (
                                    <Text style={styles.priceSubtext}>per month</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsCard}>
                        <View style={styles.statItemDetail}>
                            <View style={styles.statIconWrapper}>
                                <Eye size={18} color="#06B6D4" />
                            </View>
                            <Text style={styles.statValueDetail}>{property.views}</Text>
                            <Text style={styles.statLabelDetail}>Views</Text>
                        </View>
                        <View style={styles.statDividerDetail} />
                        <View style={styles.statItemDetail}>
                            <View style={styles.statIconWrapper}>
                                <TrendingUp size={18} color="#10B981" />
                            </View>
                            <Text style={styles.statValueDetail}>{property.leads}</Text>
                            <Text style={styles.statLabelDetail}>Leads</Text>
                        </View>
                        <View style={styles.statDividerDetail} />
                        <View style={styles.statItemDetail}>
                            <View style={styles.statIconWrapper}>
                                <Maximize2 size={18} color="#8B5CF6" />
                            </View>
                            <Text style={styles.statValueDetail}>{property.width * property.length}</Text>
                            <Text style={styles.statLabelDetail}>Sq.Ft</Text>
                        </View>
                    </View>

                    {property.category === 'House' && property.bedrooms && (
                        <View style={styles.detailCard}>
                            <Text style={styles.cardTitle}>🏠 House Details</Text>
                            <View style={styles.detailGrid}>
                                <View style={styles.detailItemNew}>
                                    <View style={styles.detailIconContainer}>
                                        <Bed size={24} color="#8B5CF6" />
                                    </View>
                                    <Text style={styles.detailValue}>{property.bedrooms}</Text>
                                    <Text style={styles.detailLabel}>Bedrooms</Text>
                                </View>
                                <View style={styles.detailItemNew}>
                                    <View style={styles.detailIconContainer}>
                                        <Bath size={24} color="#06B6D4" />
                                    </View>
                                    <Text style={styles.detailValue}>{property.kitchen}</Text>
                                    <Text style={styles.detailLabel}>Kitchen</Text>
                                </View>
                                <View style={styles.detailItemNew}>
                                    <View style={styles.detailIconContainer}>
                                        <Sofa size={24} color="#10B981" />
                                    </View>
                                    <Text style={styles.detailValue}>{property.hall}</Text>
                                    <Text style={styles.detailLabel}>Hall</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.detailCard}>
                        <Text style={styles.cardTitle}>📝 Description</Text>
                        <Text style={styles.description}>{property.description}</Text>
                    </View>

                    <View style={styles.detailCard}>
                        <Text style={styles.cardTitle}>📍 Location</Text>
                        <View style={styles.locationDetailsNew}>
                            <View style={styles.locationIcon}>
                                <MapPin size={24} color="#8B5CF6" />
                            </View>
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationTitle}>{property.location.areaName}</Text>
                                <Text style={styles.locationSubtitle}>
                                    {property.location.city}
                                    {property.location.landmark && ` • ${property.location.landmark}`}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.mapContainer}
                            onPress={() => {
                                const lat = property.location.latitude;
                                const lng = property.location.longitude;
                                const label = property.location.areaName;
                                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                                Linking.openURL(googleMapsUrl);
                            }}
                            activeOpacity={1}
                        >
                            <MapView
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: property.location.latitude,
                                    longitude: property.location.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: property.location.latitude,
                                        longitude: property.location.longitude,
                                    }}
                                    title={property.location.areaName}
                                    description={property.location.city}
                                />
                            </MapView>
                            <View style={styles.mapOverlay}>
                                <View style={styles.mapOverlayContent}>
                                    <MapPin size={20} color="#8B5CF6" />
                                    <Text style={styles.mapOverlayText}>Tap to open in Google Maps</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ownerCard}>
                        <View style={styles.ownerHeader}>
                            <View style={styles.ownerAvatar}>
                                <Text style={styles.ownerAvatarText}>{property.ownerName.charAt(0)}</Text>
                            </View>
                            <View style={styles.ownerDetails}>
                                <Text style={styles.ownerLabel}>Property Owner</Text>
                                <Text style={styles.ownerName}>{property.ownerName}</Text>
                                <Text style={styles.ownerPhone}>📱 {property.whatsappNumber}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </Animated.View>
            </Animated.ScrollView>

            <View style={styles.bottomBarWrapper}>
                <SafeAreaView edges={['bottom']} style={styles.bottomBarSafe}>
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
                            <MessageCircle size={22} color="#FFFFFF" />
                            <Text style={styles.whatsappButtonText}>Contact via WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#8B5CF6',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginHorizontal: 12,
    },
    content: {
        flex: 1,
    },
    imageSliderContainer: {
        position: 'relative',
        width: width,
        height: 400,
    },
    imageHeaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    imageHeaderButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    imageBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
    },
    topRightButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    propertyImage: {
        width: width,
        height: 400,
    },
    imageIndicatorContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    imageIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    imageIndicatorActive: {
        backgroundColor: '#FFFFFF',
        width: 24,
    },
    favoriteButtonDetail: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#F9FAFB',
        paddingTop: 24,
        paddingHorizontal: 20,
        gap: 16,
    },
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        gap: 16,
    },
    titleRow: {
        gap: 12,
    },
    titleSection: {
        gap: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    propertyTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        lineHeight: 34,
    },
    purposeBadgeDetail: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    purposeBadgeTextDetail: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    categoryBadgeDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    categoryBadgeTextDetail: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    priceDetail: {
        fontSize: 32,
        fontWeight: '800',
        color: '#8B5CF6',
    },
    priceSubtext: {
        fontSize: 14,
        color: '#6B7280',
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    statItemDetail: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValueDetail: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    statLabelDetail: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    statDividerDetail: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    detailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 20,
    },
    detailGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    detailItemNew: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
    },
    detailIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    description: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 24,
    },
    locationDetailsNew: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
    },
    locationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationTextContainer: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    locationSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    mapPlaceholder: {
        backgroundColor: '#F5F3FF',
        borderRadius: 16,
        padding: 48,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E9D5FF',
        borderStyle: 'dashed',
    },
    mapIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    mapPlaceholderText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B5CF6',
        marginTop: 8,
    },
    mapCoords: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    ownerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    ownerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    ownerAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ownerAvatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    ownerDetails: {
        flex: 1,
        gap: 4,
    },
    ownerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    ownerName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    ownerPhone: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    bottomBarSafe: {
        backgroundColor: 'transparent',
    },
    bottomBar: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    whatsappButton: {
        backgroundColor: '#10B981',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    whatsappButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
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
    mapContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 12,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(139, 92, 246, 0.95)',
        padding: 12,
    },
    mapOverlayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    mapOverlayText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
