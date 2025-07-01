import { Tabs } from 'expo-router';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,       // ❌ hide top bar on all pages
                tabBarStyle: { display: 'none' }, // ❌ hide bottom tab bar on all pages
            }}
        />
    );
}
