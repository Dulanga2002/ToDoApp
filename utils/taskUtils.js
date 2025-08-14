// Filters tasks based on search text, category, priority, and completion status
export const filterTasks = (tasks, filters) => {
  const {
    searchQuery = '', // Text to search for
    selectedCategory = 'all', // Which category to show
    selectedPriority = 'all', // Which priority to show
    showCompleted = true // Whether to show completed tasks
  } = filters;

  return tasks.filter(task => {
    // Check if task title or description contains search text
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Check if task matches selected category (or show all)
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    
    // Check if task matches selected priority (or show all)
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    // Check if we should show completed tasks
    const matchesCompleted = showCompleted || !task.done;

    // Task must match ALL filters to be shown
    return matchesSearch && matchesCategory && matchesPriority && matchesCompleted;
  });
};

// Sorts tasks in different orders (by date, priority, alphabet, etc.)
export const sortTasks = (tasks, sortBy) => {
  const sortedTasks = [...tasks]; // Make a copy so we don't change the original
  
  switch (sortBy) {
    case 'dueDate':
      // Sort by due date - tasks due sooner come first
      return sortedTasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0; // Both have no due date
        if (!a.dueDate) return 1; // Tasks without due dates go to the end
        if (!b.dueDate) return -1; // Tasks without due dates go to the end
        return new Date(a.dueDate) - new Date(b.dueDate); // Earlier dates first
      });
    
    case 'priority':
      // Sort by priority - high priority tasks come first
      const priorityOrder = { high: 3, medium: 2, low: 1 }; // Give each priority a number
      return sortedTasks.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] || 0; // Get priority number
        const bPriority = priorityOrder[b.priority] || 0;
        return bPriority - aPriority; // Higher numbers first
      });
    
    case 'alphabetical':
      // Sort by task title A-Z
      return sortedTasks.sort((a, b) => a.text.localeCompare(b.text));
    
    case 'created':
    default:
      // Sort by creation date - newest tasks first (default)
      return sortedTasks.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // Newer dates first
      });
  }
};

// Gets a list of all unique categories used in tasks
export const getUniqueCategories = (tasks) => {
  const categories = tasks
    .map(task => task.category) // Get category from each task
    .filter(category => category && category.trim() !== ''); // Remove empty categories
  
  return [...new Set(categories)]; // Remove duplicates and return as array
};

// Adds extra information to a task for display (like whether it's overdue)
export const formatTaskForDisplay = (task) => {
  return {
    ...task, // Keep all original task data
    isOverdue: task.dueDate && !task.done && new Date(task.dueDate) < new Date(), // Is it past due?
    formattedDueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null, // Readable due date
    formattedCreatedDate: task.createdAt ? new Date(task.createdAt).toLocaleDateString() : null, // Readable created date
  };
};

// Creates a unique ID for each new task
export const generateTaskId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9); // Current time + random letters/numbers
};
