import apiClient from '../api/client';

// ─── Request Types ────────────────────────────────────────────────────────────

export interface UploadFileData {
  uri: string;
  name: string;
  type: string;
  projectId: string;
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
 * @param file - File data with uri, name, type, and projectId
 * @returns Upload response with URL and public ID
 */
export async function uploadFile(file: UploadFileData): Promise<UploadResponse> {
  const formData = new FormData();

  // Append file to FormData with key 'file' (React Native FormData format)
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  // Append projectId as a separate field (backend expects this)
  formData.append('projectId', file.projectId);

  // Backend returns upload object directly (no wrapping), but we only need url/publicId
  const response = await apiClient.post<any>(
    '/uploads',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  // Map backend response to our interface
  return {
    url: response.data.fileUrl,
    publicId: response.data.storageKey,
    resourceType: response.data.fileType,
  };
}

/**
 * Fetches all uploads for the current employee.
 * @returns Array of upload objects
 */
export async function getMyUploads(): Promise<MyUploadResponse[]> {
  const response = await apiClient.get<any>('/uploads/my');

  // Backend returns { data: [...], meta: {...} }
  return response.data.data.map((upload: any) => ({
    id: upload.id,
    url: upload.fileUrl,
    publicId: upload.storageKey,
    resourceType: upload.fileType,
    createdAt: upload.createdAt,
  }));
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
