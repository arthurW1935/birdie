import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let token = await AsyncStorage.getItem('token');
            let user = await AsyncStorage.getItem('userInfo');

            if (token) {
                // 1. Set what we have locally first (Optimistic)
                setUserToken(token);
                setUserInfo(JSON.parse(user));

                // 2. TEST the token against the server
                // We manually set the header here because the client might not have picked it up yet
                try {
                    const res = await client.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // 3. If successful, update with FRESH data from DB
                    setUserInfo(res.data);
                    AsyncStorage.setItem('userInfo', JSON.stringify(res.data));

                } catch (apiError) {
                    // 4. CRITICAL: If server rejects token (401/404), Log Out!
                    console.log("Token invalid or User missing. Logging out...");
                    logout(); 
                }
            }
            setIsLoading(false);
        } catch (e) {
            console.log(`Log in error ${e}`);
            logout();
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    // ... login, signup, logout functions remain the same ...
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const res = await client.post('/auth/login', { email, password });
            const { token, ...userData } = res.data;
            setUserToken(token);
            setUserInfo(userData);
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
        } catch (e) {
            throw new Error(e.response?.data?.message || 'Login Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (username, email, password) => {
        setIsLoading(true);
        try {
            const res = await client.post('/auth/signup', { username, email, password });
            const { token, ...userData } = res.data;
            setUserToken(token);
            setUserInfo(userData);
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
        } catch (e) {
            throw new Error(e.response?.data?.message || 'Signup Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userInfo');
        setIsLoading(false);
    };

    // --- NEW FUNCTION: Update User State Manually ---
    const updateUser = async (updatedData) => {
        // Merge old data with new updates (e.g. keep email, update bio)
        const newUserInfo = { ...userInfo, ...updatedData };
        
        setUserInfo(newUserInfo); // Update State (Immediate UI change)
        await AsyncStorage.setItem('userInfo', JSON.stringify(newUserInfo)); // Update Storage
    };

    return (
        <AuthContext.Provider value={{ 
            login, 
            signup, 
            logout, 
            updateUser, // <--- Export this
            isLoading, 
            userToken, 
            userInfo 
        }}>
            {children}
        </AuthContext.Provider>
    );
};