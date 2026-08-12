import { api } from "@/lib/api";

export interface UploadResponse {
  success: boolean;
  message?: string;
  data: {
    url: string;
    publicId: string;
  };
}

export const uploadApi = {
  /**
   * Uploads an image file or base64 data URI to Cloudinary via backend API and returns the Cloudinary CDN URL
   */
  uploadImage: async (file: File | string, folder = "kawanf/uploads"): Promise<string> => {
    if (typeof file === "string") {
      // Base64 Data URI string
      const res = await api.post<UploadResponse>("/upload/image", { image: file, folder });
      return res.data?.data?.url;
    }

    // Binary File FormData upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await api.post<UploadResponse>("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data?.data?.url;
  },
};
