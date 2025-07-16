import React, {useState, useRef, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import {Feather} from '@expo/vector-icons';
import AddWorkOrderForm from './AddWorkOrderForm';
import styles from '../styles/WorkOrdersView.styles';
import {router} from 'expo-router';
import {Swipeable} from 'react-native-gesture-handler';
import {Alert} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';



const {width} = Dimensions.get('window');

export default function WorkOrdersView() {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const drawerAnim = useRef(new Animated.Value(width)).current;
    const [formVisible, setFormVisible] = useState(false);
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const profiles = {
        vidy: {name: 'Vidy', image: require('../assets/images/vidy.png')},
        subas: {name: 'Subas', image: require('../assets/images/subas.png')},
    };

    const params = useLocalSearchParams();
    const technicianParam = Array.isArray(params.technician)
        ? params.technician[0]
        : params.technician;

    const initialTechnician =
        technicianParam?.toLowerCase() === 'subas' ? 'subas' : 'vidy';

    const [activeProfile, setActiveProfile] = useState<'vidy' | 'subas'>(initialTechnician as 'vidy' | 'subas');

    const user = profiles[activeProfile];

    const toggleProfile = () => setActiveProfile(prev => (prev === 'vidy' ? 'subas' : 'vidy'));

    const openDrawer = () => {
        setDrawerVisible(true);
        Animated.timing(drawerAnim, {toValue: width * 0.3, duration: 300, useNativeDriver: false}).start();
    };

    const closeDrawer = () => {
        Animated.timing(drawerAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: false
        }).start(() => setDrawerVisible(false));
    };

    useFocusEffect(
        React.useCallback(() => {
            const fetchAllWeeks = async () => {
                try {
                    const res = await fetch('http://10.0.0.63:8000/workorders/');
                    if (!res.ok) {
                        throw new Error('Failed to fetch work orders list');
                    }
                    const json = await res.json();
                    const folders = json.workorders.filter((folder: string) => /^\d{8}_\d+$/.test(folder));

                    const details = await Promise.all(folders.map(async (folder: string) => {
                        const res = await fetch(`http://10.0.0.63:8000/workorder/${folder}`);
                        const data = res.ok ? await res.json() : null;
                        if (data) {
                            data.folder_name = folder;
                        }
                        return data;
                    }));

                    const filtered = details.filter(Boolean).filter((order: any) => order.technician === user.name);

                    // Group by updated week value
                    const grouped: { [key: string]: any[] } = {};
                    filtered.forEach((order: any) => {
                        const week = order.week || order.weekNumber || 'Unknown Week';
                        if (!grouped[week]) grouped[week] = [];
                        grouped[week].push(order);
                    });

                    const sorted = Object.entries(grouped)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a))
                        .map(([weekNumber, workOrders]) => ({
                            weekNumber,
                            workOrders
                        }));

                    setWorkOrders(sorted);
                } catch (err) {
                    console.error('Error fetching work orders:', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchAllWeeks();

            return () => {};
        }, [formVisible, user.name])
    );


    const calculateTotalCost = (parts: any[]) => {
        const total = parts.reduce((sum, part) => {
            const unitPrice = parseFloat(part.unit_price || '0');
            const quantity = parseFloat(part.quantity || '1');
            return sum + unitPrice * quantity;
        }, 0);
        return (total * 1.13).toFixed(2);
    };

    const filteredOrders = workOrders
        .filter(order => order.technician === user.name)
        .sort((a, b) => {
            const weekA = parseInt(a.weekNumber || '0');
            const weekB = parseInt(b.weekNumber || '0');
            return weekB - weekA; // descending order
        });

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {/* header and profile */}
                <View style={styles.header}>
                    <View style={styles.logoRow}>
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>All Star Electrical Services</Text>
                    </View>
                    <View style={styles.profileRow}>
                        <TouchableOpacity onPress={toggleProfile}>
                            <Image key={user.name} source={user.image} style={styles.profilePic} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openDrawer}>
                            <Feather name="menu" size={20} color="#6b7280" style={styles.menuIcon} />
                        </TouchableOpacity>
                    </View>
                </View>



                <View style={styles.todayRow}>
                    <View>
                        <Text style={styles.greeting}>Hello, {user.name}!</Text>
                        <Text style={styles.subtext}>Here are your work orders</Text>
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={() => setFormVisible(true)}>
                        <Text style={styles.addText}>+ ADD</Text>
                    </TouchableOpacity>
                </View>

                {workOrders.map((weekData) => (
                    <View key={weekData.weekNumber}>
                        <Text style={styles.todayLabel}>Week {weekData.weekNumber}</Text>
                        {weekData.workOrders.length > 0 ? (
                            weekData.workOrders
                                .sort((a: any, b: any) => {
                                    const dateA = new Date(a.date).getTime();
                                    const dateB = new Date(b.date).getTime();
                                    return dateB - dateA; // newest first
                                })
                                .map((order: any) => {
                                    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
                                        const scale = progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.7, 1],
                                            extrapolate: 'clamp',
                                        });
                                        const opacity = progress.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [0, 0.5, 1],
                                            extrapolate: 'clamp',
                                        });

                                        return (
                                            <Animated.View style={{ transform: [{ scale }], opacity, justifyContent: 'center' }}>
                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: '#e63946',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        width: 80,
                                                        height: '90%',
                                                        borderRadius: 12,
                                                        marginVertical: 6,
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.3,
                                                        shadowRadius: 3,
                                                        elevation: 4,
                                                    }}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            "Delete Work Order",
                                                            "Are you sure you want to delete this work order?",
                                                            [
                                                                { text: "Cancel", style: "cancel" },
                                                                {
                                                                    text: "Delete",
                                                                    style: "destructive",
                                                                    onPress: async () => {
                                                                        try {
                                                                            const res = await fetch(`http://10.0.0.63:8000/workorder/${order.folder_name}`, {
                                                                                method: 'DELETE',
                                                                            });
                                                                            if (res.ok) {
                                                                                console.log("Deleted work order:", order.folder_name);
                                                                                setWorkOrders(prev =>
                                                                                    prev.map(w => ({
                                                                                        ...w,
                                                                                        workOrders: w.workOrders.filter((wo: any) => wo.folder_name !== order.folder_name)
                                                                                    }))
                                                                                );
                                                                            } else {
                                                                                console.error("Failed to delete work order:", await res.text());
                                                                                Alert.alert("Error", "Failed to delete work order from server.");
                                                                            }
                                                                        } catch (err) {
                                                                            console.error("Error deleting work order:", err);
                                                                            Alert.alert("Error", "Could not connect to server to delete work order.");
                                                                        }
                                                                    },
                                                                },
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Feather name="trash-2" size={24} color="white" />
                                                    <Text style={{ color: 'white', fontWeight: '600', marginTop: 4 }}>Delete</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        );
                                    };

                                    return (
                                        <Swipeable
                                            key={order.folder_name}
                                            renderRightActions={(progress, dragX) => renderRightActions(progress)}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    router.push({
                                                        pathname: '/ViewWorkOrder',
                                                        params: {
                                                            workOrderData: JSON.stringify(order),
                                                            folderName: order.folder_name,
                                                        },
                                                    });
                                                }}
                                            >
                                                <View style={styles.workOrderCard}>
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.workOrderTitle}>
                                                                WO #{order.workOrderNumber}
                                                            </Text>
                                                            <Text style={styles.workOrderDate}>📅 {order.date}</Text>
                                                            <Text>👤 {order.customer}</Text>
                                                            <Text>📍 {order.siteAddress}</Text>
                                                            <Text>💲 Total: ${calculateTotalCost(order.parts)}</Text>
                                                        </View>

                                                        <TouchableOpacity
                                                            style={{
                                                                backgroundColor: '#f0f0f0',
                                                                borderRadius: 24,
                                                                width: 48,
                                                                height: 48,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                marginLeft: 10,
                                                                shadowColor: '#000',
                                                                shadowOffset: { width: 0, height: 1 },
                                                                shadowOpacity: 0.1,
                                                                shadowRadius: 2,
                                                                elevation: 2,
                                                            }}
                                                            onPress={() => {
                                                                router.push({
                                                                    pathname: '/add-image',
                                                                    params: { folderName: order.folder_name },
                                                                });
                                                            }}
                                                        >
                                                            <Feather name="image" size={20} color="#555" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </Swipeable>
                                    );
                                })
                        ) : (
                            <Text style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic', marginVertical: 10 }}>
                                No work orders this week
                            </Text>
                        )}
                    </View>
                ))}
            </ScrollView>

            {formVisible && (
                <View style={styles.formOverlay}>
                    <AddWorkOrderForm
                        visible={formVisible}
                        onClose={() => setFormVisible(false)}
                        technicianName={user.name}
                    />
                </View>
            )}

            {drawerVisible && (
                <TouchableWithoutFeedback onPress={closeDrawer}>
                    <View style={styles.drawerOverlay}>
                        <Animated.View style={[styles.drawer, { right: drawerAnim }]}>
                            <View style={styles.drawerHeader}>
                                <Image source={user.image} style={styles.drawerProfilePic} />
                                <Text style={styles.drawerUsername}>{user.name}</Text>
                            </View>
                            {['Account', 'Work Orders', 'Parts List', 'Travel Chart'].map((label, idx) => (
                                <View key={idx} style={styles.drawerItem}>
                                    <Text style={styles.drawerItemText}>{label}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
}
