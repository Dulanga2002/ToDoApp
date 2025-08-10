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
  // State Management
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState('created');
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  // Effects
  useEffect(() => {
    loadTasks();
    startFadeAnimation();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchQuery, selectedCategory, selectedPriority, showCompleted, sortBy]);

  // Animations
  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const animateFAB = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Data Management
  const loadTasks = async () => {
    try {
      setLoading(true);
      const savedTasks = await AsyncStorage.getItem('@advanced_tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem('@advanced_tasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Error saving tasks:', error);
      Alert.alert('Error', 'Failed to save tasks');
    }
  };

  const applyFiltersAndSort = () => {
    const filters = {
      searchQuery,
      selectedCategory,
      selectedPriority,
      showCompleted,
    };
    
    let filtered = filterTasks(tasks, filters);
    filtered = sortTasks(filtered, sortBy);
    setFilteredTasks(filtered);
  };

  // Task Operations
  const addTask = (newTask) => {
    const taskWithId = {
      ...newTask,
      id: newTask.id || generateTaskId(),
      createdAt: newTask.createdAt || new Date().toISOString(),
    };
    
    const updatedTasks = [...tasks, taskWithId];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const updateTask = (updatedTask) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id 
        ? { ...updatedTask, updatedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const toggleTask = (index) => {
    const task = filteredTasks[index];
    const originalIndex = tasks.findIndex(t => t.id === task.id);
    
    if (originalIndex !== -1) {
      const updatedTasks = [...tasks];
      const wasCompleted = updatedTasks[originalIndex].done;
      updatedTasks[originalIndex] = {
        ...updatedTasks[originalIndex],
        done: !updatedTasks[originalIndex].done,
        updatedAt: new Date().toISOString(),
      };
      
      // Show celebration for task completion
      if (!wasCompleted && updatedTasks[originalIndex].done) {
        Alert.alert(
          '🎉 Task Completed!',
          `Excellent work completing "${updatedTasks[originalIndex].text}"! Keep it up! 💪`,
          [{ text: 'Thank you!', style: 'default' }]
        );
      }
      
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }
  };

  const deleteTask = (index) => {
    const task = filteredTasks[index];
    const updatedTasks = tasks.filter(t => t.id !== task.id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (index) => {
    const task = filteredTasks[index];
    setEditingTask(task);
    setShowAddModal(true);
  };

  const clearAllTasks = () => {
    Alert.alert(
      'Clear All Tasks',
      'Are you sure you want to delete all tasks? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setTasks([]);
            saveTasks([]);
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

  // Render Methods
  const renderTaskItem = ({ item, index }) => (
    <TaskItem
      task={item}
      index={index}
      onToggle={toggleTask}
      onDelete={deleteTask}
      onEdit={editTask}
      fadeAnim={fadeAnim}
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✅  To Do List</Text>
        {tasks.length > 0 && (
          <TouchableOpacity onPress={clearAllTasks}>
            <Text style={styles.clearAllButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Task Statistics */}
      {tasks.length > 0 && <TaskStats tasks={tasks} />}

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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  clearAllButton: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
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
