import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadWasteImage } from '../../api/collectorApi';

const DARK_BLUE = '#1E3A8A';
const MED_BLUE = '#2563EB';
const LIGHT_BLUE = '#DBEAFE';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CaptureImageScreen({ navigation, route }) {
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);

    // Prompt the user for camera permissions and open the camera
    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!imageUri) {
            Alert.alert('No Image', 'Please capture an image first.');
            return;
        }

        setLoading(true);
        try {
            // Optional: Pass transactionId if it's available in route.params
            const transactionId = route.params?.transactionId || null;
            const res = await uploadWasteImage(imageUri, transactionId);
            
            // Assuming response has a 'grade' field like { grade: 'High', ... }
            const grade = res.grade || res.predicted_grade || 'Unknown';
            
            Alert.alert('Success', `Waste graded as: ${grade}`, [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigate back and pass the grade parameter
                        navigation.navigate('Collection', { grade: grade });
                    }
                }
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Upload Failed', err?.response?.data?.detail || 'Could not process image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={DARK_BLUE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Grade Image</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                {imageUri ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.retakeButton} onPress={openCamera} disabled={loading}>
                                <Ionicons name="camera-reverse" size={20} color={DARK_BLUE} />
                                <Text style={styles.retakeText}>Retake</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color={WHITE} size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={20} color={WHITE} style={{ marginRight: 8 }} />
                                        <Text style={styles.uploadText}>Grade Waste via AI</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="camera-outline" size={80} color="#CCCCCC" />
                        <Text style={styles.placeholderText}>Capture plastic waste to get AI Grade</Text>
                        <TouchableOpacity style={styles.captureButton} onPress={openCamera}>
                            <Ionicons name="camera" size={20} color={WHITE} style={{ marginRight: 8 }} />
                            <Text style={styles.captureText}>Open Camera</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: BG,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: DARK_BLUE },
    content: {
        flex: 1,
        padding: 20,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: WHITE,
        padding: 20,
    },
    placeholderText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    captureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MED_BLUE,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    captureText: {
        color: WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
    previewContainer: {
        flex: 1,
    },
    imagePreview: {
        flex: 1,
        borderRadius: 16,
        marginBottom: 20,
        backgroundColor: '#E5E7EB',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: LIGHT_BLUE,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flex: 1,
        marginRight: 10,
    },
    retakeText: {
        color: DARK_BLUE,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MED_BLUE,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flex: 2,
    },
    uploadText: {
        color: WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
