
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Check, X, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCompressorProps {
  imageUrl: string;
  onCompressionComplete: (compressedImageUrl: string, compressionRatio: number) => void;
  onCancel: () => void;
  className?: string;
}

const ImageCompressor = ({
  imageUrl,
  onCompressionComplete,
  onCancel,
  className
}: ImageCompressorProps) => {
  const [quality, setQuality] = useState(80); // Default 80% quality
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionRatio, setCompressionRatio] = useState<number>(100);
  
  useEffect(() => {
    // Get the original image size
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        setOriginalSize(blob.size);
        // Initial compression preview
        compressImage(quality);
      });
  }, [imageUrl]);

  const compressImage = (qualityValue: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Convert to compressed data URL
      const compressed = canvas.toDataURL('image/jpeg', qualityValue / 100);
      setPreviewUrl(compressed);
      
      // Calculate compressed size
      fetch(compressed)
        .then(response => response.blob())
        .then(blob => {
          setCompressedSize(blob.size);
          const ratio = (blob.size / originalSize) * 100;
          setCompressionRatio(ratio);
        });
    };
    img.src = imageUrl;
  };

  const handleQualityChange = (value: number[]) => {
    const newQuality = value[0];
    setQuality(newQuality);
    compressImage(newQuality);
  };

  const handleComplete = () => {
    onCompressionComplete(previewUrl, compressionRatio);
  };

  // Format file size in KB or MB
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <FileDown className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium">Compress Image</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Quality</span>
              <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                {quality}%
              </span>
            </div>
            <Slider
              value={[quality]}
              min={5}
              max={100}
              step={5}
              onValueChange={handleQualityChange}
            />
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Original Size:</span>
              <span className="text-sm font-medium">{formatSize(originalSize)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Compressed Size:</span>
              <span className="text-sm font-medium">{formatSize(compressedSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Saved:</span>
              <span className="text-sm font-medium text-green-600">
                {originalSize > compressedSize 
                  ? `${(100 - compressionRatio).toFixed(1)}%` 
                  : '0%'
                }
              </span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Compressed Preview"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel} className="flex items-center">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleComplete} className="flex items-center">
          <Check className="w-4 h-4 mr-2" />
          Apply Compression
        </Button>
      </div>
    </div>
  );
};

export default ImageCompressor;
