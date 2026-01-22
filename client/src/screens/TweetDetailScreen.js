import React, { useEffect, useState, useContext } from 'react';
import { 
    View, Text, FlatList, TextInput, TouchableOpacity, 
    StyleSheet, ActivityIndicator, Platform, Alert, RefreshControl // <--- Import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import TweetCard from '../components/TweetCard';
import { COLORS } from '../constants';
import { AuthContext } from '../context/AuthContext';

const TweetDetailScreen = ({ route, navigation }) => {
    const { tweet } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // <--- State
    const [submitting, setSubmitting] = useState(false);

    const isTweetOwner = (tweet.userId._id || tweet.userId) === userInfo?._id;

    const fetchComments = async () => {
        try {
            const res = await client.get(`/tweets/${tweet._id}/comments`);
            setComments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false); // <--- Stop
        }
    };

    useEffect(() => {
        fetchComments();
    }, [tweet._id]);

    // <--- Handler
    const onRefresh = () => {
        setRefreshing(true);
        fetchComments();
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const res = await client.post(`/tweets/${tweet._id}/comments`, {
                content: newComment
            });
            setComments([res.data, ...comments]);
            setNewComment('');
        } catch (error) {
            Alert.alert('Error', 'Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTweet = () => {
        Alert.alert("Delete Tweet", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/tweets/${tweet._id}`);
                        navigation.goBack(); 
                    } catch (err) {
                        Alert.alert("Error", "Could not delete tweet");
                    }
                }
            }
        ]);
    };

    const handleDeleteComment = (commentId) => {
        Alert.alert("Delete Reply", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/tweets/comments/${commentId}`);
                        setComments(prev => prev.filter(c => c._id !== commentId));
                    } catch (err) {
                        Alert.alert("Error", "Could not delete comment");
                    }
                }
            }
        ]);
    };

    const renderComment = ({ item }) => {
        const isCommentOwner = (item.userId._id || item.userId) === userInfo?._id;

        return (
            <View style={styles.commentCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.userId?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <View style={{flex: 1}}>
                    <View style={styles.header}>
                        <Text style={styles.username}>@{item.userId?.username}</Text>
                        <Text style={styles.date}> · {new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.content}>{item.content}</Text>
                </View>

                {isCommentOwner && (
                    <TouchableOpacity 
                        style={styles.deleteIcon} 
                        onPress={() => handleDeleteComment(item._id)}
                    >
                        <Ionicons name="trash-outline" size={18} color={COLORS.secondaryText} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const Container = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const containerProps = Platform.OS === 'ios' 
        ? { behavior: "padding", style: styles.container, keyboardVerticalOffset: 90 } 
        : { style: styles.container };

    return (
        <Container {...containerProps}>
            <FlatList
                data={comments}
                keyExtractor={(item) => item._id}
                renderItem={renderComment}
                ListHeaderComponent={() => (
                    <View style={styles.mainTweetContainer}>
                        <View>
                            <TweetCard item={tweet} />
                            {isTweetOwner && (
                                <TouchableOpacity 
                                    style={styles.floatingDelete} 
                                    onPress={handleDeleteTweet}
                                >
                                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Replies</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                // <--- Attach Refresh Control
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Post your reply"
                    placeholderTextColor={COLORS.secondaryText}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity 
                    onPress={handlePostComment} 
                    disabled={!newComment.trim() || submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={COLORS.primary} size="small" />
                    ) : (
                        <Text style={[
                            styles.postText, 
                            !newComment.trim() && { color: COLORS.secondaryText }
                        ]}>Reply</Text>
                    )}
                </TouchableOpacity>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    mainTweetContainer: { marginBottom: 10 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
    sectionTitle: { color: COLORS.secondaryText, fontSize: 14, marginLeft: 16, marginBottom: 10, fontWeight: 'bold' },
    commentCard: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, position: 'relative' },
    avatar: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: COLORS.text, fontWeight: 'bold' },
    header: { flexDirection: 'row', marginBottom: 4 },
    username: { color: COLORS.text, fontWeight: 'bold', marginRight: 5 },
    date: { color: COLORS.secondaryText, fontSize: 12 },
    content: { color: COLORS.text, lineHeight: 20 },
    deleteIcon: { position: 'absolute', top: 15, right: 15, padding: 5 },
    floatingDelete: { position: 'absolute', top: 15, right: 15, backgroundColor: COLORS.surface, padding: 8, borderRadius: 20, zIndex: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background, marginBottom: 50 },
    input: { flex: 1, color: COLORS.text, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, minHeight: 40, maxHeight: 100 },
    postText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }
});

export default TweetDetailScreen;