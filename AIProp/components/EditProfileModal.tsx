import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import { userAPI } from '@/services/api';
import { User } from '@/mocks/users';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: () => Promise<void>;
}

export default function EditProfileModal({ visible, onClose, user, onUpdate }: EditProfileModalProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Please grant camera roll permissions to upload images');
                return;
            }

            setUploadingImage(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                setAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setIsLoading(true);
        try {
            const updates: any = { name, email: email || undefined };

            // If avatar changed, include it
            if (avatar && avatar !== user?.avatar) {
                updates.avatar = avatar;
            }

            await userAPI.updateProfile(updates);
            await onUpdate();
            Alert.alert('Success', 'Profile updated successfully');
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} disabled={isLoading}>
                            <X size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Profile Picture Section */}
                        <View style={styles.avatarSection}>
                            <Text style={styles.sectionLabel}>Profile Picture</Text>
                            <View style={styles.avatarPreviewContainer}>
                                {avatar ? (
                                    <Image source={{ uri: avatar }} style={styles.avatarPreview} />
                                ) : (
                                    <View style={[styles.avatarPreview, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarPlaceholderText}>
                                            {name ? name.charAt(0).toUpperCase() : 'U'}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.changePictureButton}
                                    onPress={pickImage}
                                    disabled={uploadingImage || isLoading}
                                >
                                    {uploadingImage ? (
                                        <ActivityIndicator size="small" color="#8B5CF6" />
                                    ) : (
                                        <>
                                            <Camera size={18} color="#8B5CF6" />
                                            <Text style={styles.changePictureText}>
                                                {avatar ? 'Change Photo' : 'Upload Photo'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#9CA3AF"
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={user?.mobile}
                                    editable={false}
                                />
                                <Text style={styles.helperText}>Mobile number cannot be changed</Text>
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton, isLoading && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#111827',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    inputDisabled: {
        backgroundColor: '#F3F4F6',
        color: '#9CA3AF',
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    saveButton: {
        backgroundColor: '#8B5CF6',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    avatarSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    avatarPreviewContainer: {
        alignItems: 'center',
        gap: 12,
    },
    avatarPreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8B5CF6',
    },
    avatarPlaceholderText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    changePictureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#8B5CF6',
    },
    changePictureText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B5CF6',
    },
});
