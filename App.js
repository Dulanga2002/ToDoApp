import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim() === '') return;
    setTasks([...tasks, { key: Date.now().toString(), text: task }]);
    setTask('');
  };

  const removeTask = (key) => {
    setTasks(tasks.filter(item => item.key !== key));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My To-Do List</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          value={task}
          onChangeText={setTask}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => removeTask(item.key)}>
            <Text style={styles.task}>{item.text}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{textAlign: 'center'}}>No tasks yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#777',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 8,
    height: 40,
    borderRadius: 5,
  },
  task: {
    fontSize: 18,
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});
