import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    withTiming,
    withDelay,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';

export default function HomeScreen() {
    const router = useRouter();

    const translateY = useSharedValue(0);
    const scale = useSharedValue(1.5);
    const logoOpacity = useSharedValue(1);
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            1000,
            withTiming(-120, { duration: 800, easing: Easing.out(Easing.exp) })
        );
        scale.value = withDelay(1000, withTiming(1, { duration: 800 }));
        contentOpacity.value = withDelay(1200, withTiming(1, { duration: 800 }));
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: logoOpacity.value,
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const handleSelect = (technician: string) => {
        router.push({ pathname: '/(tabs)/workorders', params: { technician } });
    };

    return (
        <View style={styles.container}>
            {/* Animated Logo */}
            <Animated.View style={[styles.logoWrapper, logoStyle]}>
                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                <Text style={styles.companyName}>All Star Electrical{'\n'}Contracting Inc</Text>
            </Animated.View>

            {/* Animated User Options */}
            <Animated.View style={[styles.users, contentStyle]}>
                {[
                    { name: 'Vidy', img: require('../../assets/images/vidy.png') },
                    { name: 'Subas', img: require('../../assets/images/subas.png') },
                ].map((user) => (
                    <TouchableOpacity
                        key={user.name}
                        onPress={() => handleSelect(user.name)}
                        style={styles.userCard}
                        activeOpacity={0.8}
                    >
                        <Image source={user.img} style={styles.profilePic} />
                        <Text style={styles.userName}>{user.name}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        zIndex: 1,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 10,
        resizeMode: 'contain',
    },
    companyName: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: '#002e7a',
    },
    users: {
        flexDirection: 'row',
        gap: 40,
        marginTop: -60,
    },
    userCard: {
        alignItems: 'center',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 25,
        marginBottom: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#002e7a',
    },
});
