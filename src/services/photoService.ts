/**
 * Photo management service
 * Handles storing, retrieving, and uploading photos
 */

import { Photo } from '../types';

export interface IPhotoService {
  savePhoto(jobId: string, uri: string, caption?: string): Promise<Photo>;
  getPhotosByJob(jobId: string): Promise<Photo[]>;
  deletePhoto(photoId: string): Promise<void>;
  uploadPhotos(jobId: string): Promise<void>;
}

/**
 * PhotoService implementation
 * TODO: Implement photo storage and upload logic
 */
class PhotoService implements IPhotoService {
  async savePhoto(jobId: string, uri: string, caption?: string): Promise<Photo> {
    throw new Error('Not implemented');
  }

  async getPhotosByJob(jobId: string): Promise<Photo[]> {
    throw new Error('Not implemented');
  }

  async deletePhoto(photoId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async uploadPhotos(jobId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

export default new PhotoService();
