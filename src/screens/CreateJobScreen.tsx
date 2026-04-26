import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Picker,
} from 'react-native';
import { useJobStore } from '@store/jobStore';
import { CreateJobFormData } from '@types/index';

interface CreateJobScreenProps {
  navigation: any;
  route?: any;
}

const CreateJobScreen: React.FC<CreateJobScreenProps> = ({ navigation, route }) => {
  const isEditing = route?.params?.jobId ? true : false;
  const { createJob, updateJob, loading } = useJobStore();

  const [formData, setFormData] = useState<CreateJobFormData>({
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: keyof CreateJobFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a job title');
      return false;
    }

    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Please enter a location');
      return false;
    }

    if (!formData.dueDate) {
      Alert.alert('Validation Error', 'Please select a due date');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        // TODO: Implement edit functionality
        // await updateJob(route.params.jobId, formData);
        Alert.alert('Success', 'Job updated successfully');
      } else {
        await createJob({
          ...formData,
          status: 'pending',
          assignedTo: 'Current User', // TODO: Get from auth
        });
        Alert.alert('Success', 'Job created successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save job');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formSection}>
        <Text style={styles.label}>Job Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter job title"
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          placeholderTextColor="#ccc"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter job location"
          value={formData.location}
          onChangeText={(value) => handleInputChange('location', value)}
          placeholderTextColor="#ccc"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter job description"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#ccc"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={formData.priority}
            onValueChange={(value) => handleInputChange('priority', value)}
          >
            <Picker.Item label="Low" value="low" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="High" value="high" />
          </Picker>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Due Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={formData.dueDate}
          onChangeText={(value) => handleInputChange('dueDate', value)}
          placeholderTextColor="#ccc"
        />
        {/* TODO: Implement DatePickerIOS for iOS and DatePickerAndroid for Android */}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEditing ? 'Update Job' : 'Create Job'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  textArea: {
    height: 100,
    paddingTop: 10,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  actions: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateJobScreen;
