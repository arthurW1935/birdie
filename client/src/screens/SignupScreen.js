import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import InputField from '../components/InputField';
import { COLORS } from '../constants';

const SignupScreen = ({ navigation }) => {
    const { signup, isLoading } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            await signup(username, email, password);
        } catch (e) {
            Alert.alert('Signup Failed', e.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join Birdie</Text>

            <InputField placeholder="Username" value={username} onChangeText={setUsername} />
            <InputField placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Log in</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: COLORS.text,
    },
    link: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default SignupScreen;