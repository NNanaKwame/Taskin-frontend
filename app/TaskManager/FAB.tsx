import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FABProps {
  onAddTask: (task: {
    title: string;
    description: string;
    dueDate: Date | null;
  }) => void;
}

const FAB: React.FC<FABProps> = ({ onAddTask }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const MAX_WORDS: number = 40;

  const handleSubmit = () => {
    if (title.trim() && description.trim().split(' ').length <= MAX_WORDS) {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        dueDate,
      });
      setTitle('');
      setDescription('');
      setDueDate(null);
      closeModal();
    }
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDueDate = new Date(selectedDate);
      if (dueDate) {
        newDueDate.setHours(dueDate.getHours());
        newDueDate.setMinutes(dueDate.getMinutes());
      }
      setDueDate(newDueDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && dueDate) {
      const newDueDate = new Date(dueDate);
      newDueDate.setHours(selectedTime.getHours());
      newDueDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDueDate);
    }
  };

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  React.useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: modalVisible ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleString();
  };

  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const isAddButtonDisabled = wordCount > MAX_WORDS;

  return (
    <>
      <TouchableOpacity
        style={styles.fabContainer}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.fab, { transform: [{ rotate: spin }] }]}>
          <Text style={styles.fabIcon}>+</Text>
        </Animated.View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [
                      {
                        scale: scaleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>New Task</Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Task Title"
                    placeholderTextColor="#666666"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description"
                    placeholderTextColor="#666666"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                  <Text style={styles.wordCounter}>
                    {wordCount} / {MAX_WORDS} words
                  </Text>

                  <View style={styles.dateTimeContainer}>
                    <Text style={styles.dateTimeLabel}>Due Date & Time:</Text>
                    <Text style={styles.dateTimeValue}>
                      {formatDateTime(dueDate)}
                    </Text>
                    <View style={styles.dateTimeButtons}>
                      <TouchableOpacity
                        style={styles.dateTimeButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={styles.dateTimeButtonText}>Set Date</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.dateTimeButton,
                          !dueDate && styles.disabledButton
                        ]}
                        onPress={() => dueDate && setShowTimePicker(true)}
                        disabled={!dueDate}
                      >
                        <Text style={styles.dateTimeButtonText}>Set Time</Text>
                      </TouchableOpacity>

                    </View>
                  </View>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={closeModal}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.addButton,
                      isAddButtonDisabled && styles.disabledButton
                    ]}
                    onPress={handleSubmit}
                    disabled={isAddButtonDisabled}
                  >
                    <Text style={styles.buttonText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 999,
  },
  fab: {
    backgroundColor: '#ff5733',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ff5733',
    textAlign: 'center',
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  wordCounter: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#ff5733',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dateTimeContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  dateTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    backgroundColor: '#ff5733',
    padding: 8,
    borderRadius: 6,
    flex: 0.48,
  },
  dateTimeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
});

export default FAB;