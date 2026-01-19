export interface User {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    password?: string;
    avatar?: string;
    isVerified: boolean;
    isPremium: boolean;
    isAdmin?: boolean;
    role?: 'user' | 'admin';
    authProvider?: 'local' | 'google';
    googleId?: string;
    postings: number;
    views: number;
    leads: number;
    createdAt?: string;
    updatedAt?: string;
}

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'John Doe',
        mobile: '+919876543210',
        email: 'john@example.com',
        password: 'password123',
        avatar: 'https://i.pravatar.cc/150?img=1',
        isVerified: true,
        isPremium: true,
        postings: 5,
        views: 1234,
        leads: 67,
    },
];
