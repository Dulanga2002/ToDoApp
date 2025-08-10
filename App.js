import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, FlatList, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [taskItems, setTaskItems] = useState([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current; // for fade animation

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    // Fade in animation when tasks change
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [taskItems]);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('@tasks');
      if (savedTasks !== null) {
        setTaskItems(JSON.parse(savedTasks));
      }
    } catch (e) {
      console.log('Failed to load tasks.', e);
    }
  };

  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
    } catch (e) {
      console.log('Failed to save tasks.', e);
    }
  };

  const addTask = () => {
    if (task.trim()) {
      const updatedTasks = [...taskItems, { text: task.trim(), done: false }];
      setTaskItems(updatedTasks);
      setTask('');
      saveTasks(updatedTasks);
    }
  };

  const toggleTaskDone = (index) => {
    let itemsCopy = [...taskItems];
    itemsCopy[index].done = !itemsCopy[index].done;
    setTaskItems(itemsCopy);
    saveTasks(itemsCopy);
  };

  const deleteTask = (index) => {
    let itemsCopy = [...taskItems];
    itemsCopy.splice(index, 1);
    setTaskItems(itemsCopy);
    saveTasks(itemsCopy);
  };

  const clearAllTasks = () => {
    setTaskItems([]);
    saveTasks([]);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => toggleTaskDone(index)}>
        <Text style={[styles.taskText, item.done && styles.taskDone]}>
          {item.done ? '✅ ' : '⬜️ '}
          {item.text}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteTask(index)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My ToDo List</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Write a task"
          value={task}
          onChangeText={text => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={taskItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks yet. Add some!</Text>
          }
        />
      </Animated.View>

      {taskItems.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearAllTasks}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
  },
  taskText: {
    fontSize: 16,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  deleteText: {
    color: '#FF4136',
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#FF4136',
    padding: 15,
    borderRadius: 6,
    marginVertical: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 30,
    fontSize: 16,
  },
});
