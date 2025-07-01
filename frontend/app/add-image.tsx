import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

const screenWidth = Dimensions.get('window').width;

type MediaItem = {
    uri: string;
    type: 'image' | 'video' | 'unknown';
    filename?: string; // store filename for delete
};

export default function AddImagesScreen() {
    const { folderName } = useLocalSearchParams();
    const [media, setMedia] = useState<MediaItem[]>([]);

    useEffect(() => {
        const fetchExistingMedia = async () => {
            try {
                const res = await fetch(`http://10.0.0.63:8000/list-Images?folder_name=${folderName}`);
                if (!res.ok) {
                    console.error('Failed to fetch existing media');
                    return;
                }
                const data = await res.json();
                console.log("Fetched existing media:", data);

                const existingMedia: MediaItem[] = data.media.map((path: string) => {
                    const fullUri = `http://10.0.0.63:8000${path}`;
                    const filename = path.split('/').pop(); // extract filename

                    const isImage = path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.JPG') || path.endsWith('.png');
                    const isVideo = path.endsWith('.mp4') || path.endsWith('.mov');

                    return {
                        uri: fullUri,
                        filename: filename,
                        type: isVideo ? 'video' : (isImage ? 'image' : 'unknown'),
                    };
                });

                setMedia(existingMedia);
            } catch (err) {
                console.error('Error fetching existing media:', err);
            }
        };

        fetchExistingMedia();
    }, [folderName]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const selected = result.assets.map((asset) => ({
                uri: asset.uri,
                type: asset.type as 'image' | 'video',
            }));
            setMedia((prev) => [...prev, ...selected]);
        }
    };

    const handleDelete = (filename: string) => {
        Alert.alert(
            "Delete Image",
            "Are you sure you want to delete this image?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const res = await fetch(`http://10.0.0.63:8000/delete-Image?folder_name=${folderName}&filename=${filename}`, {
                                method: 'DELETE',
                            });

                            if (!res.ok) {
                                const error = await res.text();
                                console.error('Delete failed:', error);
                                Alert.alert('Delete Failed', error);
                                return;
                            }

                            console.log("Deleted:", filename);
                            setMedia((prev) => prev.filter((item) => item.filename !== filename));
                        } catch (err) {
                            console.error('Error deleting image:', err);
                            Alert.alert('Error', 'Something went wrong deleting the image.');
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const handleSubmit = async () => {
        const newMedia = media.filter((item) => item.uri.startsWith('file://'));
        if (newMedia.length === 0) {
            Alert.alert('Please add at least one new image or video.');
            return;
        }

        console.log("Uploading to folder:", folderName);

        try {
            const formData = new FormData();
            formData.append('folder_name', String(folderName));

            newMedia.forEach((item, index) => {
                const uriParts = item.uri.split('.');
                const ext = uriParts[uriParts.length - 1];
                const originalName = item.uri.split('/').pop() || `media_${index}.${ext}`;
                const mimeType = item.type === 'image'
                    ? (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`)
                    : (ext === 'mp4' || ext === 'mov' ? `video/${ext}` : `video/${ext}`);

                formData.append('files', {
                    uri: item.uri,
                    name: originalName,
                    type: mimeType,
                } as any);
            });

            const res = await fetch('http://10.0.0.63:8000/upload-images/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (!res.ok) {
                const error = await res.text();
                console.error('Upload failed:', error);
                Alert.alert('Upload Failed', error);
                return;
            }

            console.log("Upload successful.");
            Alert.alert('Upload Complete', `Media uploaded to folder ${folderName}.`);
            router.back();
        } catch (err) {
            console.error('Error in handleSubmit:', err);
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upload Photos</Text>

            <Text style={styles.galleryLabel}>Gallery</Text>
            {media.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.galleryScroll}
                >
                    {media.map((item, index) => (
                        <View key={index} style={styles.mediaContainer}>
                            {item.type === 'image' ? (
                                <Image
                                    source={{ uri: item.uri }}
                                    style={styles.previewMedia}
                                    resizeMode="cover"
                                />
                            ) : item.type === 'video' ? (
                                <Video
                                    source={{ uri: item.uri }}
                                    style={styles.previewMedia}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    isLooping
                                />
                            ) : (
                                <Text>Unsupported</Text>
                            )}
                            {item.filename && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item.filename!)}
                                >
                                    <Ionicons name="trash" size={20} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <Text style={styles.emptyText}>No media found</Text>
            )}

            <TouchableOpacity onPress={handlePickImage} style={styles.uploadBox}>
                <Ionicons name="cloud-upload-outline" size={40} color="#007aff" />
                <Text style={styles.uploadText}>
                    <Text style={styles.uploadLink}>Tap to upload</Text> or browse gallery
                </Text>
                <Text style={styles.sizeNote}>Max. File Size: 15MB</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={handleSubmit}>
                    <Text style={styles.uploadTextBtn}>Upload</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 30,
    },
    galleryLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    galleryScroll: {
        flexDirection: 'row',
        gap: 10,
        paddingBottom: 10,
    },
    mediaContainer: {
        position: 'relative',
    },
    previewMedia: {
        width: screenWidth * 0.85,
        height: screenWidth * 0.85,
        borderRadius: 10,
        marginRight: 10,
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 5,
        borderRadius: 20,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginBottom: 20,
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#007aff',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 70,
        paddingHorizontal: 20,
        marginRight: 12,
        marginLeft: 12,
        alignItems: 'center',
        backgroundColor: '#f8faff',
        marginTop: 5,
    },
    uploadText: {
        marginTop: 12,
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    uploadLink: {
        color: '#007aff',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    sizeNote: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        gap: 10,
        marginBottom: 40,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
    },
    cancelText: {
        color: '#333',
        fontWeight: 'bold',
    },
    uploadButton: {
        flex: 1,
        backgroundColor: '#007aff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadTextBtn: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
