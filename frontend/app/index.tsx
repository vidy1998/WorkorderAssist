import React, { useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const { height } = Dimensions.get('window');



export default function HomeScreen() {
    const router = useRouter();

    const logoScale = useSharedValue(1.5);
    const logoTranslateY = useSharedValue(0);
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
        setTimeout(() => {
            logoScale.value = withTiming(1, { duration: 600 });
            logoTranslateY.value = withTiming(-height * 0.25, { duration: 600 });
            contentOpacity.value = withTiming(1, { duration: 1500 });
        }, 1500);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value },
            { translateY: logoTranslateY.value },
        ],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const handleSelect = (technician: string) => {
        router.push({ pathname: '/workorders', params: { technician } });

    };

    const users = [
        { name: 'Vidy', img: require('../assets/images/vidy.png') },
        { name: 'Subas', img: require('../assets/images/subas.png') },
    ];

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Animated Logo */}
                <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Content below logo */}
                <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
                    <Text style={styles.companyName}>
                        All Star Electrical{'\n'}Contracting Inc
                    </Text>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Select a Profile</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Profiles */}
                    <View style={styles.profileRow}>
                        {users.map((user, index) => (
                            <TouchableOpacity
                                key={user.name}
                                onPress={() => handleSelect(user.name)}
                                activeOpacity={0.9}
                                style={[
                                    styles.profileCard,
                                    index === 0 && { marginRight: 32 },
                                ]}
                            >
                                <Image source={user.img} style={styles.profileImage} />
                                <Text style={styles.profileName}>{user.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    logoWrapper: {
        position: 'absolute',
        alignItems: 'center',
    },
    logo: {
        width: 112,
        height: 112,
    },
    contentContainer: {
        position: 'absolute',
        top: 280, // moved up to sit right below the logo
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 50,
    },
    companyName: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        color: '#002e7a',
        lineHeight: 28,
        marginBottom: 35,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#d1d5db',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 12,
        color: '#6b7280',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    profileCard: {
        alignItems: 'center',
    },
    profileImage: {
        width: 96,
        height: 96,
        borderRadius: 16,
        shadowColor: '#d01f1f',
        shadowOpacity: 5,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    profileName: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '500',
        color: '#002e7a',
    },
});
