/**
 * uploadService.ts
 * ────────────────
 * Draws a url string from a locally picked image file.
 * TODO:
 * 1. `ImagePicker.launchImageLibraryAsync({ base64: true })` -> asset.base64
 * 2. POST base64 to `POST /api/v1/uploads/image` which stores the file in
 *    MongoDB and returns `{ url }` — this url is what gets saved on the menu item.
 */
import { apiRequest } from './apiClient';

export interface UploadedImage {
  url: string;
}

/**
 * Upload a base64-encoded image (with an optional mime/ext).
 * Returns the public URL of the stored image.
 */
export function uploadImageBase64(dataUri: string, ext?: string): Promise<string> {
  return apiRequest<UploadedImage>(
    '/uploads/image',
    {
      method: 'POST',
      body: JSON.stringify({ data: dataUri, ext }),
    },
    true,
  ).then((res) => res.url);
}