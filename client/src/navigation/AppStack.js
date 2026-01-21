import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import CreateTweetScreen from '../screens/CreateTweetScreen';
import TweetDetailScreen from '../screens/TweetDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen'; 
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator();

const AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={AppTabs} />

            <Stack.Screen 
                name="UserProfile" 
                component={ProfileScreen} 
                options={{
                    headerShown: true,
                    headerTitle: 'Profile',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.text,
                    headerShadowVisible: false,
                }}
            />

            <Stack.Screen name="CreateTweet" component={CreateTweetScreen} />
            
            <Stack.Screen 
                name="TweetDetail" 
                component={TweetDetailScreen} 
                options={{
                    headerShown: true,
                    headerTitle: 'Thread',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.text,
                    headerShadowVisible: false,
                }}
            />
            
            <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen} 
                options={{
                    headerShown: true,
                    headerTitle: 'Edit Profile',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.text,
                    headerShadowVisible: false,
                }}
            />
        </Stack.Navigator>
    );
};

export default AppStack;