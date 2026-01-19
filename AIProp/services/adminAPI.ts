import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://nimma-nivasa.onrender.com/api';

// Request timeout utility
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - backend is waking up, please try again in 30 seconds');
        }
        throw error;
    }
};

// Get authentication token
const getToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const adminAPI = {
    // Get dashboard statistics
    getStats: async () => {
        const token = await getToken();
        if (!token) throw new Error('Authentication required');

        const response = await fetchWithTimeout(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch statistics');
        }

        return await response.json();
    },

    // Get all users with pagination
    getUsers: async (page = 1, limit = 20, search = '') => {
        const token = await getToken();
        if (!token) throw new Error('Authentication required');

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });

        const response = await fetchWithTimeout(`${API_URL}/admin/users?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch users');
        }

        return await response.json();
    },

    // Delete a user
    deleteUser: async (userId: string) => {
        const token = await getToken();
        if (!token) throw new Error('Authentication required');

        const response = await fetchWithTimeout(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete user');
        }

        return await response.json();
    },

    // Get user's properties
    getUserProperties: async (userId: string) => {
        const token = await getToken();
        if (!token) throw new Error('Authentication required');

        const response = await fetchWithTimeout(`${API_URL}/admin/user/${userId}/properties`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch user properties');
        }

        return await response.json();
    },

    // Get all properties with pagination
    getProperties: async (page = 1, limit = 20, status = 'all') => {
        const token = await getToken();
        if (!token) throw new Error('Authentication required');

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            status
        });

        const response = await fetchWithTimeout(`${API_URL}/admin/properties?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch properties');
        }

        return await response.json();
    },

    // Delete a property
    deleteProperty: async (propertyId: string) => {
        const token = await getToken();
        if (!token) throw new Error('Authentication required');

        const response = await fetchWithTimeout(`${API_URL}/admin/properties/${propertyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete property');
        }

        return await response.json();
    },

    // Toggle property status (active/inactive)
    togglePropertyStatus: async (propertyId: string, isActive: boolean) => {
        const token = await getToken();
        if (!token) throw new Error('Authentication required');

        const response = await fetchWithTimeout(`${API_URL}/admin/properties/${propertyId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'bypass-tunnel-reminder': 'true',
            },
            body: JSON.stringify({ isActive }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update property status');
        }

        return await response.json();
    },
};
