export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface IStorageProvider {
  /**
   * Uploads a file and returns the public URL to access it
   * @param file Buffer of the file
   * @param fileName Original or generated name of the file
   * @param mimeType MimeType of the file to set Content-Type correctly
   * @param path Optional folder path (e.g., 'exams/patient-1')
   * @returns Public URL of the uploaded file
   */
  upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
    path?: string,
  ): Promise<string>;

  /**
   * Deletes a file from storage
   * @param fileUrl The full URL or key of the file to delete
   */
  delete(fileUrl: string): Promise<void>;
}
