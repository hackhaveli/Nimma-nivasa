import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect } from 'react';
import { authAPI } from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

// IMPORTANT: Replace these with your actual Google OAuth credentials
// Get them from: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_IDS = {
    // Android: Create an OAuth 2.0 Client ID for Android
    android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    // iOS: Create an OAuth 2.0 Client ID for iOS
    ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    // Web: OAuth 2.0 Client ID for Web application (works with Expo Go)
    web: '620824811696-7ue6tkd1mqcvng6llc34vtebmomgimmv.apps.googleusercontent.com',
};

interface GoogleUser {
    id: string;
    email: string;
    name: string;
    photo?: string;
}

interface UseGoogleAuthResult {
    signIn: () => Promise<void>;
    isLoading: boolean;
}

export function useGoogleAuth(
    onSuccess: (user: any, isNewUser: boolean) => void,
    onError: (error: string) => void
): UseGoogleAuthResult {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: GOOGLE_CLIENT_IDS.android,
        iosClientId: GOOGLE_CLIENT_IDS.ios,
        webClientId: GOOGLE_CLIENT_IDS.web,
    });

    useEffect(() => {
        handleGoogleResponse();
    }, [response]);

    const handleGoogleResponse = async () => {
        if (response?.type === 'success') {
            const { authentication } = response;

            if (authentication?.accessToken) {
                try {
                    // Fetch user info from Google
                    const userInfoResponse = await fetch(
                        'https://www.googleapis.com/userinfo/v2/me',
                        {
                            headers: { Authorization: `Bearer ${authentication.accessToken}` },
                        }
                    );

                    const userInfo = await userInfoResponse.json();

                    const googleUser: GoogleUser = {
                        id: userInfo.id,
                        email: userInfo.email,
                        name: userInfo.name,
                        photo: userInfo.picture,
                    };

                    // Send to backend
                    const result = await authAPI.googleSignIn(googleUser);

                    onSuccess(result.user, result.isNewUser);
                } catch (error: any) {
                    console.error('Google Sign-In Error:', error);
                    onError(error.message || 'Failed to sign in with Google');
                }
            }
        } else if (response?.type === 'error') {
            onError('Google Sign-In was cancelled or failed');
        }
    };

    const signIn = async () => {
        try {
            await promptAsync();
        } catch (error: any) {
            onError(error.message || 'Failed to initiate Google Sign-In');
        }
    };

    return {
        signIn,
        isLoading: !request,
    };
}

// Alternative: Simple mock for development/testing without real Google credentials
export async function mockGoogleSignIn(): Promise<GoogleUser> {
    // Simulate Google sign-in delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        id: `google_${Date.now()}`,
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        name: 'Google User',
        photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    };
}
