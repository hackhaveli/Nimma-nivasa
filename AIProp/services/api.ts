import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
// For development: use your computer's local IP address (find with ipconfig on Windows)
// For production: use your deployed backend URL
const API_URL = 'https://nimma-nivasa.onrender.com/api'; // Production Render URL

// Get authentication token
const getToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

// Set authentication token
const setToken = async (token: string) => {
    try {
        await AsyncStorage.setItem('authToken', token);
    } catch (error) {
        console.error('Error setting token:', error);
    }
};

// Remove authentication token
const removeToken = async () => {
    try {
        await AsyncStorage.removeItem('authToken');
    } catch (error) {
        console.error('Error removing token:', error);
    }
};

// Auth API
export const authAPI = {
    register: async (name: string, mobile: string, password: string, email?: string) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, mobile, password, email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        if (data.token) {
            await setToken(data.token);
        }

        return data;
    },

    login: async (mobile: string, password: string) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'bypass-tunnel-reminder': 'true',
            },
            body: JSON.stringify({ mobile, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        if (data.token) {
            await setToken(data.token);
        }

        return data;
    },

    getCurrentUser: async () => {
        const token = await getToken();
        if (!token) return null;

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            await removeToken();
            return null;
        }

        const data = await response.json();
        return data.user;
    },

    logout: async () => {
        await removeToken();
    },

    googleSignIn: async (googleUser: { id: string; email: string; name: string; photo?: string }) => {
        const response = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'bypass-tunnel-reminder': 'true',
            },
            body: JSON.stringify({ user: googleUser }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Google sign-in failed');
        }

        if (data.token) {
            await setToken(data.token);
        }

        return data;
    },

    completeProfile: async (mobile: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/auth/complete-profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
            body: JSON.stringify({ mobile }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update profile');
        }

        return data;
    },
};

// Properties API
export const propertiesAPI = {
    getAll: async (filters?: {
        category?: string;
        purpose?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        latitude?: number;
        longitude?: number;
    }) => {
        const queryParams = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const url = `${API_URL}/properties?${queryParams.toString()}`;
        const response = await fetch(url, {
            headers: {
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        return data.properties;
    },

    getNearby: async (latitude: number, longitude: number, maxDistance = 5000) => {
        const queryParams = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            maxDistance: maxDistance.toString(),
        });

        const url = `${API_URL}/properties/nearby?${queryParams.toString()}`;
        const response = await fetch(url, {
            headers: {
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch nearby properties');
        }

        const data = await response.json();
        return data; // Returns { properties, isFallback, fallbackRadius, count, userLocation }
    },

    getById: async (id: string) => {
        const response = await fetch(`${API_URL}/properties/${id}`, {
            headers: {
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch property');
        }

        const data = await response.json();
        return data.property;
    },

    create: async (propertyData: any) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(propertyData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create property');
        }

        return data.property;
    },

    update: async (id: string, propertyData: any) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(propertyData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update property');
        }

        return data.property;
    },

    delete: async (id: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete property');
        }

        return true;
    },

    incrementLead: async (id: string) => {
        await fetch(`${API_URL}/properties/${id}/lead`, {
            method: 'POST',
        });
    },
};

// User API
export const userAPI = {
    getMyListings: async () => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/users/my-listings`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        return data.properties;
    },

    getSavedProperties: async () => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/users/saved-properties`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch saved properties');
        }

        const data = await response.json();
        return data.properties;
    },

    toggleSaveProperty: async (propertyId: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/users/save-property/${propertyId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to save property');
        }

        const data = await response.json();
        return data;
    },

    getProfile: async () => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        return data.user;
    },

    updateProfile: async (updates: any) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const data = await response.json();
        return data.user;
    },
};

// Admin API
export const adminAPI = {
    getDashboard: async () => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch dashboard');
        }

        return data;
    },

    getProperties: async (filters?: { status?: string; page?: number; limit?: number }) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${API_URL}/admin/properties?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch properties');
        }

        return data;
    },

    approveProperty: async (propertyId: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/admin/properties/${propertyId}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to approve property');
        }

        return data;
    },

    rejectProperty: async (propertyId: string, reason?: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/admin/properties/${propertyId}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to reject property');
        }

        return data;
    },

    deleteProperty: async (propertyId: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/admin/properties/${propertyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete property');
        }

        return data;
    },

    getUsers: async (filters?: { search?: string; page?: number; limit?: number }) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${API_URL}/admin/users?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch users');
        }

        return data;
    },

    verifyUser: async (userId: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to verify user');
        }

        return data;
    },

    deleteUser: async (userId: string) => {
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete user');
        }

        return data;
    },
};
