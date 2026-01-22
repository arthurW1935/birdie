import React, { useState } from 'react';
import { 
    View, TextInput, TouchableOpacity, Text, StyleSheet, 
    Image, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import Picker
import client from '../api/client';
import { COLORS } from '../constants';

const CreateTweetScreen = ({ navigation }) => {
    const [tweetContent, setTweetContent] = useState('');
    const [imageUri, setImageUri] = useState(null); // Local preview URI
    const [imageBase64, setImageBase64] = useState(null); // Data to send to server
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // 1. Ask Permission
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "We need access to your photos to upload images.");
            return;
        }

        // 2. Open Picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Updated from outdated enum
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5, // Keep quality low for faster uploads
            base64: true, // <--- CRITICAL: Get the data string
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            // Format data string for Cloudinary
            let base64Img = `data:image/jpg;base64,${result.assets[0].base64}`;
            setImageBase64(base64Img);
        }
    };

    const handlePostTweet = async () => {
        if (!tweetContent.trim() && !imageBase64) {
            Alert.alert("Empty Post", "Please add text or an image.");
            return;
        }

        setLoading(true);
        try {
            await client.post('/tweets', {
                content: tweetContent,
                image: imageBase64 // Send the base64 string
            });
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not post tweet. Image might be too large.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.tweetButton} 
                    onPress={handlePostTweet}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.tweetButtonText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="What's happening?"
                    placeholderTextColor={COLORS.secondaryText}
                    multiline
                    value={tweetContent}
                    onChangeText={setTweetContent}
                    autoFocus
                />
            </View>

            {/* Image Preview Area */}
            {imageUri && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    {/* Remove Image Button */}
                    <TouchableOpacity 
                        style={styles.removeButton} 
                        onPress={() => { setImageUri(null); setImageBase64(null); }}
                    >
                        <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Toolbar */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                    <Ionicons name="image-outline" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 30 },
    cancelText: { color: COLORS.text, fontSize: 16 },
    tweetButton: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
    tweetButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    inputContainer: { marginBottom: 10 },
    input: { color: COLORS.text, fontSize: 18, textAlignVertical: 'top', minHeight: 80 },
    
    // Preview Styles
    previewContainer: { position: 'relative', marginBottom: 20, borderRadius: 15, overflow: 'hidden' },
    previewImage: { width: '100%', height: 250, borderRadius: 15 },
    removeButton: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15, width: 30, height: 30,
        justifyContent: 'center', alignItems: 'center'
    },

    toolbar: { 
        borderTopWidth: 1, 
        borderTopColor: COLORS.border, 
        paddingTop: 15,
        flexDirection: 'row'
    },
    iconButton: { padding: 5 }
});

export default CreateTweetScreen;