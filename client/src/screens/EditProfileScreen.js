import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { COLORS } from '../constants';
// No need to import AsyncStorage here anymore

const EditProfileScreen = ({ navigation }) => {
    const { userInfo, logout, updateUser } = useContext(AuthContext); // <--- Import updateUser
    
    const [username, setUsername] = useState(userInfo?.username || '');
    const [bio, setBio] = useState(userInfo?.bio || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = { username, bio };
            
            if (newPassword.trim()) {
                if (!oldPassword.trim()) {
                    Alert.alert("Error", "Enter old password to change password");
                    setLoading(false);
                    return;
                }
                payload.oldPassword = oldPassword;
                payload.password = newPassword;
            }

            const res = await client.put('/auth/profile', payload);
            
            // --- FIX: Update Global Context State Immediately ---
            updateUser(res.data); 
            
            Alert.alert("Success", "Profile updated!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    // ... rest of the UI code remains exactly the same ...
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Username</Text>
            <TextInput 
                style={styles.input} 
                value={username} 
                onChangeText={setUsername} 
                placeholderTextColor={COLORS.secondaryText}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                value={bio} 
                onChangeText={setBio} 
                multiline
                placeholder="Tell us about yourself..."
                placeholderTextColor={COLORS.secondaryText}
            />

            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>Change Password</Text>

            <Text style={styles.label}>Old Password</Text>
            <TextInput 
                style={styles.input} 
                value={oldPassword} 
                onChangeText={setOldPassword} 
                secureTextEntry
                placeholderTextColor={COLORS.secondaryText}
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput 
                style={styles.input} 
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry
                placeholderTextColor={COLORS.secondaryText}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
    label: { color: COLORS.secondaryText, marginTop: 15, marginBottom: 5 },
    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
    sectionHeader: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 30,
    },
    saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    logoutButton: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
        borderRadius: 30,
        marginBottom: 50
    },
    logoutText: { color: COLORS.error, fontWeight: 'bold' }
});

export default EditProfileScreen;