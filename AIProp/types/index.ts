// Export types for better IDE autocomplete
export interface User {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    password?: string; // Optional because Google users won't have one exposed
    avatar?: string;
    isVerified: boolean;
    isPremium: boolean;
    isAdmin: boolean;
    authProvider: 'local' | 'google';
    googleId?: string;
    postings: number;
    views: number;
    leads: number;
    createdAt: string;
    updatedAt: string;
}

export interface Property {
    id: string;
    title: string;
    category: 'House' | 'Plot' | 'Shop' | 'Land';
    purpose: 'Rent' | 'Sale';
    price: number;
    images: string[];
    location: {
        latitude: number;
        longitude: number;
        areaName: string;
        city: string;
        landmark?: string;
    };
    width: number;
    length: number;
    description?: string;
    ownerName: string;
    whatsappNumber: string;

    // Conditional fields for House
    bedrooms?: number;
    kitchen?: number;
    hall?: number;

    // Metadata
    views: number;
    leads: number;
    isActive: boolean;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
    owner?: User | string; // Can be populated or just ID

    // Admin fields
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
}

export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    photo?: string;
}

export interface AdminDashboard {
    stats: {
        totalUsers: number;
        totalProperties: number;
        activeProperties: number;
        pendingProperties: number;
    };
    recentUsers: User[];
    recentProperties: Property[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}
