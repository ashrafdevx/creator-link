import React from 'react';
import { 
  FileText, 
  Download, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image/')) return Image;
  if (mimeType?.startsWith('video/')) return Video;
  if (mimeType?.startsWith('audio/')) return Music;
  if (mimeType?.includes('pdf')) return FileText;
  if (mimeType?.includes('zip') || mimeType?.includes('compressed')) return Archive;
  return File;
};

const getFileTypeColor = (mimeType) => {
  if (mimeType?.startsWith('image/')) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (mimeType?.startsWith('video/')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (mimeType?.startsWith('audio/')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (mimeType?.includes('pdf')) return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (mimeType?.includes('zip') || mimeType?.includes('compressed')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileAttachment = ({ 
  attachment, 
  isOwner = false, 
  onDownload,
  onPreview,
  className 
}) => {
  const FileIcon = getFileIcon(attachment.mime_type);
  const isImage = attachment.mime_type?.startsWith('image/');
  const canPreview = isImage || attachment.mime_type?.includes('pdf');

  return (
    <div className={cn(
      "border border-slate-600 rounded-lg p-3 bg-slate-800/50 max-w-sm",
      className
    )}>
      {/* Image Preview */}
      {isImage && attachment.url && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={attachment.url}
            alt={attachment.original_name}
            className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
            onClick={() => onPreview?.(attachment)}
          />
        </div>
      )}

      {/* File Info */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg border flex-shrink-0",
          getFileTypeColor(attachment.mime_type)
        )}>
          <FileIcon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-white truncate">
                {attachment.original_name}
              </p>
              <p className="text-xs text-slate-400">
                {formatFileSize(attachment.size)}
              </p>
            </div>
            
            <Badge 
              variant="secondary" 
              className="text-xs bg-slate-700 text-slate-300 border-slate-600"
            >
              {attachment.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            {canPreview && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPreview?.(attachment)}
                className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDownload?.(attachment)}
              className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileAttachment;