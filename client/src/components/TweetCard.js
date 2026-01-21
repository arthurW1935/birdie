import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { COLORS } from '../constants';

const TweetCard = ({ item }) => {
    const navigation = useNavigation();
    const { userInfo } = useContext(AuthContext);
    const [likes, setLikes] = useState(item.likes || []);
    
    // Safety check for replyCount (default to 0 if undefined)
    const replyCount = item.replyCount || 0;
    
    const isLiked = likes.includes(userInfo?._id);

    const handleLike = async () => {
        try {
            if (isLiked) {
                setLikes(prev => prev.filter(id => id !== userInfo._id));
            } else {
                setLikes(prev => [...prev, userInfo._id]);
            }
            await client.patch(`/tweets/${item._id}/like`);
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    // Handler for navigating to profile
    const goToProfile = () => {
        // We pass both ID and the full user object to help pre-fill data
        navigation.navigate('UserProfile', { 
            userId: item.userId._id, 
            user: item.userId 
        });
    };

    return (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.9} 
            onPress={() => navigation.navigate('TweetDetail', { tweet: item })}
        >
            <View style={styles.row}>
                {/* Wrap Avatar in Touchable */}
                <TouchableOpacity onPress={goToProfile}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.userId?.username?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        {/* Wrap Username in Touchable */}
                        <TouchableOpacity onPress={goToProfile}>
                            <Text style={styles.username}>@{item.userId?.username || 'Unknown'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.date}> · {new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    
                    <Text style={styles.content}>{item.content}</Text>

                    <View style={styles.actionRow}>
                        {/* LIKE BUTTON */}
                        <TouchableOpacity onPress={handleLike} style={styles.iconGroup}>
                            <Ionicons 
                                name={isLiked ? "heart" : "heart-outline"} 
                                size={18} 
                                color={isLiked ? COLORS.error : COLORS.secondaryText} 
                            />
                            <Text style={[
                                styles.iconText, 
                                isLiked && { color: COLORS.error }
                            ]}>
                                {likes.length || ''}
                            </Text>
                        </TouchableOpacity>

                        {/* REPLY BUTTON */}
                        <View style={styles.iconGroup}>
                            <Ionicons 
                                name="chatbubble-outline" 
                                size={18} 
                                color={COLORS.secondaryText} 
                            />
                            <Text style={styles.iconText}>
                                {replyCount > 0 ? replyCount : ''}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    row: { flexDirection: 'row' },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
    contentContainer: { flex: 1 },
    header: { flexDirection: 'row', marginBottom: 4 },
    username: { fontWeight: 'bold', fontSize: 15, color: COLORS.text },
    date: { color: COLORS.secondaryText, fontSize: 15 },
    content: { fontSize: 15, lineHeight: 20, color: COLORS.text, marginBottom: 10 },
    
    // NEW ACTION ROW STYLES
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25, // Spacing between icons
        minWidth: 40,
    },
    iconText: {
        fontSize: 13,
        color: COLORS.secondaryText,
        marginLeft: 5,
    }
});

export default TweetCard;