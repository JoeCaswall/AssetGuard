import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useJobStore } from '@store/jobStore';
import { formatDate, formatDaysUntilDue, getDaysUntilDue } from '@utils/dateUtils';
import { InspectionJob } from '@types/index';

interface JobDetailScreenProps {
  route: any;
  navigation: any;
}

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const { selectedJob, loading, error, loadJobById, completeJob, deleteJob } = useJobStore();

  useEffect(() => {
    loadJobById(jobId);
  }, [jobId]);

  const handleCompleteJob = async () => {
    Alert.alert('Complete Job', 'Are you sure you want to mark this job as completed?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            await completeJob(jobId);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Failed to complete job');
          }
        },
      },
    ]);
  };

  const handleDeleteJob = async () => {
    Alert.alert('Delete Job', 'Are you sure you want to delete this job?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteJob(jobId);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete job');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditJob = () => {
    navigation.navigate('EditJob', { jobId });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !selectedJob) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error || 'Job not found'}</Text>
      </View>
    );
  }

  const daysUntilDue = getDaysUntilDue(selectedJob.dueDate);
  const isCompleted = selectedJob.status === 'completed';

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>{selectedJob.title}</Text>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(selectedJob.status) },
            ]}
          >
            {selectedJob.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Priority and Due Date */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Priority:</Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(selectedJob.priority) },
            ]}
          >
            <Text style={styles.priorityText}>{selectedJob.priority.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={styles.value}>{formatDate(selectedJob.dueDate, 'short')}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: isCompleted ? '#34C759' : '#999' }]}>
            {formatDaysUntilDue(daysUntilDue)}
          </Text>
        </View>
      </View>

      {/* Location and Assignment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Assignment</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{selectedJob.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Assigned To:</Text>
          <Text style={styles.value}>{selectedJob.assignedTo || 'Unassigned'}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{selectedJob.description || 'No description'}</Text>
      </View>

      {/* Notes */}
      {selectedJob.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.description}>{selectedJob.notes}</Text>
        </View>
      )}

      {/* Timestamps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{formatDate(selectedJob.createdAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Updated:</Text>
          <Text style={styles.value}>{formatDate(selectedJob.updatedAt)}</Text>
        </View>

        {selectedJob.completedAt && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Completed:</Text>
            <Text style={styles.value}>{formatDate(selectedJob.completedAt)}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isCompleted && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCompleteJob}
            >
              <Text style={styles.buttonText}>Mark as Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleEditJob}
            >
              <Text style={styles.buttonTextSecondary}>Edit Job</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleDeleteJob}
        >
          <Text style={styles.buttonText}>Delete Job</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#34C759',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    fontSize: 16,
  },
});

export default JobDetailScreen;
