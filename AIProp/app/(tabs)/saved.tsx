import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSavedProperties, useApp } from '@/contexts/AppContext';

export default function SavedScreen() {
    const savedProperties = useSavedProperties();
    const { toggleSaveProperty, isPropertySaved } = useApp();

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saved Properties</Text>
                <Text style={styles.headerSubtitle}>{savedProperties.length} properties</Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {savedProperties.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Heart size={64} color="#E5E7EB" />
                        <Text style={styles.emptyStateText}>No saved properties</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Save properties you like to view them here
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => router.push('/')}
                        >
                            <Text style={styles.browseButtonText}>Browse Properties</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.propertiesList}>
                        {savedProperties.map((property) => {
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
                                                {property.location.areaName}, {property.location.city}
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
                        })}
                    </View>
                )}
            </ScrollView>
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
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyStateText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 24,
        textAlign: 'center',
    },
    browseButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    browseButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    propertiesList: {
        gap: 16,
    },
    propertyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 220,
    },
    propertyImage: {
        width: '100%',
        height: '100%',
    },
    purposeBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    purposeBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 8,
        borderRadius: 20,
    },
    priceBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    priceText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    propertyDetails: {
        padding: 16,
        gap: 8,
    },
    propertyTitle: {
        fontSize: 16,
        fontWeight: '600',
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
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    sizeText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
});
