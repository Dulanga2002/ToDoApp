import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';

const TaskItem = ({ 
  task, 
  onToggle, 
  onDelete, 
  onEdit,
  index,
  fadeAnim 
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(index) },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFE66D';
      case 'low': return '#4ECDC4';
      default: return '#95A5A6';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
        task.done && styles.completedContainer,
      ]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => onToggle(index)} style={styles.checkbox}>
          <Text style={styles.checkboxText}>
            {task.done ? '✅' : '⬜️'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text style={[styles.taskText, task.done && styles.completedText]}>
            {task.text}
          </Text>
          
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
              <Text style={[styles.dueDate, new Date(task.dueDate) < new Date() && !task.done && styles.overdue]}>
                📅 {formatDate(task.dueDate)}
              </Text>
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
    </Animated.View>
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
  taskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
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
