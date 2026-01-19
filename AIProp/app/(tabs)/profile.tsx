import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, ChevronRight, FileText, Heart, Shield, Crown, User, MapPin, Edit3, Eye, Users, Settings } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

import { useLocation } from '@/hooks/useLocation';
import EditProfileModal from '@/components/EditProfileModal';
import { userAPI } from '@/services/api';
import { useEffect } from 'react';

const LOGO_IMG = require('../../assets/images/logo.png');

export default function ProfileScreen() {
    const { user, isAuthenticated, login, register, logout, userListings, refreshUserData } = useApp();
    const { location, loading: locationLoading, refresh: refreshLocation } = useLocation();

    // Sync location to backend when found
    useEffect(() => {
        const syncLocation = async () => {
            if (isAuthenticated && location && location.address) {
                try {
                    await userAPI.updateProfile({
                        location: {
                            city: location.address.city,
                            state: location.address.state,
                            country: 'India',
                            coordinates: {
                                latitude: location.latitude,
                                longitude: location.longitude
                            },
                            address: location.address.formatted
                        }
                    });
                } catch (error) {
                    console.error('Location sync failed:', error);
                }
            }
        };
        syncLocation();
    }, [location, isAuthenticated]);
    const [isLogin, setIsLogin] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    // Google Sign-In setup
    const { signIn: googleSignIn, isLoading: isGoogleLoading } = useGoogleAuth(
        async (user, isNewUser) => {
            // Success callback
            if (isNewUser) {
                Alert.alert(
                    'Welcome!',
                    'Your account has been created. Please complete your profile by adding a mobile number.',
                    [{ text: 'OK' }]
                );
            }
            await refreshUserData();
        },
        (error) => {
            // Error callback
            Alert.alert('Google Sign-In Error', error);
        }
    );

    // Unified Identifier for Login (Mobile or Email)
    const [identifier, setIdentifier] = useState('');

    const handleAuth = async () => {
        if (isLogin) {
            // Check for identifier
            if (!identifier) {
                Alert.alert('Error', 'Please enter Email or Mobile Number');
                return;
            }

            // Determine if it's mobile or email login
            let loginData: { mobile?: string; email?: string; password: string; identifier?: string } = { password };

            // Allow sending the identifier directly to the backend
            // The backend is already updated to handle `identifier` field
            loginData.identifier = identifier;

            // Call login with the flexible data
            // Note: We need to update the context/api to support this, 
            // but for now let's pass it as the first argument which context likely expects as mobile
            const success = await login(identifier, password);
            if (!success) {
                Alert.alert('Error', 'Invalid credentials');
            }
        } else {
            // Registration Logic
            if (!name || !password || (!mobile && !email)) {
                Alert.alert('Error', 'Please fill name, password and either mobile or email');
                return;
            }
            await register(name, mobile, password, email);
        }
    };

    const handleGoogleSignIn = async () => {
        await googleSignIn();
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.authWrapper}>
                <View style={styles.authBackgroundTop} />
                <SafeAreaView style={styles.container}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <ScrollView contentContainerStyle={styles.authContainer} showsVerticalScrollIndicator={false}>
                            <View style={styles.authHeader}>
                                <View style={styles.brandContainer}>
                                    <Image source={LOGO_IMG} style={styles.authLogo} />
                                    <View style={styles.brandTextContainer}>
                                        <Text style={styles.brandTitleMain}>Nimma</Text>
                                        <Text style={styles.brandTitleAccent}>Nivasa</Text>
                                    </View>
                                </View>
                                <Text style={styles.authTitle}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
                                <Text style={styles.authSubtitle}>
                                    {isLogin ? 'Sign in with Email or Mobile' : 'Join us to find your dream property'}
                                </Text>
                            </View>

                            <View style={styles.authCard}>
                                <View style={styles.authForm}>
                                    {!isLogin && (
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.label}>Full Name *</Text>
                                            <View style={styles.inputWrapper}>
                                                <User size={18} color="#9CA3AF" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter your name"
                                                    value={name}
                                                    onChangeText={setName}
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {/* Login: Single Identifier Field */}
                                    {isLogin ? (
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.label}>Email or Mobile *</Text>
                                            <View style={styles.inputWrapper}>
                                                <User size={18} color="#9CA3AF" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter Email or Mobile Number"
                                                    value={identifier}
                                                    onChangeText={setIdentifier}
                                                    autoCapitalize="none"
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                            </View>
                                        </View>
                                    ) : (
                                        // Signup: Separate Fields
                                        <>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>Mobile Number (Optional)</Text>
                                                <View style={styles.inputWrapper}>
                                                    <Text style={styles.inputIcon}>📱</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="+91 9876543210"
                                                        value={mobile}
                                                        onChangeText={setMobile}
                                                        keyboardType="phone-pad"
                                                        placeholderTextColor="#9CA3AF"
                                                    />
                                                </View>
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>Email (Optional)</Text>
                                                <View style={styles.inputWrapper}>
                                                    <Text style={styles.inputIcon}>✉️</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="your@email.com"
                                                        value={email}
                                                        onChangeText={setEmail}
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        placeholderTextColor="#9CA3AF"
                                                    />
                                                </View>
                                            </View>
                                            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, fontStyle: 'italic' }}>
                                                * Provide at least one contact method
                                            </Text>
                                        </>
                                    )}

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Password *</Text>
                                        <View style={styles.inputWrapper}>
                                            <Text style={styles.inputIcon}>🔒</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter password"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry
                                                placeholderTextColor="#9CA3AF"
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
                                        <Text style={styles.primaryButtonText}>
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.divider} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.divider} />
                                </View>

                                <TouchableOpacity
                                    style={styles.googleButton}
                                    onPress={handleGoogleSignIn}
                                    disabled={isGoogleLoading}
                                >
                                    {isGoogleLoading ? (
                                        <ActivityIndicator size="small" color="#4285F4" />
                                    ) : (
                                        <>
                                            <Image
                                                source={{ uri: 'https://www.google.com/favicon.ico' }}
                                                style={styles.googleIcon}
                                            />
                                            <Text style={styles.googleButtonText}>
                                                Continue with Google
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.switchButton}
                                    onPress={() => setIsLogin(!isLogin)}
                                >
                                    <Text style={styles.switchButtonText}>
                                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                        <Text style={styles.switchButtonTextBold}>
                                            {isLogin ? 'Sign Up' : 'Sign In'}
                                        </Text>
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.demoHintContainer}>
                                    <Text style={styles.demoHint}>💡 Demo Credentials</Text>
                                    <Text style={styles.demoHintDetails}>+919876543210 / password123</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topAppBar}>
                <Image source={LOGO_IMG} style={styles.appBarLogo} />
                <View style={styles.appBarTitle}>
                    <Text style={styles.appBarMain}>Nimma</Text>
                    <Text style={styles.appBarAccent}>Nivasa</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.profileContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.headerGradient}>
                    <View style={styles.profileCard}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={() => setShowEditModal(true)}
                        >
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Text style={styles.avatarPlaceholderText}>
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.avatarBadge}>
                                <Edit3 size={14} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.name}</Text>
                            <Text style={styles.userMobile}>{user?.mobile}</Text>
                            <View style={styles.badgesRow}>
                                {user?.isVerified && (
                                    <View style={styles.badge}>
                                        <Shield size={12} color="#10B981" />
                                        <Text style={styles.badgeText}>VERIFIED</Text>
                                    </View>
                                )}
                                {user?.isPremium && (
                                    <View style={[styles.badge, styles.premiumBadge]}>
                                        <Crown size={12} color="#F59E0B" />
                                        <Text style={[styles.badgeText, styles.premiumBadgeText]}>PREMIUM</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <FileText size={18} color="#8B5CF6" />
                            </View>
                            <Text style={styles.statValue}>{user?.postings || 0}</Text>
                            <Text style={styles.statLabel}>Postings</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <Eye size={18} color="#3B82F6" />
                            </View>
                            <Text style={styles.statValue}>{user?.views || 0}</Text>
                            <Text style={styles.statLabel}>Views</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <Users size={18} color="#10B981" />
                            </View>
                            <Text style={styles.statValue}>{user?.leads || 0}</Text>
                            <Text style={styles.statLabel}>Leads</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                        <View style={styles.locationIconWrapper}>
                            <MapPin size={20} color="#8B5CF6" />
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationCity}>
                                {locationLoading ? 'Getting location...' : location?.address?.city || 'Unknown City'}
                            </Text>
                            <Text style={styles.locationArea}>
                                {locationLoading
                                    ? 'Please wait...'
                                    : location?.address
                                        ? `${location.address.area}, ${location.latitude.toFixed(4)}°N ${location.longitude.toFixed(4)}°E`
                                        : location
                                            ? `${location.latitude.toFixed(4)}°N ${location.longitude.toFixed(4)}°E`
                                            : 'Enable location permissions'
                                }
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.changeLocationButton}
                        onPress={refreshLocation}
                        disabled={locationLoading}
                    >
                        <Text style={styles.changeLocationText}>{locationLoading ? 'Updating...' : 'Refresh'}</Text>
                        <ChevronRight size={16} color="#8B5CF6" />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>My Marketplace Ads</Text>
                        <Text style={styles.sectionSubtitle}>{userListings.length} active listings</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/post')}>
                        <View style={styles.addButton}>
                            <Text style={styles.addButtonText}>+ Add</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {userListings.length > 0 ? (
                    <View style={styles.listingsContainer}>
                        {userListings.map((property) => (
                            <TouchableOpacity
                                key={property.id}
                                style={styles.propertyPreviewCard}
                                onPress={() => router.push(`/property/${property.id}`)}
                            >
                                <Image source={{ uri: property.images[0] }} style={styles.propertyPreviewImage} />
                                <View style={styles.propertyPreviewInfo}>
                                    <Text style={styles.propertyPreviewTitle} numberOfLines={1}>
                                        {property.title}
                                    </Text>
                                    <View style={styles.propertyPreviewMeta}>
                                        <View style={styles.categoryBadgeSmall}>
                                            <Text style={styles.categoryBadgeSmallText}>{property.category}</Text>
                                        </View>
                                        <View style={styles.propertyPreviewStats}>
                                            <Eye size={12} color="#9CA3AF" />
                                            <Text style={styles.propertyPreviewStatsText}>{property.views}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <FileText size={48} color="#D1D5DB" />
                        <Text style={styles.emptyStateText}>No listings yet</Text>
                        <Text style={styles.emptyStateSubtext}>Start posting your properties</Text>
                    </View>
                )}

                <View style={styles.menuCard}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(tabs)/search')}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.menuIconWrapper}>
                                <FileText size={20} color="#8B5CF6" />
                            </View>
                            <View>
                                <Text style={styles.menuItemText}>My Listings</Text>
                                <Text style={styles.menuItemSubtext}>Manage your properties</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Admin Dashboard Button - Only for Super Admin */}
                    {user?.email === 'coderrohit2927@gmail.com' && (
                        <View>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => router.push('/admin')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={[styles.menuIconWrapper, styles.adminIconWrapper]}>
                                        <Shield size={20} color="#8B5CF6" />
                                    </View>
                                    <View>
                                        <View style={styles.adminTitleRow}>
                                            <Text style={styles.menuItemText}>Admin Dashboard</Text>
                                            <View style={styles.adminBadge}>
                                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.menuItemSubtext}>Manage users & properties</Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.menuDivider} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(tabs)/saved')}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.menuIconWrapper}>
                                <Heart size={20} color="#EF4444" />
                            </View>
                            <View>
                                <Text style={styles.menuItemText}>Saved Properties</Text>
                                <Text style={styles.menuItemSubtext}>View your favorites</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>



                    <View style={styles.menuDivider} />

                    <TouchableOpacity style={styles.menuItem} onPress={logout}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIconWrapper, styles.logoutIconWrapper]}>
                                <LogOut size={20} color="#EF4444" />
                            </View>
                            <View>
                                <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
                                <Text style={styles.menuItemSubtext}>Sign out of your account</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onUpdate={refreshUserData}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    authWrapper: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    authBackgroundTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: '#8B5CF6',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    keyboardView: {
        flex: 1,
    },
    authContainer: {
        padding: 20,
        paddingTop: 40,
        paddingBottom: 100,
    },
    authHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    authIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    authTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    authSubtitle: {
        fontSize: 16,
        color: '#E9D5FF',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    authCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    authForm: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    inputIcon: {
        fontSize: 18,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    primaryButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        gap: 12,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        gap: 12,
        marginBottom: 16,
    },
    googleIcon: {
        width: 24,
        height: 24,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    switchButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    switchButtonText: {
        fontSize: 15,
        color: '#6B7280',
    },
    switchButtonTextBold: {
        color: '#8B5CF6',
        fontWeight: '700',
    },
    demoHintContainer: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    demoHint: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400E',
        textAlign: 'center',
        marginBottom: 4,
    },
    demoHintDetails: {
        fontSize: 12,
        color: '#B45309',
        textAlign: 'center',
        fontWeight: '500',
    },
    profileContainer: {
        paddingBottom: 120, // Add extra padding to avoid overlap with bottom nav
    },
    headerGradient: {
        backgroundColor: '#8B5CF6',
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarPlaceholder: {
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#7C3AED',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
        gap: 6,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userMobile: {
        fontSize: 14,
        color: '#E9D5FF',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#10B981',
    },
    premiumBadge: {
        backgroundColor: '#FEF3C7',
    },
    premiumBadgeText: {
        color: '#F59E0B',
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        gap: 4,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    locationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    locationIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationInfo: {
        flex: 1,
        gap: 2,
    },
    locationCity: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    locationArea: {
        fontSize: 12,
        color: '#6B7280',
    },
    changeLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    changeLocationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    listingsContainer: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    propertyPreviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    propertyPreviewImage: {
        width: 100,
        height: 100,
    },
    propertyPreviewInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    propertyPreviewTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    propertyPreviewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryBadgeSmall: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryBadgeSmallText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    propertyPreviewStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    propertyPreviewStatsText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        marginHorizontal: 20,
        marginBottom: 24,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 4,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    menuIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutIconWrapper: {
        backgroundColor: '#FEE2E2',
    },
    menuItemText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '600',
    },
    menuItemSubtext: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    logoutText: {
        color: '#EF4444',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },
    // Branding Styles
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
    },
    authLogo: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    brandTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    brandTitleMain: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    brandTitleAccent: {
        fontSize: 24,
        fontWeight: '800',
        color: '#8B5CF6',
    },
    topAppBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 10,
    },
    appBarLogo: {
        width: 32,
        height: 32,
        borderRadius: 6,
    },
    appBarTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    appBarMain: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    appBarAccent: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    adminIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    adminBadge: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    adminBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
