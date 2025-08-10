import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const TaskStats = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.done).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(task => 
    !task.done && 
    task.dueDate && 
    new Date(task.dueDate) < new Date()
  ).length;

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityStats = {
    high: tasks.filter(task => !task.done && task.priority === 'high').length,
    medium: tasks.filter(task => !task.done && task.priority === 'medium').length,
    low: tasks.filter(task => !task.done && task.priority === 'low').length,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Task Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.totalCard]}>
          <Text style={styles.statNumber}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        
        <View style={[styles.statCard, styles.completedCard]}>
          <Text style={styles.statNumber}>{completedTasks}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={[styles.statCard, styles.pendingCard]}>
          <Text style={styles.statNumber}>{pendingTasks}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={[styles.statCard, styles.overdueCard]}>
          <Text style={styles.statNumber}>{overdueTasks}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Completion Progress</Text>
          <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Priority Breakdown */}
      {pendingTasks > 0 && (
        <View style={styles.prioritySection}>
          <Text style={styles.priorityTitle}>Pending by Priority</Text>
          <View style={styles.priorityStats}>
            {priorityStats.high > 0 && (
              <View style={[styles.priorityItem, { backgroundColor: '#FF6B6B' }]}>
                <Text style={styles.priorityCount}>{priorityStats.high}</Text>
                <Text style={styles.priorityLabel}>High</Text>
              </View>
            )}
            {priorityStats.medium > 0 && (
              <View style={[styles.priorityItem, { backgroundColor: '#FFE66D' }]}>
                <Text style={[styles.priorityCount, { color: '#333' }]}>{priorityStats.medium}</Text>
                <Text style={[styles.priorityLabel, { color: '#333' }]}>Medium</Text>
              </View>
            )}
            {priorityStats.low > 0 && (
              <View style={[styles.priorityItem, { backgroundColor: '#4ECDC4' }]}>
                <Text style={styles.priorityCount}>{priorityStats.low}</Text>
                <Text style={styles.priorityLabel}>Low</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  totalCard: {
    backgroundColor: '#E3F2FD',
  },
  completedCard: {
    backgroundColor: '#E8F5E8',
  },
  pendingCard: {
    backgroundColor: '#FFF3E0',
  },
  overdueCard: {
    backgroundColor: '#FFEBEE',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  prioritySection: {
    marginTop: 4,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  priorityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priorityItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 60,
  },
  priorityCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priorityLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
});

export default TaskStats;
