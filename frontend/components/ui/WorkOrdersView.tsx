import React from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const profileImages: Record<string, any> = {
    Vidy: require('../../assets/images/vidy.png'),
    Subas: require('../../assets/images/subas.png'),
};

const backgroundImage = require('../../assets/images/background.jpg'); // Optional: add a dreamy background image

const workOrders = [
    { id: 'WO-001', description: 'Install lighting at Site A', coins: 30 },
    { id: 'WO-002', description: 'Repair outlet at Site B', coins: 20 },
    { id: 'WO-003', description: 'Panel inspection at Site C', coins: 40 },
];

const { width } = Dimensions.get('window');

export default function WorkOrdersView() {
    const params = useLocalSearchParams();
    const technician = Array.isArray(params.technician)
        ? params.technician[0]
        : params.technician;

    return (
        <View style={styles.container}>
            {/* Header Card */}
            <View style={styles.headerCard}>
                <Image
                    source={profileImages[technician]}
                    style={styles.headerProfile}
                />
                <Text style={styles.headerTitle}>{technician}'s Dashboard</Text>
                <Text style={styles.headerSubtext}>Work Orders Overview</Text>
            </View>

            {/* Work Orders */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today</Text>
            </View>
            <FlatList
                data={workOrders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View style={styles.workCard}>
                        <View style={styles.workCardLeft}>
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={28}
                                color="#ccc"
                                style={{ marginRight: 10 }}
                            />
                            <Text style={styles.workText}>{item.description}</Text>
                        </View>
                        <View style={styles.coinBadge}>
                            <Text style={styles.coinText}>{item.coins} pts</Text>
                        </View>
                    </View>
                )}
            />

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef3f9',
    },
    headerCard: {
        backgroundColor: '#cce5d3',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },
    headerProfile: {
        width: 80,
        height: 80,
        borderRadius: 20,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#003366',
    },
    headerSubtext: {
        fontSize: 14,
        color: '#446688',
        marginTop: 4,
    },
    sectionHeader: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2a2d34',
    },
    workCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    workCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    workText: {
        fontSize: 16,
        color: '#333',
        flexShrink: 1,
    },
    coinBadge: {
        backgroundColor: '#ffd700',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'center',
    },
    coinText: {
        fontWeight: '600',
        color: '#333',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#339966',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
});
