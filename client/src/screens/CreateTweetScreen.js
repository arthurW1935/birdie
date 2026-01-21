import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import client from '../api/client';
import { COLORS } from '../constants';

const CreateTweetScreen = ({ navigation }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!content.trim()) return;

        setLoading(true);
        try {
            await client.post('/tweets', { content });
            navigation.goBack(); // Return to feed
        } catch (error) {
            Alert.alert("Error", "Could not post tweet");
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tweetButton, !content.trim() && styles.disabledButton]} 
                    onPress={handlePost}
                    disabled={!content.trim() || loading}
                >
                    {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.tweetButtonText}>Tweet</Text>}
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                placeholder="What's happening?"
                placeholderTextColor={COLORS.secondaryText} // Gray placeholder
                multiline
                autoFocus
                value={content}
                onChangeText={setContent}
                maxLength={280}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Black
        padding: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cancelText: {
        fontSize: 16,
        color: COLORS.text, // White
    },
    tweetButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    tweetButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        fontSize: 20,
        color: COLORS.text, // White Text
        textAlignVertical: 'top',
        flex: 1,
    }
});

export default CreateTweetScreen;