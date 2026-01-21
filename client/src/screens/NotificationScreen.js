import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { COLORS } from '../constants';

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await client.get('/tweets/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handlePress = (tweet) => {
        if (tweet && tweet.userId) {
            navigation.navigate('TweetDetail', { tweet });
        }
    };

    const renderItem = ({ item }) => {
        if (!item.tweetId) return null; 

        const isLike = item.type === 'like';
        const iconName = isLike ? 'heart' : 'chatbubble';
        const iconColor = isLike ? COLORS.error : COLORS.primary;
        const actionText = isLike ? 'liked your post' : 'commented on your post';

        return (
            <TouchableOpacity 
                style={styles.itemContainer} 
                onPress={() => handlePress(item.tweetId)}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={24} color={iconColor} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.sender?.username?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.username}>@{item.sender?.username}</Text>
                    </View>
                    <Text style={styles.actionText}>{actionText}</Text>
                    <Text style={styles.tweetContent} numberOfLines={2}>
                        {item.tweetId?.content}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet</Text>}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.background },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    itemContainer: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    iconContainer: { width: 40, alignItems: 'flex-end', marginRight: 10 },
    textContainer: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    avatarText: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
    username: { fontWeight: 'bold', color: COLORS.text, fontSize: 15 },
    actionText: { color: COLORS.secondaryText, marginBottom: 5 },
    tweetContent: { color: COLORS.secondaryText, fontSize: 14 },
    emptyText: { textAlign: 'center', marginTop: 30, color: COLORS.secondaryText }
});

export default NotificationScreen;