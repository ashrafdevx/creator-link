import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useDeliverOrder,
  useRequestRevision,
  useCompleteOrder,
  useCancelOrder,
  useRateOrder,
} from '@/hooks/useOrderOperations';
import {
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
  Star,
  Upload,
  AlertTriangle,
  Loader2,
  X,
  File,
  Clock,
  MessageCircle,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

// Helper function to extract error message from API response
const getErrorMessage = (error) => {
  // Check if there are validation errors in the response
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
    // Get all validation error messages
    const validationMessages = error.response.data.errors.map(err => err.message);

    // Return the first validation message (or join them if multiple)
    return validationMessages.length === 1
      ? validationMessages[0]
      : validationMessages.join(', ');
  }

  // Skip the generic "Validation error" message if we couldn't extract specific errors
  if (error?.response?.data?.message === 'Validation error') {
    return 'Please check your input and try again';
  }

  // Check for general error message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Fallback to error.message or generic message
  return error?.message || 'An unexpected error occurred';
};

const DeliverDialog = ({ isOpen, onClose, orderId }) => {
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const deliver = useDeliverOrder();

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_FILES = 5;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const uploadFileToS3 = async (file) => {
    try {
      // Get presigned URL from backend
      const { data } = await api.post(`/api/orders/${orderId}/upload-url`, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadType: 'delivery'
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to get upload URL');
      }

      const { presignedUrl, s3Key, publicUrl } = data.data;

      // Upload file directly to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      return {
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        s3_key: s3Key
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    // Validate file count
    if (uploadedFiles.length + fileArray.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files`);
      return;
    }

    // Validate file size
    const oversizedFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the ${formatFileSize(MAX_FILE_SIZE)} size limit`);
      return;
    }

    setIsUploading(true);

    try {
      // Upload files to S3
      const uploadPromises = fileArray.map(file => uploadFileToS3(file));
      const uploadedFileData = await Promise.all(uploadPromises);

      setUploadedFiles(prev => [...prev, ...uploadedFileData]);
      toast.success(`${fileArray.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(`Failed to upload files: ${getErrorMessage(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = async (index) => {
    const fileToRemove = uploadedFiles[index];

    try {
      // Delete from S3
      await api.delete('/api/orders/file', {
        data: { s3Key: fileToRemove.s3_key }
      });

      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      toast.success('File removed');
    } catch (error) {
      toast.error('Failed to remove file');
    }
  };

  const handleDeliver = async () => {
    if (!description.trim()) {
      toast.error('Please provide a delivery message');
      return;
    }

    try {
      await deliver.mutateAsync({
        orderId,
        deliveryData: {
          description,
          attachments: uploadedFiles,
        },
      });

      // Reset state
      setDescription('');
      setUploadedFiles([]);
      toast.success('Order delivered successfully!');
      onClose();
    } catch (error) {
      console.error('Delivery error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleClose = () => {
    // Clean up uploaded files if dialog is closed without delivering
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        api.delete('/api/orders/file', {
          data: { s3Key: file.s3_key }
        }).catch(console.error);
      });
    }

    setDescription('');
    setUploadedFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Deliver Order</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload your work and add a delivery message
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="description" className="text-slate-300">
              Delivery Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're delivering..."
              className="mt-2 bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300">
              Attachments
              <span className="text-slate-500 text-xs ml-2">
                (Max {MAX_FILES} files, {formatFileSize(MAX_FILE_SIZE)} each)
              </span>
            </Label>

            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-slate-600 hover:border-slate-500'
              } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.mp4,.mov,.jpg,.jpeg,.png,.gif"
              />

              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 mb-2 text-purple-400 animate-spin" />
                  <p className="text-sm text-slate-400">Uploading files...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-400">
                    Drag and drop files or click to browse
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supported: PDF, DOC, XLS, ZIP, MP4, Images
                  </p>
                </>
              )}
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-white">{file.file_name}</p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDeliver}
            disabled={!description.trim() || deliver.isLoading || isUploading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {deliver.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Delivering...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Deliver Work
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RevisionDialog = ({ isOpen, onClose, orderId }) => {
  const [reason, setReason] = useState('');
  const requestRevision = useRequestRevision();

  const handleRequestRevision = async () => {
    if (reason.length < 10) {
      toast.error('Please provide a detailed reason for revision (at least 10 characters)');
      return;
    }

    try {
      await requestRevision.mutateAsync({ orderId, reason });
      toast.success('Revision request sent successfully!');
      setReason('');
      onClose();
    } catch (error) {
      console.error('Revision request error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Request Revision</DialogTitle>
          <DialogDescription className="text-slate-400">
            Explain what changes you need from the freelancer
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="reason" className="text-slate-300">
            Revision Details
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please describe the changes you need..."
            className="mt-2 min-h-[120px] bg-slate-800 border-slate-600 text-white"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRequestRevision}
            disabled={reason.length < 10 || requestRevision.isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {requestRevision.isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Request Revision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CancelDialog = ({ isOpen, onClose, orderId }) => {
  const [reason, setReason] = useState('');
  const cancel = useCancelOrder();

  const handleCancel = async () => {
    if (reason.length < 10) {
      toast.error('Please provide a detailed reason for cancellation (at least 10 characters)');
      return;
    }

    try {
      await cancel.mutateAsync({ orderId, reason });
      toast.success('Order cancelled successfully');
      setReason('');
      onClose();
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Cancel Order
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            This action cannot be undone. Please provide a reason for cancellation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="cancel-reason" className="text-slate-300">
            Cancellation Reason
          </Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you're cancelling this order..."
            className="mt-2 min-h-[100px] bg-slate-800 border-slate-600 text-white"
          />
        </div>
        <Alert className="bg-red-900/20 border-red-800">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-200">
            Cancelling may affect your account standing and refund eligibility.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Keep Order
          </Button>
          <Button
            onClick={handleCancel}
            disabled={reason.length < 10 || cancel.isLoading}
            variant="destructive"
          >
            {cancel.isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Cancel Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RatingDialog = ({ isOpen, onClose, orderId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const rateOrder = useRateOrder();

  const handleRate = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await rateOrder.mutateAsync({ orderId, rating, review });
      toast.success('Thank you for your rating!');
      setRating(0);
      setReview('');
      onClose();
    } catch (error) {
      console.error('Rating error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Rate Order</DialogTitle>
          <DialogDescription className="text-slate-400">
            Share your experience with this order
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-slate-300">Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      value <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review" className="text-slate-300">
              Review <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              className="mt-2 bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Skip
          </Button>
          <Button
            onClick={handleRate}
            disabled={rating === 0 || rateOrder.isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {rateOrder.isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Star className="w-4 h-4 mr-2" />
            )}
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const OrderActions = ({ order, userRole }) => {
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const complete = useCompleteOrder();

  const isClient = userRole === 'client';
  const isFreelancer = userRole === 'freelancer';

  const handleComplete = async () => {
    try {
      await complete.mutateAsync(order._id);
      toast.success('Order marked as complete! Payment will be released to the freelancer.');
    } catch (error) {
      console.error('Complete order error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  const canDeliver = isFreelancer && (order.status === 'active' || order.status === 'revision');
  const canRequestRevision = isClient && order.status === 'delivered' && order.revision_count < order.max_revisions;
  const canComplete = isClient && order.status === 'delivered';
  const canCancel = order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'delivered';

  // Updated rating logic: Freelancer can only rate after client has rated
  const canRate = order.status === 'completed' && (
    (isClient && !order.client_rating?.rating) ||
    (isFreelancer && !order.freelancer_rating?.rating && order.client_rating?.rating)
  );

  // Show message to freelancer if client hasn't rated yet
  const waitingForClientRating = isFreelancer &&
    order.status === 'completed' &&
    !order.client_rating?.rating &&
    !order.freelancer_rating?.rating;

  // Special handling for delivered orders (client review)
  if (isClient && order.status === 'delivered') {
    return (
      <>
        <div className="space-y-4">
          {/* Review Notice */}
          <div className="p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Order Delivered - Review Required</h4>
                <p className="text-sm text-slate-400 mb-3">
                  The freelancer has delivered the work. Please review it carefully and choose one of the following actions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Accept Order Button */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="mb-2">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <h5 className="text-white font-medium text-sm mb-1">Accept Delivery</h5>
                    <p className="text-xs text-slate-400 mb-3">
                      If you're satisfied with the work, accept it to complete the order and release payment.
                    </p>
                    <Button
                      onClick={handleComplete}
                      disabled={complete.isLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {complete.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept & Complete
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Request Revision Button */}
                  {order.revision_count < order.max_revisions && (
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="mb-2">
                        <RefreshCw className="w-6 h-6 text-orange-400" />
                      </div>
                      <h5 className="text-white font-medium text-sm mb-1">Request Revision</h5>
                      <p className="text-xs text-slate-400 mb-3">
                        Need changes? Request a revision ({order.max_revisions - order.revision_count} remaining).
                      </p>
                      <Button
                        onClick={() => setRevisionOpen(true)}
                        variant="outline"
                        className="w-full border-orange-500 text-orange-400 hover:bg-orange-900/20"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Request Changes
                      </Button>
                    </div>
                  )}
                </div>

                {/* No revisions left warning */}
                {order.revision_count >= order.max_revisions && (
                  <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded">
                    <p className="text-xs text-yellow-400">
                      ⚠️ No revisions remaining. You can only accept the delivery or contact support for help.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Need Help Option */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (window.$crisp) {
                  window.$crisp.push(['do', 'chat:open']);
                } else {
                  toast.error('Chat support is not available. Please try again.');
                }
              }}
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Need Help with Order?
            </Button>
          </div>
        </div>

        {/* Dialogs */}
        <RevisionDialog
          isOpen={revisionOpen}
          onClose={() => setRevisionOpen(false)}
          orderId={order._id}
        />

        <CancelDialog
          isOpen={cancelOpen}
          onClose={() => setCancelOpen(false)}
          orderId={order._id}
        />
      </>
    );
  }

  // Default button layout for other statuses
  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {canDeliver && (
            <Button
              onClick={() => setDeliverOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Package className="w-4 h-4 mr-2" />
              Deliver Work
            </Button>
          )}

          {canRate && (
            <Button
              onClick={() => setRatingOpen(true)}
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-900/20"
            >
              <Star className="w-4 h-4 mr-2" />
              Rate Order
            </Button>
          )}
        </div>

        {/* Support Section */}
        <div className="pt-3 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-2">
            Need support or want to cancel this order?
          </p>
          <Button
            onClick={() => {
              if (window.$crisp) {
                window.$crisp.push(['do', 'chat:open']);
              } else {
                toast.error('Chat support is not available. Please try again.');
              }
            }}
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-900/20"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>

        {/* Show waiting message for freelancer */}
        {waitingForClientRating && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-sm text-yellow-400">
                Waiting for client to rate the order before you can leave your review.
              </p>
            </div>
          </div>
        )}
      </div>

      <DeliverDialog
        isOpen={deliverOpen}
        onClose={() => setDeliverOpen(false)}
        orderId={order._id}
      />

      <RevisionDialog
        isOpen={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        orderId={order._id}
      />

      <CancelDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        orderId={order._id}
      />

      <RatingDialog
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        orderId={order._id}
      />
    </>
  );
};

export default OrderActions;