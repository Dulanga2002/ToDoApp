import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';

const TaskFilter = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  showCompleted,
  onToggleCompleted,
  sortBy,
  onSortChange,
  categories = []
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const priorities = ['all', 'low', 'medium', 'high'];
  const sortOptions = [
    { value: 'created', label: 'Created Date' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search tasks..."
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.activeFilterToggle]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={[styles.filterToggleText, showFilters && styles.activeFilterToggleText]}>
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category:</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedCategory === 'all' && styles.activeChip
                ]}
                onPress={() => onCategoryChange('all')}
              >
                <Text style={[
                  styles.chipText,
                  selectedCategory === 'all' && styles.activeChipText
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    selectedCategory === category && styles.activeChip
                  ]}
                  onPress={() => onCategoryChange(category)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedCategory === category && styles.activeChipText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Priority:</Text>
            <View style={styles.chipContainer}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.chip,
                    styles.priorityChip,
                    selectedPriority === priority && styles.activeChip
                  ]}
                  onPress={() => onPriorityChange(priority)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedPriority === priority && styles.activeChipText
                  ]}>
                    {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <View style={styles.chipContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    sortBy === option.value && styles.activeChip
                  ]}
                  onPress={() => onSortChange(option.value)}
                >
                  <Text style={[
                    styles.chipText,
                    sortBy === option.value && styles.activeChipText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Show Completed Toggle */}
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={onToggleCompleted}
          >
            <Text style={styles.toggleLabel}>Show Completed Tasks</Text>
            <View style={[styles.toggle, showCompleted && styles.activeToggle]}>
              <View style={[styles.toggleThumb, showCompleted && styles.activeToggleThumb]} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  filterToggle: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 12,
  },
  activeFilterToggle: {
    backgroundColor: '#3498DB',
  },
  filterToggleText: {
    fontSize: 16,
  },
  activeFilterToggleText: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: '#3498DB',
  },
  chipText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  priorityChip: {
    // Add specific styles for priority chips if needed
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  activeToggle: {
    backgroundColor: '#4ECDC4',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  activeToggleThumb: {
    alignSelf: 'flex-end',
  },
});

export default TaskFilter;
