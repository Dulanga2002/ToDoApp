import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';

// This component shows a single task in the list
const TaskItem = ({ 
  task, // The task data (title, description, etc.)
  onToggle, // Function to mark complete/incomplete
  onDelete, // Function to delete the task
  onEdit, // Function to edit the task
  index // Position in the list
}) => {
  // Shows confirmation popup before deleting
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' }, // Let user cancel
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(index) }, // Delete if confirmed
      ]
    );
  };

  // Returns the color for each priority level
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF6B6B'; // Red for urgent tasks
      case 'medium': return '#FFE66D'; // Yellow for medium tasks
      case 'low': return '#4ECDC4'; // Blue for low priority
      default: return '#95A5A6'; // Gray if no priority set
    }
  };

  // Converts date text to readable format (e.g., "Dec 25, 2:30 PM")
  const formatDate = (dateString) => {
    if (!dateString) return ''; // Return nothing if no date
    const date = new Date(dateString); // Convert text to date object
    return date.toLocaleDateString('en-US', {
      month: 'short', // Short month name (Dec)
      day: 'numeric', // Day number (25)
      hour: '2-digit', // Hour (02)
      minute: '2-digit', // Minute (30)
    });
  };

  // Animation for overdue date
  const overduePulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (task.dueDate && !task.done && new Date(task.dueDate) < new Date()) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(overduePulse, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(overduePulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      overduePulse.setValue(1);
    }
  }, [task.dueDate, task.done]);

  // User-friendly: Mark as Important
  const [important, setImportant] = useState(task.important || false);
  const starScale = useRef(new Animated.Value(1)).current;
  const handleToggleImportant = () => {
    setImportant(!important);
    Animated.sequence([
      Animated.timing(starScale, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(starScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    // Optionally, you can call a parent function to persist this change
    // e.g., onMarkImportant(index, !important);
  };

  return (
    <View
      style={[
        styles.container,
        task.done && styles.completedContainer,
        important && { borderColor: '#FFD700', borderWidth: 2, shadowColor: '#FFD700', shadowOpacity: 0.3 },
      ]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => onToggle(index)} style={styles.checkbox}>
          <Text style={styles.checkboxText}>
            {task.done ? '✅' : '⬜️'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <TouchableOpacity 
            onPress={() => onEdit(index)}
            style={styles.taskTextContainer}
          >
            <Text style={[styles.taskText, task.done && styles.completedText]}>
              {task.text}
            </Text>
            <Text style={styles.tapHint}>Tap to edit</Text>
          </TouchableOpacity>
          
          {task.description && (
            <Text style={[styles.description, task.done && styles.completedText]}>
              {task.description}
            </Text>
          )}
          
          <View style={styles.metadata}>
            {task.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            )}
            
            {task.priority && (
              <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
              </View>
            )}
            
            {task.dueDate && (
              task.done ? (
                <Text style={[styles.dueDate]}>
                  📅 {formatDate(task.dueDate)}
                </Text>
              ) : (
                <Animated.Text
                  style={[
                    styles.dueDate,
                    new Date(task.dueDate) < new Date() && styles.overdue,
                    new Date(task.dueDate) < new Date() && {
                      transform: [{ scale: overduePulse }],
                      color: '#FF6B6B',
                      textShadowColor: '#FFBABA',
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 8,
                    },
                  ]}
                >
                  📅 {formatDate(task.dueDate)}
                </Animated.Text>
              )
            )}
          </View>
          
          {task.createdAt && (
            <Text style={styles.timestamp}>
              Created: {formatDate(task.createdAt)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(index)} style={styles.editButton}>
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  completedContainer: {
    backgroundColor: '#F8F9FA',
    opacity: 0.7,
    borderLeftColor: '#95A5A6',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 20,
  },
  taskContent: {
    flex: 1,
  },
  taskTextContainer: {
    marginBottom: 4,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  tapHint: {
    fontSize: 11,
    color: '#BDC3C7',
    fontStyle: 'italic',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#7F8C8D',
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  overdue: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
    color: '#BDC3C7',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionText: {
    fontSize: 18,
  },
});

export default TaskItem;
