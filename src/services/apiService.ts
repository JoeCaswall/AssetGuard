import axios, { AxiosInstance } from 'axios';
import { InspectionJob, ApiResponse } from '@types/index';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Configure API endpoint - update this with your actual backend
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        // const token = await getStoredAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch all jobs from backend
   */
  async fetchJobs(): Promise<InspectionJob[]> {
    try {
      const response = await this.client.get<ApiResponse<InspectionJob[]>>('/jobs');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  /**
   * Fetch single job from backend
   */
  async fetchJob(jobId: string): Promise<InspectionJob> {
    try {
      const response = await this.client.get<ApiResponse<InspectionJob>>(`/jobs/${jobId}`);
      if (!response.data.data) throw new Error('Job not found');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  /**
   * Create job on backend
   */
  async createJob(job: InspectionJob): Promise<InspectionJob> {
    try {
      const response = await this.client.post<ApiResponse<InspectionJob>>('/jobs', job);
      if (!response.data.data) throw new Error('Failed to create job');
      return response.data.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Update job on backend
   */
  async updateJob(jobId: string, updates: Partial<InspectionJob>): Promise<InspectionJob> {
    try {
      const response = await this.client.put<ApiResponse<InspectionJob>>(
        `/jobs/${jobId}`,
        updates
      );
      if (!response.data.data) throw new Error('Failed to update job');
      return response.data.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  /**
   * Delete job on backend
   */
  async deleteJob(jobId: string): Promise<void> {
    try {
      await this.client.delete(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  /**
   * Sync local changes to backend
   */
  async syncJobs(jobs: InspectionJob[]): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        await this.updateJob(job.id, job);
        synced++;
      } catch (error) {
        console.error(`Failed to sync job ${job.id}:`, error);
        failed++;
      }
    }

    return { synced, failed };
  }

  /**
   * Upload image
   */
  async uploadImage(jobId: string, imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `job-${jobId}-${Date.now()}.jpg`,
      } as any);

      const response = await this.client.post<ApiResponse<{ imageUrl: string }>>(
        '/uploads/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data?.imageUrl || '';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
