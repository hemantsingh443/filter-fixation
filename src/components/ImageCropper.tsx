
import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Check, X, Crop as CropIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  className?: string;
}

// This function is used to create a centered crop with a specific aspect ratio
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropper = ({
  imageUrl,
  onCropComplete,
  onCancel,
  className
}: ImageCropperProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const imgRef = useRef<HTMLImageElement>(null);
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const handleAspectChange = (value: string) => {
    if (value === 'free') {
      setAspect(undefined);
    } else if (value === 'square') {
      setAspect(1);
    } else if (value === '16:9') {
      setAspect(16 / 9);
    } else if (value === '4:3') {
      setAspect(4 / 3);
    } else if (value === '3:4') {
      setAspect(3 / 4);
    } else if (value === '9:16') {
      setAspect(9 / 16);
    }
    
    // Reset crop if we're switching aspect ratios
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current;
      const newAspect = value === 'free' ? undefined : aspect;
      if (newAspect) {
        setCrop(centerAspectCrop(width, height, newAspect));
      } else {
        setCrop(undefined);
      }
    }
  };

  const handleComplete = () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // Convert canvas to data URL and pass it to the parent component
    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    onCropComplete(croppedImageUrl);
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <CropIcon className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium">Crop Image</h2>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="16:9" onValueChange={handleAspectChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Aspect Ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="square">1:1</SelectItem>
              <SelectItem value="16:9">16:9</SelectItem>
              <SelectItem value="4:3">4:3</SelectItem>
              <SelectItem value="3:4">3:4</SelectItem>
              <SelectItem value="9:16">9:16</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative max-h-[60vh] overflow-auto border border-gray-200 rounded-lg">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          minHeight={50}
        >
          <img
            ref={imgRef}
            alt="Crop"
            src={imageUrl}
            onLoad={onImageLoad}
            className="max-w-full"
          />
        </ReactCrop>
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel} className="flex items-center">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleComplete} className="flex items-center">
          <Check className="w-4 h-4 mr-2" />
          Apply Crop
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;
