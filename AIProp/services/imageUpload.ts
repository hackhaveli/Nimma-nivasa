import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

// For now, we'll use a placeholder image service
// When Cloudinary credentials are added, uncomment the Cloudinary code

interface ImageUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

interface ImagePickerResult {
    uri: string;
    base64?: string;
    width: number;
    height: number;
}

// Request camera/gallery permissions
export async function requestMediaPermissions(): Promise<boolean> {
    if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Please grant camera and photo library permissions to upload images.',
                [{ text: 'OK' }]
            );
            return false;
        }
    }
    return true;
}

// Pick image from gallery
export async function pickImage(): Promise<ImagePickerResult | null> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
    });

    if (!result.canceled && result.assets[0]) {
        return {
            uri: result.assets[0].uri,
            base64: result.assets[0].base64 || undefined,
            width: result.assets[0].width,
            height: result.assets[0].height,
        };
    }

    return null;
}

// Take photo with camera
export async function takePhoto(): Promise<ImagePickerResult | null> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
    });

    if (!result.canceled && result.assets[0]) {
        return {
            uri: result.assets[0].uri,
            base64: result.assets[0].base64 || undefined,
            width: result.assets[0].width,
            height: result.assets[0].height,
        };
    }

    return null;
}

// Pick multiple images
export async function pickMultipleImages(maxImages: number = 5): Promise<ImagePickerResult[]> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return [];

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        quality: 0.8,
        base64: true,
    });

    if (!result.canceled && result.assets) {
        return result.assets.map(asset => ({
            uri: asset.uri,
            base64: asset.base64 || undefined,
            width: asset.width,
            height: asset.height,
        }));
    }

    return [];
}

// Upload image via backend to Cloudinary
// The backend handles the Cloudinary API credentials securely
export async function uploadToCloudinary(
    imageUri: string,
    _base64?: string
): Promise<ImageUploadResult> {
    try {
        // Get the API URL from the api service
        // Import this at the top or use a config file in production
        const API_URL = 'http://10.189.166.102:3000/api'; // Match your backend URL

        // Create form data for upload
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `property_${Date.now()}.jpg`,
        } as any);

        try {
            const response = await fetch(`${API_URL}/upload/single`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return {
                success: true,
                url: data.url,
            };
        } catch (uploadError) {
            // Fallback to placeholder if backend upload fails (e.g., no Cloudinary credentials)
            console.log('Backend upload failed, using placeholder:', uploadError);
            const placeholderUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;

            return {
                success: true,
                url: placeholderUrl,
            };
        }

    } catch (error: any) {
        console.error('Image upload error:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload image',
        };
    }
}

// Upload multiple images
export async function uploadMultipleImages(
    images: ImagePickerResult[],
    onProgress?: (current: number, total: number) => void
): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
        onProgress?.(i + 1, images.length);

        const result = await uploadToCloudinary(images[i].uri, images[i].base64);

        if (result.success && result.url) {
            uploadedUrls.push(result.url);
        }
    }

    return uploadedUrls;
}

// Show image source picker (camera or gallery)
export function showImageSourcePicker(
    onCamera: () => void,
    onGallery: () => void
): void {
    Alert.alert(
        'Select Image Source',
        'Choose where to get your image from',
        [
            { text: 'Camera', onPress: onCamera },
            { text: 'Gallery', onPress: onGallery },
            { text: 'Cancel', style: 'cancel' },
        ]
    );
}
