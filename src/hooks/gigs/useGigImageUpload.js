import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gigService } from '@/api/gigService';
import { toast } from 'sonner';

export const useGigImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for getting upload URL
  const getUploadUrlMutation = useMutation({
    mutationFn: gigService.getGigImageUploadUrl,
    onError: (error) => {
      toast.error(`Failed to prepare upload: ${error.message}`);
    }
  });

  // Mutation for confirming upload
  const confirmUploadMutation = useMutation({
    mutationFn: gigService.confirmGigImageUpload,
    onSuccess: (data) => {
      toast.success('Gig image uploaded successfully!');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gig'] });
    },
    onError: (error) => {
      toast.error(`Failed to save image: ${error.message}`);
    }
  });

  // Mutation for deleting image
  const deleteImageMutation = useMutation({
    mutationFn: gigService.deleteGigImage,
    onSuccess: () => {
      toast.success('Gig image deleted successfully!');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gig'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete image: ${error.message}`);
    }
  });

  // Main upload function
  const uploadImage = async (file, gigId) => {
    if (!file || !gigId) {
      toast.error('File and gig ID are required');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Step 1: Get presigned URL
      const uploadUrlResponse = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      });

      const { presignedUrl, s3Key, publicUrl } = uploadUrlResponse.data.data;

      // Step 2: Upload to S3
      setUploadProgress(25);

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3');
      }

      setUploadProgress(75);

      // Step 3: Confirm upload with backend
      await confirmUploadMutation.mutateAsync({
        gigId,
        s3Key,
        publicUrl
      });

      setUploadProgress(100);

      return {
        success: true,
        s3Key,
        publicUrl
      };

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Delete image function
  const deleteImage = async (gigId) => {
    if (!gigId) {
      toast.error('Gig ID is required');
      return;
    }

    try {
      await deleteImageMutation.mutateAsync(gigId);
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    uploadProgress,
    isGettingUploadUrl: getUploadUrlMutation.isPending,
    isConfirming: confirmUploadMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
    error: getUploadUrlMutation.error || confirmUploadMutation.error || deleteImageMutation.error
  };
};