import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const InputField = ({ placeholder, value, onChangeText, secureTextEntry, autoCapitalize }) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.text}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize || 'none'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderRadius: 30,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        backgroundColor: COLORS.surface,
    },
    input: {
        fontSize: 16,
        color: COLORS.text,
        paddingVertical: 10,
    },
});

export default InputField;