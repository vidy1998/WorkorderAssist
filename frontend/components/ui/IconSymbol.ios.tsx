import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function WorkOrdersView() {
    const profiles = {
        vidy: {
            name: 'vidy',
            image: require('../../assets/images/vidy.png'),
            orders: ['Work Order 1', 'Work Order 2'],
        },
        subas: {
            name: 'subas',
            image: require('../../assets/images/subas.png'),
            orders: ['Subas Order 1', 'Subas Order 2'],
        },
    };

    const [activeProfile, setActiveProfile] = useState<'vidy' | 'subas'>('vidy');
    const user = profiles[activeProfile];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Logo + Name */}
                <View style={styles.logoRow}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>All Star Electrical Services</Text>
                </View>

                {/* Profile + Menu */}
                <View style={styles.profileRow}>
                    <TouchableOpacity onPress={() => {
                        setActiveProfile(prev => (prev === 'vidy' ? 'subas' : 'vidy'));
                    }}>
                        <Image
                            source={user.image}
                            style={styles.profilePic}
                        />
                    </TouchableOpacity>
                    <Feather name="menu" size={20} color="#6b7280" style={styles.menuIcon} />
                </View>
            </View>

            {/* Greeting */}
            <Text style={styles.greeting}>Hello, {user.name}!</Text>
            <Text style={styles.subtext}>Here are your work orders</Text>

            {/* Today + Add */}
            <View style={styles.todayRow}>
                <Text style={styles.todayLabel}>Today</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addText}>+ ADD</Text>
                </TouchableOpacity>
            </View>

            {/* Work Orders */}
            {user.orders.map((order, index) => (
                <TouchableOpacity key={index} style={styles.workCard}>
                    <Text style={styles.workText}>{order}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 32,
        height: 32,
        marginRight: 8,
    },
    appName: {
        fontSize: 14,
        fontWeight: '600',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    menuIcon: {
        paddingTop: 2,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtext: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    todayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    todayLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#dc2626',
    },
    addButton: {
        borderWidth: 1,
        borderColor: '#6b7280',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addText: {
        fontSize: 14,
        fontWeight: '600',
    },
    workCard: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    workText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
