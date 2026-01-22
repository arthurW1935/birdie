import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { COLORS } from '../constants';

const SearchScreen = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debounce search (wait for user to stop typing)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                searchUsers();
            } else {
                setResults([]);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const searchUsers = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/auth/search?q=${query}`);
            setResults(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserPress = (user) => {
        // Navigate to the reusable ProfileScreen with params
        navigation.navigate('UserProfile', { userId: user._id, user: user });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item)}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.bio} numberOfLines={1}>{item.bio || "Birdie User"}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Birdie"
                    placeholderTextColor={COLORS.secondaryText}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                />
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        query.trim() ? <Text style={styles.emptyText}>No users found</Text> : null
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 45 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        margin: 15,
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: { color: COLORS.text, fontWeight: 'bold', fontSize: 18 },
    username: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
    bio: { color: COLORS.secondaryText, fontSize: 14 },
    emptyText: { textAlign: 'center', marginTop: 20, color: COLORS.secondaryText }
});

export default SearchScreen;