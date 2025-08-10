export const filterTasks = (tasks, filters) => {
  const {
    searchQuery = '',
    selectedCategory = 'all',
    selectedPriority = 'all',
    showCompleted = true
  } = filters;

  return tasks.filter(task => {
    // Search query filter
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    
    // Priority filter
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    // Completed filter
    const matchesCompleted = showCompleted || !task.done;

    return matchesSearch && matchesCategory && matchesPriority && matchesCompleted;
  });
};

export const sortTasks = (tasks, sortBy) => {
  const sortedTasks = [...tasks];
  
  switch (sortBy) {
    case 'dueDate':
      return sortedTasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    
    case 'priority':
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return sortedTasks.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        return bPriority - aPriority;
      });
    
    case 'alphabetical':
      return sortedTasks.sort((a, b) => a.text.localeCompare(b.text));
    
    case 'created':
    default:
      return sortedTasks.sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }
};

export const getUniqueCategories = (tasks) => {
  const categories = tasks
    .map(task => task.category)
    .filter(category => category && category.trim() !== '');
  
  return [...new Set(categories)];
};

export const formatTaskForDisplay = (task) => {
  return {
    ...task,
    isOverdue: task.dueDate && !task.done && new Date(task.dueDate) < new Date(),
    formattedDueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null,
    formattedCreatedDate: task.createdAt ? new Date(task.createdAt).toLocaleDateString() : null,
  };
};

export const generateTaskId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
