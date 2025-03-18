
import React from 'react';
import { cn } from '@/lib/utils';

interface ImageFilterPreviewProps {
  imageUrl: string;
  filterString: string;
  className?: string;
}

const ImageFilterPreview = ({
  imageUrl,
  filterString,
  className
}: ImageFilterPreviewProps) => {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <img
        src={imageUrl}
        alt="Preview"
        style={{ filter: filterString }}
        className="w-full h-full object-cover transition-all duration-300"
      />
    </div>
  );
};

export default ImageFilterPreview;
