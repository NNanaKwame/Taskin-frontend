import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    Pressable,
    Text,
    TextInput,
    Modal,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
} from "react-native-reanimated";

interface Highlight {
    id: string;
    image_path: string;
    task_description: string;
}

const API_BASE_URL = 'http://10.0.2.2:5000';
// const API_BASE_URL = 'https://taskin-backend.onrender.com';

// API service functions
const api = {
    async fetchHighlights() {
        try {
            const response = await axios.get(`${API_BASE_URL}/highlights`);
            return response.data;
        } catch (error) {
            console.error('Error fetching highlights:', error);
            throw error;
        }
    },

    async createHighlight(formData: FormData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/highlights`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating highlight:', error);
            throw error;
        }
    },

    async deleteHighlight(id: string) {
        try {
            await axios.delete(`${API_BASE_URL}/highlights/${id}`);
        } catch (error) {
            console.error('Error deleting highlight:', error);
            throw error;
        }
    }
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 0.7;
const AUTOPLAY_INTERVAL = 3000;

const AnimatedCarousel = () => {
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [newTask, setNewTask] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showAddHighlightModal, setShowAddHighlightModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [modalCancelButtonText, setModalCancelButtonText] = useState("");
    const [modalConfirmButtonText, setModalConfirmButtonText] = useState("");
    const [modalConfirmAction, setModalConfirmAction] = useState<() => void>(
        () => { }
    );
    const [isLoading, setIsLoading] = useState(true);

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const translateX = useSharedValue(0);

    useEffect(() => {
        fetchHighlights();
    }, []);

    const fetchHighlights = async () => {
        try {
            setIsLoading(true);
            const data = await api.fetchHighlights();
            setHighlights(data as Highlight[]);
            setIsLoading(false);
        } catch (error) {
            showConfirmationModal(
                "Error",
                "Failed to fetch highlights. Please try again.",
                "OK",
                "",
                () => { }
            );
            setIsLoading(false);
        }
    };


    const changeSlide = useCallback(
        (direction: number) => {
            if (highlights.length === 0) return;

            scale.value = withSequence(
                withTiming(0.9, { duration: 150 }),
                withTiming(1, { duration: 150 })
            );
            opacity.value = withTiming(0, { duration: 150 });
            translateX.value = withSpring(direction * CARD_WIDTH);

            setTimeout(() => {
                translateX.value = 0;
                opacity.value = withTiming(1, { duration: 150 });
                setActiveIndex((prev) =>
                    direction > 0
                        ? (prev + 1) % highlights.length
                        : (prev - 1 + highlights.length) % highlights.length
                );
            }, 150);
        },
        [highlights.length]
    );

    const nextSlide = useCallback(() => changeSlide(1), [changeSlide]);
    const prevSlide = useCallback(() => changeSlide(-1), [changeSlide]);

    useEffect(() => {
        let interval: string | number | NodeJS.Timeout | undefined;
        if (isAutoplay && highlights.length > 1) {
            interval = setInterval(nextSlide, AUTOPLAY_INTERVAL);
        }
        return () => clearInterval(interval);
    }, [isAutoplay, nextSlide, highlights.length]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            showConfirmationModal(
                "Permission denied",
                "Permission required to pick images",
                "OK",
                "",
                () => { }
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            setShowAddHighlightModal(false); // Close the add highlight modal
            showConfirmationModal(
                "Add Highlight",
                "Are you sure you want to add this highlight?",
                "Cancel",
                "Add",
                async () => {
                    try {
                        const formData = new FormData();
                        const imageUri = result.assets[0].uri;
                        const filename = imageUri.split('/').pop() || 'highlight.jpg';
                        const match = /\.(\w+)$/.exec(filename);
                        const type = match ? `image/${match[1]}` : 'image/jpeg';

                        formData.append('file', {
                            uri: imageUri,
                            name: filename,
                            type,
                        } as any);
                        formData.append('task_description', newTask || 'New Task');

                        await api.createHighlight(formData);
                        await fetchHighlights();
                        setNewTask("");
                    } catch (error) {
                        showConfirmationModal(
                            "Error",
                            "Failed to add highlight. Please try again.",
                            "OK",
                            "",
                            () => { }
                        );
                    }
                }
            );
        }
    };

    const handleDeleteHighlight = () => {
        if (highlights.length <= 1) {
            showConfirmationModal(
                "Cannot Delete",
                "You must have at least one highlight in the carousel.",
                "OK",
                "",
                () => { }
            );
            return;
        }

        showConfirmationModal(
            "Delete Highlight",
            "Are you sure you want to delete this highlight?",
            "Cancel",
            "Delete",
            async () => {
                try {
                    await api.deleteHighlight(highlights[activeIndex].id);

                    // Remove the deleted highlight from the local state
                    const newHighlights = highlights.filter((_, index) => index !== activeIndex);
                    setHighlights(newHighlights);

                    // Adjust the activeIndex if necessary
                    if (activeIndex >= newHighlights.length) {
                        setActiveIndex(newHighlights.length - 1);
                    }

                    // Optionally, you can still fetch highlights from the server
                    // await fetchHighlights();
                } catch (error) {
                    showConfirmationModal(
                        "Error",
                        "Failed to delete highlight. Please try again.",
                        "OK",
                        "",
                        () => { }
                    );
                }
            }
        );
    };

    const showConfirmationModal = (
        title: string,
        description: string,
        cancelButtonText: string,
        confirmButtonText: string,
        confirmAction: () => void
    ) => {
        setModalTitle(title);
        setModalDescription(description);
        setModalCancelButtonText(cancelButtonText);
        setModalConfirmButtonText(confirmButtonText);
        setModalConfirmAction(() => confirmAction);
        setShowModal(true);
    };

    const renderModal = () => (
        <Modal visible={showModal} transparent animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{modalTitle}</Text>
                    <Text style={styles.modalDescription}>{modalDescription}</Text>
                    <View style={styles.modalButtonContainer}>
                        <Pressable
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>
                                {modalCancelButtonText}
                            </Text>
                        </Pressable>
                        {modalConfirmButtonText !== "" && (
                            <Pressable
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    modalConfirmAction();
                                    setShowModal(false);
                                }}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {modalConfirmButtonText}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderAddHighlightModal = () => (
        <Modal visible={showAddHighlightModal} transparent animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Add New Highlight</Text>
                    <TextInput
                        placeholder="Enter task description"
                        value={newTask}
                        onChangeText={setNewTask}
                        style={styles.modalTaskInput}
                        maxLength={50}
                    />
                    <Text style={styles.characterCount}>
                        {50 - newTask.length} characters remaining
                    </Text>
                    <View style={styles.modalButtonContainer}>
                        <Pressable
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowAddHighlightModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={handleImagePick}
                        >
                            <Text style={styles.confirmButtonText}>Add</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {highlights.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        { backgroundColor: index === activeIndex ? "#000" : "#ccc" },
                    ]}
                />
            ))}
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.wrapper}>
                <Text>Loading highlights...</Text>
            </View>
        );
    }

    if (highlights.length === 0) {
        return (
            <View style={styles.wrapper}>
                <Text>No highlights available. Please add a highlight.</Text>
                <View style={styles.uploadContainer}>
                    <TextInput
                        placeholder="Enter task description"
                        value={newTask}
                        onChangeText={setNewTask}
                        style={styles.taskInput}
                        maxLength={150}
                    />
                    <Pressable
                        style={[styles.addButton, { borderRadius: 10 }]}
                        onPress={handleImagePick}
                    >
                        <Text style={styles.addButtonText}>Add New Highlight</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <View style={styles.carouselContainer}>
                    {highlights.length > 1 && (
                        <Pressable
                            onPress={prevSlide}
                            style={[styles.navButton, styles.leftNavButton]}
                        >
                            <AntDesign name="leftcircle" size={30} color="#000" />
                        </Pressable>
                    )}

                    <Animated.View style={[styles.cardContainer, animatedStyle]}>
                        {highlights[activeIndex] && (
                            <>
                                <Pressable
                                    style={styles.deleteIcon}
                                    onPress={handleDeleteHighlight}
                                >
                                    <MaterialIcons name="delete" size={25} color="#ff5733" />
                                </Pressable>
                                <Image
                                    source={{ uri: `${highlights[activeIndex].image_path}` }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                <View style={styles.overlayed} />
                                <Text style={styles.taskText}>{highlights[activeIndex].task_description}</Text>
                            </>
                        )}
                        <View style={styles.overlay}>
                            <View style={styles.playPauseButton}>
                                <Pressable onPress={() => setIsAutoplay(!isAutoplay)}>
                                    <AntDesign
                                        name={isAutoplay ? "pausecircleo" : "playcircleo"}
                                        size={24}
                                        color="white"
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </Animated.View>

                    {highlights.length > 1 && (
                        <Pressable
                            onPress={nextSlide}
                            style={[styles.navButton, styles.rightNavButton]}
                        >
                            <AntDesign name="rightcircle" size={30} color="#000" />
                        </Pressable>
                    )}
                </View>
                {renderDots()}

                <Pressable
                    style={styles.addButton}
                    onPress={() => setShowAddHighlightModal(true)}
                >
                    <Text style={styles.addButtonText}>Add New Highlight</Text>
                </Pressable>
            </View>
            {renderModal()}
            {renderAddHighlightModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 28,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        marginHorizontal: 8,
        alignItems: "center",
    },
    modalTaskInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 10,
        marginBottom: 20,
        marginTop: 10,
        width: "90%",
    },
    modalAddButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
        marginBottom: 20,
    },
    modalAddButtonText: {
        color: "#fff",
        fontWeight: "500",
    },
    cancelButton: {
        backgroundColor: "#E0E0E0",
    },
    cancelButtonText: {
        color: "#000",
        fontWeight: "500",
    },
    confirmButton: {
        backgroundColor: "#ff5733",
    },
    confirmButtonText: {
        color: "#fff",
        fontWeight: "500",
    },
    characterCount: {
        fontSize: 12,
        color: "#666",
        marginBottom: 10,
        alignSelf: "flex-end",
    },
    addButton: {
        backgroundColor: "#ff5733",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 20,
        marginTop: 10,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "500",
    },
    wrapper: { width: "100%", alignItems: "center", justifyContent: "center" },
    container: {
        width: SCREEN_WIDTH,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingVertical: 20,
    },
    carouselContainer: {
        width: SCREEN_WIDTH,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "black",
        borderRadius: 15,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    image: { width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    taskText: {
        position: "absolute",
        bottom: 10,
        left: 10,
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.1)",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        padding: 10,
    },
    overlayed: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    deleteIcon: { position: "absolute", top: 10, right: 10, zIndex: 1 },
    playPauseButton: {
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 20,
        padding: 5,
    },
    navButton: {
        padding: 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 30,
        position: "absolute",
        zIndex: 1,
    },
    leftNavButton: { left: (SCREEN_WIDTH - CARD_WIDTH) / 2 - 25 },
    rightNavButton: { right: (SCREEN_WIDTH - CARD_WIDTH) / 2 - 25 },
    dotsContainer: {
        flexDirection: "row",
        marginTop: 20,
        justifyContent: "center",
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 5 },
    uploadContainer: { alignItems: "center", marginTop: 20 },
    taskInput: {
        borderBottomWidth: 0,
        borderColor: "transparent",
        padding: 12,
        width: "80%",
        maxWidth: "80%", // Add this line
        marginBottom: 10,
        backgroundColor: "#f5f5f5",
        borderRadius: 4,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    addbutton: {
        backgroundColor: "#ff5733",
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
});

export default AnimatedCarousel;
