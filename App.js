import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Animated,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import TaskItem from './components/TaskItem';
import AddTaskModal from './components/AddTaskModal';
import TaskFilter from './components/TaskFilter';
import TaskStats from './components/TaskStats';

// Utils
import { filterTasks, sortTasks, getUniqueCategories, generateTaskId } from './utils/taskUtils';

export default function App() {
  // State Management - stores all the data for our app
  const [tasks, setTasks] = useState([]); // Main list of all tasks
  const [filteredTasks, setFilteredTasks] = useState([]); // Tasks after applying filters
  const [loading, setLoading] = useState(false); // Shows loading spinner when true
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh feature
  
  // Modal States - controls which popup windows are open
  const [showAddModal, setShowAddModal] = useState(false); // Add new task popup
  const [editingTask, setEditingTask] = useState(null); // Task being edited (null = not editing)
  
  // Filter States - controls how tasks are displayed
  const [searchQuery, setSearchQuery] = useState(''); // Text to search for
  const [selectedCategory, setSelectedCategory] = useState('all'); // Which category to show
  const [selectedPriority, setSelectedPriority] = useState('all'); // Which priority to show
  const [showCompleted, setShowCompleted] = useState(true); // Show/hide completed tasks
  const [sortBy, setSortBy] = useState('created'); // How to sort tasks (by date, priority, etc.)
  const [darkMode, setDarkMode] = useState(false); // Light or dark theme
  
  // Animation - makes the app look smooth and beautiful
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade in/out effect
  const fabScale = useRef(new Animated.Value(1)).current; // Scale effect for floating button

  // Effects - runs when the app starts or data changes
  useEffect(() => {
    loadTasks(); // Load saved tasks from phone storage
    startFadeAnimation(); // Start the fade-in animation
  }, []);

  useEffect(() => {
    applyFiltersAndSort(); // Update the displayed tasks when filters change
  }, [tasks, searchQuery, selectedCategory, selectedPriority, showCompleted, sortBy]);

  // Animation Functions - make the app look smooth
  
  // Makes the app fade in smoothly when it starts
  const startFadeAnimation = () => {
    fadeAnim.setValue(0); // Start invisible
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade to fully visible
      duration: 500, // Takes 0.5 seconds
      useNativeDriver: true,
    }).start();
  };

  // Makes the + button bounce when pressed
  const animateFAB = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.8, // Shrink to 80% size
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1, // Back to normal size
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Data Management Functions - handles saving and loading tasks
  
  // Loads all tasks from phone storage when app starts
  const loadTasks = async () => {
    try {
      setLoading(true); // Show loading indicator
      const savedTasks = await AsyncStorage.getItem('@advanced_tasks'); // Get tasks from storage
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks); // Convert text back to task objects
        setTasks(parsedTasks); // Put tasks in our app
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks'); // Show error message
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Saves all tasks to phone storage
  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem('@advanced_tasks', JSON.stringify(tasksToSave)); // Convert tasks to text and save
    } catch (error) {
      console.error('Error saving tasks:', error);
      Alert.alert('Error', 'Failed to save tasks'); // Show error message
    }
  };

  // Applies search filters and sorts the task list
  const applyFiltersAndSort = () => {
    const filters = {
      searchQuery, // Text to search for
      selectedCategory, // Category filter
      selectedPriority, // Priority filter
      showCompleted, // Show/hide completed tasks
    };
    
    let filtered = filterTasks(tasks, filters); // Apply all filters
    filtered = sortTasks(filtered, sortBy); // Sort the results
    setFilteredTasks(filtered); // Update the displayed task list
  };

  // Task Operations - functions that add, edit, and manage tasks
  
  // Adds a brand new task to the list
  const addTask = (newTask) => {
    const taskWithId = {
      ...newTask, // Copy all task details
      id: newTask.id || generateTaskId(), // Give it a unique ID
      createdAt: newTask.createdAt || new Date().toISOString(), // Record when it was created
    };
    
    const updatedTasks = [...tasks, taskWithId]; // Add to existing tasks
    setTasks(updatedTasks); // Update the app
    saveTasks(updatedTasks); // Save to phone storage
  };

  // Updates an existing task with new information
  const updateTask = (updatedTask) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id 
        ? { ...updatedTask, updatedAt: new Date().toISOString() } // Update this task with timestamp
        : task // Keep other tasks unchanged
    );
    setTasks(updatedTasks); // Update the app
    saveTasks(updatedTasks); // Save to phone storage
  };

  // Marks a task as complete or incomplete (checkbox toggle)
  const toggleTask = (index) => {
    const task = filteredTasks[index]; // Get the task that was clicked
    const originalIndex = tasks.findIndex(t => t.id === task.id); // Find it in the full list
    
    if (originalIndex !== -1) {
      const updatedTasks = [...tasks]; // Copy all tasks
      const wasCompleted = updatedTasks[originalIndex].done; // Remember if it was already done
      updatedTasks[originalIndex] = {
        ...updatedTasks[originalIndex],
        done: !updatedTasks[originalIndex].done, // Flip complete/incomplete
        updatedAt: new Date().toISOString(), // Record when changed
      };
      
      // Show celebration message when task is completed
      if (!wasCompleted && updatedTasks[originalIndex].done) {
        Alert.alert(
          '🎉 Task Completed!',
          `Excellent work completing "${updatedTasks[originalIndex].text}"! Keep it up! 💪`,
          [{ text: 'Thank you!', style: 'default' }]
        );
      }
      
      setTasks(updatedTasks); // Update the app
      saveTasks(updatedTasks); // Save to phone storage
    }
  };

  // Permanently removes a task from the list
  const deleteTask = (index) => {
    const task = filteredTasks[index]; // Get the task to delete
    const updatedTasks = tasks.filter(t => t.id !== task.id); // Remove it from all tasks
    setTasks(updatedTasks); // Update the app
    saveTasks(updatedTasks); // Save to phone storage
  };

  // Opens the edit popup for a specific task
  const editTask = (index) => {
    const task = filteredTasks[index]; // Get the task to edit
    setEditingTask(task); // Set it as the task being edited
    setShowAddModal(true); // Open the add/edit popup
  };

  // Removes all tasks after asking for confirmation
  const clearAllTasks = () => {
    Alert.alert(
      '🗑️ Clear All Tasks',
      `Are you sure you want to delete all ${tasks.length} tasks? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' }, // Let user cancel
        {
          text: 'Clear All',
          style: 'destructive', // Red delete button
          onPress: () => {
            setTasks([]); // Empty the task list
            saveTasks([]); // Save empty list
            Alert.alert('✅ Success', 'All tasks have been cleared!', [
              { text: 'OK', style: 'default' }
            ]);
          },
        },
      ]
    );
  };

  // Refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadTasks().then(() => setRefreshing(false));
  }, []);

  // ...existing code...

  // Render Methods
  const renderTaskItem = ({ item, index }) => (
    <TaskItem
      task={item}
      index={index}
      onToggle={toggleTask}
      onDelete={deleteTask}
      onEdit={editTask}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>📝</Text>
      <Text style={styles.emptyStateTitle}>No Tasks Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {tasks.length === 0 
          ? 'Start by adding your first task!'
          : 'Try adjusting your filters or search query.'
        }
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? "#2C3E50" : "#FFFFFF"} />
      
      {/* Header */}
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, darkMode && styles.headerTitleDark]}>✅  To Do List</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setDarkMode(!darkMode)}
            style={styles.darkModeButton}
          >
            <Text style={styles.darkModeText}>{darkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          {/* Removed export tasks button */}
          {tasks.length > 0 && (
            <TouchableOpacity onPress={clearAllTasks}>
              <Text style={[styles.clearAllButton, darkMode && styles.clearAllButtonDark]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Task Statistics */}
      {tasks.length > 0 && <TaskStats tasks={tasks} darkMode={darkMode} />}

      {/* Search and Filter */}
      <TaskFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted(!showCompleted)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={getUniqueCategories(tasks)}
        darkMode={darkMode}
      />

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => {
            animateFAB();
            setEditingTask(null);
            setShowAddModal(true);
          }}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTask(null);
        }}
        onAddTask={(task) => {
          if (editingTask) {
            updateTask(task);
          } else {
            addTask(task);
          }
          setEditingTask(null);
        }}
        editingTask={editingTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  containerDark: {
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerDark: {
    backgroundColor: '#2C3E50',
    borderBottomColor: '#34495E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeButton: {
    marginRight: 15,
    padding: 8,
  },
  darkModeText: {
    fontSize: 20,
  },
  exportButton: {
    marginRight: 15,
    padding: 8,
  },
  exportButtonText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  clearAllButton: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
  },
  clearAllButtonDark: {
    color: '#FF6B6B',
  },
  taskList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  fabButton: {
    backgroundColor: '#3498DB',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

// test

// test2