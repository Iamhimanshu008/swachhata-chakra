import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../config';

export default function SHGNavigator() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>SHG Dashboard Placeholder</Text>
            <Text style={styles.subtext}>V3 Payroll/Hub coming soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    subtext: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 8,
    }
});
