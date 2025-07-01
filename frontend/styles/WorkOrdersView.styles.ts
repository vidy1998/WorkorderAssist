import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({  container: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 80,
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
        color: '#2b5ce1',
        paddingBottom: 10,
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
    formOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: height,
        width: width,
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingHorizontal: 16,
        zIndex: 1000,
    },
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-end',
        zIndex: 999,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: width * 0.7,
        backgroundColor: '#fff',
        padding: 16,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    drawerHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    drawerProfilePic: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 8,
    },
    drawerUsername: {
        fontSize: 16,
        fontWeight: '600',
    },
    drawerItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    drawerItemText: {
        fontSize: 15,
    },

    workOrderCard: {
        backgroundColor: '#f0f4f8',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    workOrderTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    workOrderDate: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 6,
    },

});

export default styles;

