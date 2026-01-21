import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import TweetCard from '../components/TweetCard';
import { COLORS } from '../constants';
import { AuthContext } from '../context/AuthContext';

const FeedScreen = ({ navigation }) => {
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { logout } = useContext(AuthContext);

    const fetchTweets = async () => {
        try {
            const res = await client.get('/tweets');
            setTweets(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTweets();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTweets();
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Birdie</Text>
            </View>

            <FlatList
                data={tweets}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <TweetCard item={item} />}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => navigation.navigate('CreateTweet')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginTop: 30,
        backgroundColor: COLORS.background, 
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
    },
    fabIcon: {
        color: 'white',
        fontSize: 30,
        marginTop: -4,
    }
});

export default FeedScreen;