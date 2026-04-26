import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useJobStore } from '@store/jobStore';
import { formatDaysUntilDue, getDaysUntilDue } from '@utils/dateUtils';
import { InspectionJob } from '@types/index';

interface JobsListScreenProps {
  navigation: any;
}

const JobsListScreen: React.FC<JobsListScreenProps> = ({ navigation }) => {
  const { jobs, loading, error, loadJobs } = useJobStore();

  useEffect(() => {
    loadJobs();
  }, []);

  const handleJobPress = (jobId: string) => {
    navigation.navigate('JobDetail', { jobId });
  };

  const renderJobItem = ({ item }: { item: InspectionJob }) => {
    const daysUntilDue = getDaysUntilDue(item.dueDate);
    const isOverdue = daysUntilDue < 0;

    return (
      <TouchableOpacity
        style={[styles.jobCard, isOverdue && styles.overdueCard]}
        onPress={() => handleJobPress(item.id)}
      >
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={[styles.jobStatus, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>

        <Text style={styles.jobLocation}>{item.location}</Text>
        <Text style={styles.jobDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.jobFooter}>
          <Text style={[styles.dueDate, isOverdue && styles.overdueText]}>
            {formatDaysUntilDue(daysUntilDue)}
          </Text>
          <Text style={[styles.priority, { backgroundColor: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'in-progress':
        return '#FF9500';
      case 'pending':
        return '#007AFF';
      default:
        return '#999';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No jobs yet</Text>
          <Text style={styles.emptyStateSubtext}>Create a new job to get started</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  jobLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  overdueText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  priority: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default JobsListScreen;
