import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function ImageUploader({ onUpload, multiple = false, className = '' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(async (files) => {
    setIsLoading(true);
    try {
      const fileList = Array.from(files);
      console.log('Files to upload:', fileList.length);
      
      if (multiple) {
        const uploadPromises = fileList.map(async (file) => {
          console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
          
          // Validate file size (25MB = 25 * 1024 * 1024 bytes)
          if (file.size > 25 * 1024 * 1024) {
            throw new Error(`File ${file.name} is too large. Maximum size is 25MB.`);
          }
          
          // Pass the file object directly to the integration
          const result = await UploadFile({ file: file });
          console.log('Upload result:', result);
          return result.file_url;
        });
        
        const results = await Promise.all(uploadPromises);
        onUpload(results);
      } else {
        if (fileList.length > 0) {
          const file = fileList[0];
          console.log('Uploading single file:', file.name, 'Size:', file.size, 'Type:', file.type);
          
          // Validate file size (25MB = 25 * 1024 * 1024 bytes)
          if (file.size > 25 * 1024 * 1024) {
            throw new Error(`File is too large. Maximum size is 25MB.`);
          }
          
          // Pass the file object directly to the integration
          const result = await UploadFile({ file: file });
          console.log('Upload result:', result);
          onUpload(result.file_url);
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      console.error("Error details:", error.message, error.stack);
      alert(`Image upload failed: ${error.message}. Please try a different image or check your internet connection.`);
    } finally {
      setIsLoading(false);
    }
  }, [onUpload, multiple]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => {
      console.log('Dropped file:', file.name, file.type, file.size);
      return file.type.startsWith('image/');
    });
    
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    } else {
      alert('Please drop only image files (PNG, JPG, GIF).');
    }
  }, [handleFiles]);

  const handleChange = (e) => {
    console.log('File input changed:', e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        console.log('Selected file:', file.name, file.type, file.size);
        return file.type.startsWith('image/');
      });
      
      if (selectedFiles.length > 0) {
        handleFiles(selectedFiles);
      } else {
        alert('Please select only image files (PNG, JPG, GIF).');
      }
    }
    
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };
  
  const onButtonClick = () => {
    console.log('Upload button clicked');
    if (inputRef.current) {
        inputRef.current.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        onChange={handleChange}
        accept="image/*"
      />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
          <p className="text-slate-400">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-slate-300">Drag &amp; drop image(s) here, or click to select</p>
          <p className="text-xs text-slate-500">PNG, JPG, GIF up to 25MB</p>
        </div>
      )}
    </div>
  );
}