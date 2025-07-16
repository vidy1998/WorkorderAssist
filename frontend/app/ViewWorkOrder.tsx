import React from 'react';
import { SafeAreaView } from 'react-native';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import EditWorkOrder from './EditWorkOrder';

export default function ViewWorkOrder() {
    const params = useLocalSearchParams();
    const folderName = params.folderName;

    const [workOrder, setWorkOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);



    const fetchWorkOrder = useCallback(async () => {
        if (!folderName) {
            console.log("No folderName provided");
            return;
        }
        try {
            setLoading(true);
            console.log(`Fetching from: http://10.0.0.63:8000/workorder/${folderName}`);
            const res = await fetch(`http://10.0.0.63:8000/workorder/${folderName}`);


            if (!res.ok) {
                console.log("Server returned an error:", res.status);
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();
            console.log("Fetched work order data:", data);
            setWorkOrder(data);
        } catch (err) {
            console.error('Failed to fetch work order:', err);
        } finally {
            setLoading(false);
        }
    }, [folderName]);


    useFocusEffect(
        useCallback(() => {
            fetchWorkOrder();
        }, [fetchWorkOrder])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }


    if (!workOrder) {
        return (
            <View style={styles.container}>
                <Text>No work order data found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.button}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
            </View>
        );
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        console.log("Navigating to EditWorkOrder with folderName:", folderName);
                        router.push({
                            pathname: '/EditWorkOrder',
                            params: {
                                folderName: folderName,
                                workOrderNumber: workOrder.workOrderNumber,
                            },
                        });
                    }}
                >
                    <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={80}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.heading}>Work Order #{workOrder.workOrderNumber}</Text>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Technician</Text>
                        <Text style={styles.value}>{workOrder.technician}</Text>

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>Date</Text>
                                <Text style={styles.value}>{workOrder.date}</Text>
                            </View>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>Week</Text>
                                <Text style={styles.value}>{workOrder.week || ''}</Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>WO #</Text>
                                <Text style={styles.value}>{workOrder.workOrderNumber}</Text>
                            </View>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>PO #</Text>
                                <Text style={styles.value}>{workOrder.purchaseOrderNumber}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Customer</Text>
                        <Text style={styles.value}>{workOrder.customer}</Text>

                        <Text style={styles.sectionTitle}>Site Address</Text>
                        <Text style={styles.value}>{workOrder.siteAddress}</Text>

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>Travel Location</Text>
                                <Text style={styles.value}>{workOrder.travelLocation}</Text>
                            </View>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>Travel Hours</Text>
                                <Text style={styles.value}>{workOrder.travelHours}</Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>Site Contact</Text>
                                <Text style={styles.value}>{workOrder.siteContact}</Text>
                            </View>
                            <View style={styles.half}>
                                <Text style={styles.sectionTitle}>Phone Number</Text>
                                <Text style={styles.value}>{workOrder.phoneNumber}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Job Description</Text>
                        <Text style={styles.value}>{workOrder.jobDescription}</Text>

                        <Text style={styles.sectionTitle}>Work Performed</Text>
                        <Text style={styles.value}>{workOrder.workPerformed}</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Parts Used</Text>

                        {workOrder.parts && workOrder.parts.length > 0 ? (
                            <>
                                {workOrder.parts.map((part: any, index: number) => (
                                    <View key={index} style={{ marginBottom: 8 }}>
                                        <Text style={styles.value}>{part.name}</Text>
                                        <Text style={styles.value}>
                                            Qty: {part.quantity} | Unit Price: ${parseFloat(part.unit_price || '0').toFixed(2)} | Total: ${part.total_price}
                                        </Text>
                                    </View>
                                ))}

                                <View style={{ borderTopWidth: 1, borderTopColor: '#ccc', marginTop: 10, paddingTop: 10 }}>
                                    <Text style={[styles.value, { fontWeight: 'bold' }]}>
                                        Total Before Tax: ${workOrder.totalBeforeTax || '0.00'}
                                    </Text>
                                    <Text style={[styles.value, { fontWeight: 'bold' }]}>
                                        Tax Amount: ${workOrder.taxAmount || '0.00'}
                                    </Text>
                                    <Text style={[styles.value, { fontWeight: 'bold' }]}>
                                        Total After Tax: ${workOrder.totalAfterTax || '0.00'}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.value}>No parts listed.</Text>
                        )}
                    </View>




                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Job Status</Text>
                        <Text style={styles.value}>{workOrder.jobStatus}</Text>

                        <Text style={styles.sectionTitle}>Orientation</Text>
                        <Text style={styles.value}>{workOrder.orientation}</Text>

                        <Text style={styles.sectionTitle}>Hot Work Permit</Text>
                        <Text style={styles.value}>{workOrder.hotWorkPermit}</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#ffffff',
        flexGrow: 1,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        paddingBottom: 20,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1, // increased opacity for stronger shadow
        shadowOffset: { width: 0, height: 2 }, // deeper shadow
        shadowRadius: 6,
        elevation: 4, // increased elevation for Android shadow
    },
    sectionTitle: {
        fontWeight: '600',
        marginTop: 10,
    },
    value: {
        marginTop: 4,
        marginBottom: 8,
        fontSize: 15,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    half: {
        flex: 1,
    },
    button: {
        backgroundColor: '#007aff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',

    },
    backText: {
        color: '#007aff',

        marginRight: 12,
        fontSize: 16,
    },
    editText: {
        color: '#007aff',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // optional: matches page background
    },

});
