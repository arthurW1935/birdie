import React, { useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import TweetCard from '../components/TweetCard';
import { COLORS } from '../constants';

const ProfileScreen = ({ navigation, route }) => {
    const { userInfo, updateUser } = useContext(AuthContext);
    
    const viewingUserId = route.params?.userId || userInfo._id;
    const isOwnProfile = viewingUserId === userInfo._id;

    const [profileUser, setProfileUser] = useState(null); 
    const [userTweets, setUserTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await client.get('/tweets');
            
            const tweets = res.data.filter(t => (t.userId._id || t.userId) === viewingUserId);
            setUserTweets(tweets);

            if (isOwnProfile) {
                setProfileUser(userInfo);
            } else {
                try {
                    const userRes = await client.get(`/auth/${viewingUserId}`);
                    setProfileUser(userRes.data);
                } catch (userError) {
                    console.error("Failed to fetch user details:", userError);
                    
                    if (tweets.length > 0) {
                        setProfileUser({
                            username: tweets[0].userId.username,
                            email: tweets[0].userId.email,
                            bio: route.params?.user?.bio || "Birdie User",
                            followers: tweets[0].userId.followers || [],
                            following: tweets[0].userId.following || []
                        });
                    } else {
                        setProfileUser(route.params?.user || { username: 'Unknown', bio: '' });
                    }
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [viewingUserId])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const isFollowing = (userInfo?.following || []).includes(viewingUserId);

    const handleFollow = async () => {
        try {
            const res = await client.post(`/auth/follow/${viewingUserId}`);
            updateUser({ following: res.data.following });
        } catch (error) {
            console.error(error);
        }
    };

    const renderHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.headerTopRow}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarTextLarge}>
                        {profileUser?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                
                {isOwnProfile && (
                    <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <Text style={styles.username}>@{profileUser?.username}</Text>
            {isOwnProfile && <Text style={styles.email}>{profileUser?.email}</Text>}
            
            <Text style={styles.bio}>
                {profileUser?.bio || (isOwnProfile ? "hey, i am a birdie user" : "Birdie User")}
            </Text>

            {!isOwnProfile && (
                <TouchableOpacity 
                    style={[styles.followButton, isFollowing && styles.followingButton]} 
                    onPress={handleFollow}
                >
                    <Text style={[styles.followText, isFollowing && styles.followingText]}>
                        {isFollowing ? "Following" : "Follow"}
                    </Text>
                </TouchableOpacity>
            )}

            <View style={styles.statsRow}>
                <Text style={styles.statText}>
                    <Text style={styles.bold}>{profileUser?.following?.length || 0}</Text> Following
                </Text>
                <Text style={styles.statText}>
                    <Text style={styles.bold}>{profileUser?.followers?.length || 0}</Text> Followers
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={userTweets}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => <TweetCard item={item} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No tweets yet.</Text>}
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
    profileHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    avatarLarge: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface,
        justifyContent: 'center', alignItems: 'center', marginBottom: 15,
        borderWidth: 2, borderColor: COLORS.background,
    },
    avatarTextLarge: { fontSize: 35, color: COLORS.text, fontWeight: 'bold' },
    editButton: {
        borderWidth: 1, borderColor: COLORS.secondaryText,
        borderRadius: 20, paddingVertical: 5, paddingHorizontal: 15,
    },
    editButtonText: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
    username: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
    email: { color: COLORS.secondaryText, fontSize: 15, marginBottom: 10 },
    bio: { color: COLORS.text, fontSize: 15, marginBottom: 10, lineHeight: 20 },
    emptyText: { textAlign: 'center', marginTop: 20, color: COLORS.secondaryText },
    statsRow: { flexDirection: 'row', marginTop: 15 },
    statText: { color: COLORS.secondaryText, marginRight: 20, fontSize: 15 },
    bold: { color: COLORS.text, fontWeight: 'bold' },
    followButton: {
        backgroundColor: COLORS.text,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 20,
        alignSelf: 'flex-end'
    },
    followingButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    followText: { color: COLORS.background, fontWeight: 'bold' },
    followingText: { color: COLORS.text }
});

export default ProfileScreen;