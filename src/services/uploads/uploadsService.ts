import apiClient from '../api/client';

// ─── Request Types ────────────────────────────────────────────────────────────

export interface UploadFileData {
  uri: string;
  name: string;
  type: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string;
  publicId: string;
  resourceType: string;
}

export interface MyUploadResponse {
  id: string;
  url: string;
  publicId: string;
  resourceType: string;
  createdAt: string;
}

export interface SignedUrlResponse {
  url: string;
}

// ─── Uploads Service Functions ────────────────────────────────────────────────

/**
 * Uploads a file to the server.
 * @param file - File data with uri, name, and type
 * @returns Upload response with URL and public ID
 */
export async function uploadFile(file: UploadFileData): Promise<UploadResponse> {
  const formData = new FormData();

  // Append file to FormData with key 'file'
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const response = await apiClient.post<{ data: UploadResponse }>(
    '/uploads',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
}

/**
 * Fetches all uploads for the current employee.
 * @returns Array of upload objects
 */
export async function getMyUploads(): Promise<MyUploadResponse[]> {
  const response = await apiClient.get<{ data: MyUploadResponse[] }>(
    '/uploads/my',
  );
  return response.data.data;
}

/**
 * Fetches a signed URL for a specific upload.
 * @param publicId - Public ID of the upload
 * @returns Signed URL
 */
export async function getSignedUrl(publicId: string): Promise<SignedUrlResponse> {
  const response = await apiClient.get<SignedUrlResponse>(
    `/uploads/signed-url/${publicId}`,
  );
  return response.data;
}
