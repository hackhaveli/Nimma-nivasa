import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import { authAPI, propertiesAPI, userAPI } from '@/services/api';
import { User } from '@/mocks/users';
import { Property } from '@/mocks/properties';

interface AppContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (mobile: string, password: string) => Promise<boolean>;
    register: (name: string, mobile: string, password: string, email?: string) => Promise<boolean>;
    logout: () => void;
    savedPropertyIds: string[];
    toggleSaveProperty: (propertyId: string) => void;
    isPropertySaved: (propertyId: string) => boolean;
    userListings: Property[];
    addProperty: (property: Omit<Property, 'id' | 'views' | 'leads' | 'createdAt'>) => Promise<void>;
    refreshUserData: () => Promise<void>;
}

export const [AppProvider, useApp] = createContextHook<AppContextType>(() => {
    const [user, setUser] = useState<User | null>(null);
    const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
    const [userListings, setUserListings] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            const currentUser = await authAPI.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                await loadUserData();
            }
        } catch (error) {
            console.log('Failed to load user session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserData = async () => {
        try {
            // Load user's listings
            const listings = await userAPI.getMyListings();
            setUserListings(listings);

            // Load saved properties
            const savedProps = await userAPI.getSavedProperties();
            setSavedPropertyIds(savedProps.map((p: Property) => p.id));
        } catch (error) {
            console.log('Failed to load user data:', error);
        }
    };

    const refreshUserData = async () => {
        try {
            // Re-fetch the current user from auth
            const currentUser = await authAPI.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                await loadUserData();
            }
        } catch (error) {
            console.log('Failed to refresh user data:', error);
        }
    };

    const login = async (mobile: string, password: string): Promise<boolean> => {
        try {
            const response = await authAPI.login(mobile, password);
            setUser(response.user);
            await loadUserData();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (
        name: string,
        mobile: string,
        password: string,
        email?: string
    ): Promise<boolean> => {
        try {
            const response = await authAPI.register(name, mobile, password, email);
            setUser(response.user);
            await loadUserData();
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            setSavedPropertyIds([]);
            setUserListings([]);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleSaveProperty = async (propertyId: string) => {
        try {
            const result = await userAPI.toggleSaveProperty(propertyId);

            if (result.isSaved) {
                setSavedPropertyIds([...savedPropertyIds, propertyId]);
            } else {
                setSavedPropertyIds(savedPropertyIds.filter(id => id !== propertyId));
            }
        } catch (error) {
            console.error('Toggle save error:', error);
        }
    };

    const isPropertySaved = (propertyId: string): boolean => {
        return savedPropertyIds.includes(propertyId);
    };

    const addProperty = async (property: Omit<Property, 'id' | 'views' | 'leads' | 'createdAt'>) => {
        try {
            const newProperty = await propertiesAPI.create(property);
            setUserListings([newProperty, ...userListings]);

            // Update user's posting count
            if (user) {
                setUser({
                    ...user,
                    postings: user.postings + 1,
                });
            }
        } catch (error) {
            console.error('Add property error:', error);
            throw error;
        }
    };

    return {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        savedPropertyIds,
        toggleSaveProperty,
        isPropertySaved,
        userListings,
        addProperty,
        refreshUserData,
    };
});

export const useSavedProperties = () => {
    const { savedPropertyIds } = useApp();
    const [savedProperties, setSavedProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSavedProperties();
    }, [savedPropertyIds]);

    const loadSavedProperties = async () => {
        try {
            const properties = await userAPI.getSavedProperties();
            setSavedProperties(properties);
        } catch (error) {
            console.error('Failed to load saved properties:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return savedProperties;
};

export const useAllProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAllProperties();
    }, []);

    const loadAllProperties = async () => {
        try {
            const allProps = await propertiesAPI.getAll();
            setProperties(allProps);
        } catch (error) {
            console.error('Failed to load properties:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = async (filters?: any) => {
        try {
            const allProps = await propertiesAPI.getAll(filters);
            setProperties(allProps);
        } catch (error) {
            console.error('Failed to refresh properties:', error);
        }
    };

    return { properties, isLoading, refresh };
};
