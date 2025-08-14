import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// This popup window lets users add new tasks or edit existing ones
const AddTaskModal = ({ visible, onClose, onAddTask, editingTask = null }) => {
  // Form fields - stores what the user types
  const [task, setTask] = useState(editingTask?.text || ''); // Main task title
  const [description, setDescription] = useState(editingTask?.description || ''); // Extra details
  const [category, setCategory] = useState(editingTask?.category || ''); // Which category (Work, Personal, etc.)
  const [priority, setPriority] = useState(editingTask?.priority || 'low'); // How important (low, medium, high)
  const [dueDate, setDueDate] = useState(editingTask?.dueDate ? new Date(editingTask.dueDate) : null); // When it's due
  const [showDatePicker, setShowDatePicker] = useState(false); // Show/hide the date picker

  // Available options for the user to choose from
  const categories = ['Personal', 'Work', 'Shopping', 'Health', 'Education', 'Other'];
  const priorities = [
    { value: 'low', label: 'Low', color: '#4ECDC4' },
    { value: 'medium', label: 'Medium', color: '#FFE66D' },
    { value: 'high', label: 'High', color: '#FF6B6B' }
  ];

  // Clears all form fields back to empty
  const resetForm = () => {
    setTask(''); // Clear task title
    setDescription(''); // Clear description
    setCategory(''); // Clear category
    setPriority('low'); // Reset to low priority
    setDueDate(null); // Clear due date
  };

  // Saves the task when user clicks "Save"
  const handleSubmit = () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task title'); // Must have a title
      return;
    }

    // Create the task object with all the information
    const newTask = {
      id: editingTask?.id || Date.now(), // Use existing ID or create new one
      text: task.trim(), // Remove extra spaces from title
      description: description.trim(), // Remove extra spaces from description
      category: category || null, // Use selected category or none
      priority, // Selected priority level
      dueDate: dueDate ? dueDate.toISOString() : null, // Convert date to text format
      done: editingTask?.done || false, // Keep completion status if editing
      createdAt: editingTask?.createdAt || new Date().toISOString(), // Keep original creation time
      updatedAt: new Date().toISOString(), // Record when it was last changed
    };

    onAddTask(newTask); // Send the task back to the main app
    resetForm(); // Clear the form
    onClose(); // Close the popup
  };

  // Closes the popup without saving
  const handleClose = () => {
    resetForm(); // Clear the form
    onClose(); // Close the popup
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Task Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={task}
              onChangeText={setTask}
              multiline
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.selectedCategoryChip
                  ]}
                  onPress={() => setCategory(category === cat ? '' : cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.selectedCategoryText
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityChip,
                    { backgroundColor: priority === p.value ? p.color : '#F0F0F0' }
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: priority === p.value ? '#FFFFFF' : '#333333' }
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {dueDate ? dueDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : '📅 Set due date (optional)'}
              </Text>
            </TouchableOpacity>
            
            {dueDate && (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setDueDate(null)}
              >
                <Text style={styles.clearDateText}>Clear Date</Text>
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cancelButton: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  saveButton: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#3498DB',
  },
  categoryText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  priorityContainer: {
    flexDirection: 'row',
  },
  priorityChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    fontSize: 14,
    color: '#E74C3C',
  },
});

export default AddTaskModal;
