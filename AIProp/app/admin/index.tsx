import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    RefreshControl,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Users,
    Home,
    Eye,
    TrendingUp,
    Search,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X,
    ChevronRight,
    Shield,
    ArrowLeft,
    MapPin,
    ExternalLink,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { adminAPI } from '@/services/adminAPI';
import { useApp } from '@/contexts/AppContext';

export default function AdminDashboard() {
    const { user } = useApp();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'properties'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyFilter, setPropertyFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        // Check if user is admin (Super User)
        if (!user || user.email !== 'coderrohit2927@gmail.com') {
            Alert.alert('Access Denied', 'This area is restricted to super admin only', [
                { text: 'OK', onPress: () => router.back() }
            ]);
            return;
        }

        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, usersData, propsData] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers(1, 10),
                adminAPI.getProperties(1, 10, propertyFilter),
            ]);

            setStats(statsData);
            setUsers(usersData.users || []);
            setProperties(propsData.properties || []);
        } catch (error: any) {
            console.error('Load data error:', error);
            Alert.alert('Error', error.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${userName}? This will also delete all their properties.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminAPI.deleteUser(userId);
                            Alert.alert('Success', 'User deleted successfully');
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteProperty = (propertyId: string, propertyTitle: string) => {
        Alert.alert(
            'Delete Property',
            `Are you sure you want to delete "${propertyTitle}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminAPI.deleteProperty(propertyId);
                            Alert.alert('Success', 'Property deleted successfully');
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete property');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleProperty = async (propertyId: string, currentStatus: boolean) => {
        try {
            await adminAPI.togglePropertyStatus(propertyId, !currentStatus);
            Alert.alert('Success', `Property ${!currentStatus ? 'activated' : 'deactivated'}`);
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update property');
        }
    };

    if (loading && !stats) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.loadingText}>Loading admin dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Admin Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Manage your platform</Text>
                    </View>
                </View>
                <View style={styles.adminBadge}>
                    <Shield size={16} color="#8B5CF6" />
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
                    onPress={() => setActiveTab('dashboard')}
                >
                    <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>
                        Dashboard
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.tabActive]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
                        Users
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'properties' && styles.tabActive]}
                    onPress={() => setActiveTab('properties')}
                >
                    <Text style={[styles.tabText, activeTab === 'properties' && styles.tabTextActive]}>
                        Properties
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#8B5CF6']} />
                }
            >
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && stats && (
                    <View style={styles.dashboardContent}>
                        {/* Statistics Cards */}
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, styles.statCardPurple]}>
                                <View style={styles.statIconContainer}>
                                    <Users size={24} color="#8B5CF6" />
                                </View>
                                <Text style={styles.statValue}>{stats.stats?.totalUsers || 0}</Text>
                                <Text style={styles.statLabel}>Total Users</Text>
                            </View>

                            <View style={[styles.statCard, styles.statCardBlue]}>
                                <View style={styles.statIconContainer}>
                                    <Home size={24} color="#3B82F6" />
                                </View>
                                <Text style={styles.statValue}>{stats.stats?.totalProperties || 0}</Text>
                                <Text style={styles.statLabel}>Properties</Text>
                            </View>

                            <View style={[styles.statCard, styles.statCardGreen]}>
                                <View style={styles.statIconContainer}>
                                    <Eye size={24} color="#10B981" />
                                </View>
                                <Text style={styles.statValue}>
                                    {(stats.stats?.totalViews || 0).toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel}>Total Views</Text>
                            </View>

                            <View style={[styles.statCard, styles.statCardOrange]}>
                                <View style={styles.statIconContainer}>
                                    <TrendingUp size={24} color="#F59E0B" />
                                </View>
                                <Text style={styles.statValue}>
                                    {(stats.stats?.totalLeads || 0).toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel}>Total Leads</Text>
                            </View>
                        </View>

                        {/* Active/Inactive Properties */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Property Status</Text>
                            <View style={styles.statusCards}>
                                <View style={styles.statusCard}>
                                    <Text style={styles.statusValue}>{stats.stats?.activeProperties || 0}</Text>
                                    <Text style={styles.statusLabel}>Active</Text>
                                </View>
                                <View style={[styles.statusCard, styles.statusCardInactive]}>
                                    <Text style={styles.statusValue}>{stats.stats?.inactiveProperties || 0}</Text>
                                    <Text style={styles.statusLabel}>Inactive</Text>
                                </View>
                            </View>
                        </View>

                        {/* Top Properties */}
                        {stats.topProperties && stats.topProperties.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Top Properties by Views</Text>
                                {stats.topProperties.slice(0, 5).map((property: any, index: number) => (
                                    <View key={property.id || index} style={styles.topPropertyCard}>
                                        <View style={styles.topPropertyRank}>
                                            <Text style={styles.topPropertyRankText}>#{index + 1}</Text>
                                        </View>
                                        <View style={styles.topPropertyInfo}>
                                            <Text style={styles.topPropertyTitle} numberOfLines={1}>
                                                {property.title}
                                            </Text>
                                            <Text style={styles.topPropertyMeta}>
                                                {property.location?.city} • ₹{(property.price / 100000).toFixed(1)}L
                                            </Text>
                                        </View>
                                        <View style={styles.topPropertyStats}>
                                            <View style={styles.topPropertyStat}>
                                                <Eye size={14} color="#6B7280" />
                                                <Text style={styles.topPropertyStatText}>{property.views || 0}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Category & Purpose Stats */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Category Distribution</Text>
                            <View style={styles.categoryGrid}>
                                {stats.categoryStats?.map((cat: any) => (
                                    <View key={cat._id} style={styles.categoryCard}>
                                        <Text style={styles.categoryValue}>{cat.count}</Text>
                                        <Text style={styles.categoryLabel}>{cat._id}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Purpose Distribution</Text>
                            <View style={styles.purposeGrid}>
                                {stats.purposeStats?.map((purpose: any) => (
                                    <View key={purpose._id} style={styles.purposeCard}>
                                        <Text style={styles.purposeValue}>{purpose.count}</Text>
                                        <Text style={styles.purposeLabel}>{purpose._id}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <View style={styles.tabContent}>
                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <Search size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search users by name, email, or mobile..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#9CA3AF"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <X size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* User List */}
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderText}>
                                {users.length} User{users.length !== 1 ? 's' : ''}
                            </Text>
                        </View>

                        {users.map((user) => (
                            <View key={user.id} style={styles.userCard}>
                                <View style={styles.userAvatar}>
                                    <Text style={styles.userAvatarText}>
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{user.name}</Text>
                                    <Text style={styles.userMeta}>{user.email || user.mobile}</Text>
                                    {user.location && (user.location.city || user.location.address) && (
                                        <TouchableOpacity
                                            style={styles.locationButton}
                                            onPress={() => {
                                                if (user.location?.coordinates) {
                                                    const { latitude, longitude } = user.location.coordinates;
                                                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
                                                }
                                            }}
                                            disabled={!user.location?.coordinates}
                                        >
                                            <MapPin size={14} color="#8B5CF6" />
                                            <Text style={styles.locationButtonText} numberOfLines={1}>
                                                {user.location.address || `${user.location.city}, ${user.location.state}`}
                                            </Text>
                                            <ExternalLink size={12} color="#8B5CF6" />
                                        </TouchableOpacity>
                                    )}
                                    <Text style={styles.userDate}>
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteUser(user.id, user.name)}
                                    disabled={user.role === 'admin'}
                                >
                                    <Trash2
                                        size={20}
                                        color={user.role === 'admin' ? '#D1D5DB' : '#EF4444'}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Properties Tab */}
                {activeTab === 'properties' && (
                    <View style={styles.tabContent}>
                        {/* Filter Buttons */}
                        <View style={styles.filterContainer}>
                            {['all', 'active', 'inactive'].map((filter) => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[
                                        styles.filterButton,
                                        propertyFilter === filter && styles.filterButtonActive,
                                    ]}
                                    onPress={() => {
                                        setPropertyFilter(filter as any);
                                        adminAPI.getProperties(1, 10, filter).then((data) => {
                                            setProperties(data.properties || []);
                                        });
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.filterButtonText,
                                            propertyFilter === filter && styles.filterButtonTextActive,
                                        ]}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Property List */}
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderText}>
                                {properties.length} Propert{properties.length !== 1 ? 'ies' : 'y'}
                            </Text>
                        </View>

                        {properties.map((property) => (
                            <View key={property.id} style={styles.propertyCard}>
                                <View style={styles.propertyHeader}>
                                    <View style={styles.propertyInfo}>
                                        <Text style={styles.propertyTitle} numberOfLines={1}>
                                            {property.title}
                                        </Text>
                                        <Text style={styles.propertyMeta}>
                                            {property.location?.city} • ₹{(property.price / 100000).toFixed(1)}L
                                        </Text>
                                        <Text style={styles.propertyOwner}>
                                            Owner: {property.owner?.name || 'Unknown'}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.propertyStatus,
                                            property.isActive
                                                ? styles.propertyStatusActive
                                                : styles.propertyStatusInactive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.propertyStatusText,
                                                property.isActive
                                                    ? styles.propertyStatusTextActive
                                                    : styles.propertyStatusTextInactive,
                                            ]}
                                        >
                                            {property.isActive ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.propertyActions}>
                                    <TouchableOpacity
                                        style={styles.toggleButton}
                                        onPress={() => handleToggleProperty(property.id, property.isActive)}
                                    >
                                        {property.isActive ? (
                                            <ToggleRight size={20} color="#10B981" />
                                        ) : (
                                            <ToggleLeft size={20} color="#9CA3AF" />
                                        )}
                                        <Text style={styles.toggleButtonText}>
                                            {property.isActive ? 'Deactivate' : 'Activate'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deletePropertyButton}
                                        onPress={() => handleDeleteProperty(property.id, property.title)}
                                    >
                                        <Trash2 size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F3E8FF',
        borderRadius: 20,
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#8B5CF6',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    tabTextActive: {
        color: '#8B5CF6',
    },
    content: {
        flex: 1,
    },
    dashboardContent: {
        padding: 16,
        gap: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statCardPurple: {
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
    },
    statCardBlue: {
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    statCardGreen: {
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    statCardOrange: {
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    statusCards: {
        flexDirection: 'row',
        gap: 12,
    },
    statusCard: {
        flex: 1,
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statusCardInactive: {
        backgroundColor: '#FEE2E2',
    },
    statusValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    topPropertyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    topPropertyRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topPropertyRankText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    topPropertyInfo: {
        flex: 1,
    },
    topPropertyTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    topPropertyMeta: {
        fontSize: 12,
        color: '#6B7280',
    },
    topPropertyStats: {
        flexDirection: 'row',
        gap: 12,
    },
    topPropertyStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    topPropertyStatText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    categoryValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    categoryLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    purposeGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    purposeCard: {
        flex: 1,
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    purposeValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    purposeLabel: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    tabContent: {
        padding: 16,
        gap: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    listHeader: {
        paddingVertical: 8,
    },
    listHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    userMeta: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    locationButtonText: {
        fontSize: 12,
        color: '#8B5CF6',
        fontWeight: '500',
        maxWidth: 180,
    },
    userDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    deleteButton: {
        padding: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    propertyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    propertyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    propertyInfo: {
        flex: 1,
    },
    propertyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    propertyMeta: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    propertyOwner: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    propertyStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    propertyStatusActive: {
        backgroundColor: '#DCFCE7',
    },
    propertyStatusInactive: {
        backgroundColor: '#FEE2E2',
    },
    propertyStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    propertyStatusTextActive: {
        color: '#10B981',
    },
    propertyStatusTextInactive: {
        color: '#EF4444',
    },
    propertyActions: {
        flexDirection: 'row',
        gap: 12,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    deletePropertyButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
