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
  Modal,
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
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState('created');
  const [darkMode, setDarkMode] = useState(false);
  
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
    fadeAnim.setValue(0); // Reset animation value
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
      '🗑️ Clear All Tasks',
      `Are you sure you want to delete all ${tasks.length} tasks? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setTasks([]);
            saveTasks([]);
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

  // Get overdue tasks
  const getOverdueTasks = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    return tasks.filter(task => {
      if (task.done) return false; // Skip completed tasks
      if (!task.dueDate) return false; // Skip tasks without due date
      
      const taskDueDate = new Date(task.dueDate);
      return taskDueDate < today;
    });
  };

  const overdueTasks = getOverdueTasks();

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
          
          {/* Overdue Tasks Button */}
          {overdueTasks.length > 0 && (
            <TouchableOpacity 
              onPress={() => setShowOverdueModal(true)}
              style={styles.overdueButton}
            >
              <Text style={styles.overdueButtonText}>🔔</Text>
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueBadgeText}>{overdueTasks.length}</Text>
              </View>
            </TouchableOpacity>
          )}
          
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

      {/* Overdue Tasks Modal */}
      {showOverdueModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.overdueModal, darkMode && styles.overdueModalDark]}>
            <View style={styles.overdueHeader}>
              <Text style={[styles.overdueTitle, darkMode && styles.overdueTitleDark]}>
                🔔 Overdue Tasks ({overdueTasks.length})
              </Text>
              <TouchableOpacity 
                onPress={() => setShowOverdueModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={overdueTasks}
              keyExtractor={(item) => item.id}
              style={styles.overdueList}
              renderItem={({ item }) => {
                const daysPast = Math.floor(
                  (new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <TouchableOpacity 
                    style={[styles.overdueItem, darkMode && styles.overdueItemDark]}
                    onPress={() => {
                      setShowOverdueModal(false);
                      const taskIndex = filteredTasks.findIndex(t => t.id === item.id);
                      if (taskIndex !== -1) {
                        editTask(taskIndex);
                      }
                    }}
                  >
                    <View style={styles.overdueItemContent}>
                      <Text style={[styles.overdueTaskText, darkMode && styles.overdueTaskTextDark]}>
                        {item.text}
                      </Text>
                      <Text style={styles.overdueDateText}>
                        {daysPast === 0 ? 'Due today' : `${daysPast} day${daysPast > 1 ? 's' : ''} overdue`}
                      </Text>
                      {item.category && (
                        <Text style={[styles.overdueCategory, darkMode && styles.overdueCategoryDark]}>
                          📂 {item.category}
                        </Text>
                      )}
                    </View>
                    <View style={styles.overdueActions}>
                      <TouchableOpacity
                        onPress={() => {
                          const taskIndex = filteredTasks.findIndex(t => t.id === item.id);
                          if (taskIndex !== -1) {
                            toggleTask(taskIndex);
                          }
                        }}
                        style={styles.overdueCompleteButton}
                      >
                        <Text style={styles.overdueCompleteText}>✓</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => (
                <Text style={[styles.noOverdueText, darkMode && styles.noOverdueTextDark]}>
                  🎉 No overdue tasks! Great job!
                </Text>
              )}
            />
            
            <TouchableOpacity 
              style={[styles.overdueCloseButton, darkMode && styles.overdueCloseButtonDark]}
              onPress={() => setShowOverdueModal(false)}
            >
              <Text style={styles.overdueCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  overdueButton: {
    marginRight: 15,
    padding: 8,
    position: 'relative',
  },
  overdueButtonText: {
    fontSize: 20,
  },
  overdueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overdueModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overdueModalDark: {
    backgroundColor: '#2C3E50',
  },
  overdueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  overdueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  overdueTitleDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7F8C8D',
  },
  overdueList: {
    maxHeight: 400,
  },
  overdueItem: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overdueItemDark: {
    backgroundColor: '#34495E',
    borderLeftColor: '#F39C12',
  },
  overdueItemContent: {
    flex: 1,
  },
  overdueTaskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  overdueTaskTextDark: {
    color: '#FFFFFF',
  },
  overdueDateText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
    marginBottom: 4,
  },
  overdueCategory: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  overdueCategoryDark: {
    color: '#BDC3C7',
  },
  overdueActions: {
    flexDirection: 'row',
  },
  overdueCompleteButton: {
    backgroundColor: '#27AE60',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueCompleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  overdueCloseButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  overdueCloseButtonDark: {
    backgroundColor: '#2980B9',
  },
  overdueCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noOverdueText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#27AE60',
    fontStyle: 'italic',
    padding: 20,
  },
  noOverdueTextDark: {
    color: '#2ECC71',
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
