import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, MapPin, Heart, SlidersHorizontal, X, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAllProperties, useApp } from '@/contexts/AppContext';

type CategoryType = 'All' | 'House' | 'Plot' | 'Shop' | 'Land';

export default function SearchScreen() {
    const { properties: allProperties, isLoading, refresh } = useAllProperties();
    const { toggleSaveProperty, isPropertySaved } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');

    // Filter states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState<'All' | 'Sale' | 'Rent'>('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const categories: CategoryType[] = ['All', 'House', 'Plot', 'Shop', 'Land'];

    const filteredProperties = useMemo(() => {
        return allProperties.filter((property) => {
            const matchesSearch =
                property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.location.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.location.city.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || property.category === selectedCategory;

            // Purpose filter
            const matchesPurpose = selectedPurpose === 'All' || property.purpose === selectedPurpose;

            // Price filters - Convert lakhs to rupees (multiply by 100000)
            const matchesMinPrice = !minPrice || property.price >= parseFloat(minPrice) * 100000;
            const matchesMaxPrice = !maxPrice || property.price <= parseFloat(maxPrice) * 100000;

            return matchesSearch && matchesCategory && matchesPurpose && matchesMinPrice && matchesMaxPrice;
        });
    }, [allProperties, searchQuery, selectedCategory, selectedPurpose, minPrice, maxPrice]);

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
                <Text style={styles.headerTitle}>Search Properties</Text>
                <View style={styles.searchContainer}>
                    <SearchIcon size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by title, location..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9CA3AF"
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearButton}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryPill,
                                selectedCategory === category && styles.categoryPillActive,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[
                                    styles.categoryPillText,
                                    selectedCategory === category && styles.categoryPillTextActive,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>{filteredProperties.length} results found</Text>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <SlidersHorizontal size={16} color="#8B5CF6" />
                        <Text style={styles.filterButtonText}>Filters</Text>
                    </TouchableOpacity>
                </View>

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

                {filteredProperties.length === 0 ? (
                    <View style={styles.emptyState}>
                        <SearchIcon size={64} color="#E5E7EB" />
                        <Text style={styles.emptyStateText}>No properties found</Text>
                        <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
                    </View>
                ) : (
                    <View style={styles.propertiesList}>
                        {filteredProperties.map((property) => {
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    clearButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    categoriesContainer: {
        maxHeight: 60,
    },
    categoriesContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    categoryPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
    },
    categoryPillActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    categoryPillTextActive: {
        color: '#FFFFFF',
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    resultsCount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#EDE9FE',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
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
    },
    propertiesList: {
        paddingHorizontal: 16,
        gap: 16,
    },
    propertyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
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
});
