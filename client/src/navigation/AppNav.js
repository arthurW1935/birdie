import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native'; // Removed Text/Button imports
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'; // Import DefaultTheme
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { COLORS } from '../constants'; // Import COLORS

const AppNav = () => {
    const { isLoading, userToken } = useContext(AuthContext);

    // 1. Create a Dark Theme for Navigation Container 
    // (This ensures background is black even during screen transitions)
    const MyDarkTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: COLORS.background,
        },
    };

    // 2. Fix the Loading Screen Background
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={MyDarkTheme}>
            {userToken !== null ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNav;