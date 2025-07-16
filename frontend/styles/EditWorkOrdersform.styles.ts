import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({

    container: {
        padding: 20,
        backgroundColor: '#fff',
    },

    heading: {
        paddingTop: 40,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20
    },

    label: {
        marginTop: 10,
        fontWeight: '600'
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        marginTop: 5,
    },

    section: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
        flexWrap: 'wrap', // ✅ Allow Out Time to wrap if needed
    },

    half: {
        width: '48%',
    },

    partWrapper: { marginBottom: 16 },

    partHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },

    partIndex: { width: 20 },

    partInputWrapper: { flex: 1 },

    partInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        width: '100%',
    },

    dropdown: {
        backgroundColor: '#f2f2f2',
        borderColor: '#aaa',
        borderWidth: 1,
        borderRadius: 8,
        position: 'absolute',
        top: 42,
        width: '100%',
        zIndex: 10,
    },

    suggestionItem: {
        padding: 10,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
    },

    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginLeft: 20,
    },

    costWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dollarSign: {
        fontSize: 16,
        marginRight: 3
    },

    priceInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 6,
        borderRadius: 8,
        width: 65,
        backgroundColor: '#f9f9f9',
    },

    quantityInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 6,
        borderRadius: 8,
        width: 50,
        backgroundColor: '#f9f9f9',
    },

    removeBtn: {
        fontSize: 24,
        color: 'red'
    },

    addBtn: {
        color: '#007aff',
        fontWeight: '600',
        marginTop: 5,
        fontSize: 16,
        marginLeft: 24,
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 24,
        paddingHorizontal: 4,
    },

    cancelBtn: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },

    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },

    submitBtn: {
        flex: 1,
        backgroundColor: '#007aff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#007aff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },

    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },

    multiLineInput: {
        backgroundColor: '#f9f9f9',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        textAlignVertical: 'top', // start typing from top
        width: '100%',
    },

    quantityTitle: { },

    timeInputWrapper: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d1d5db', // tailwind gray-300
        backgroundColor: '#f9fafb', // tailwind gray-50
        justifyContent: 'center',
    },

    timeInputText: {
        fontSize: 16,
        color: '#111827', // tailwind gray-900
    },


});

export default styles;
