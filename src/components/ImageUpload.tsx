import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Request specifically the rear camera
      const constraints = {
        video: {
          facingMode: 'environment' // This requests the rear camera
        }
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create video element to display the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Wait for the video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve);
        };
      });

      // Create canvas and capture the image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      context.drawImage(video, 0, 0);

      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          onImageSelect(file);
        }
        // Stop all tracks to release the camera
        stream.getTracks().forEach(track => track.stop());
      }, 'image/jpeg');
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex gap-4">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </Button>
        <Button 
          onClick={handleCameraCapture}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Take Photo
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;