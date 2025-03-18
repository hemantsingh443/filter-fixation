
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterPreset as FilterPresetType } from '@/data/filterPresets';

interface FilterPresetProps {
  preset: FilterPresetType;
  isActive: boolean;
  onClick: () => void;
}

const FilterPreset = ({ preset, isActive, onClick }: FilterPresetProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex-shrink-0 cursor-pointer flex flex-col items-center space-y-2 group transition-all duration-300",
        isActive ? "scale-110" : ""
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-lg overflow-hidden relative shadow-sm border border-gray-200 transition-all duration-300",
        isActive ? "ring-2 ring-blue-500 border-transparent" : "",
        "hover:shadow-md"
      )}>
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${preset.preview || '/placeholder.svg'})`,
            filter: `
              brightness(${preset.values.brightness}%) 
              contrast(${preset.values.contrast}%) 
              saturate(${preset.values.saturation}%) 
              grayscale(${preset.values.grayscale}%) 
              sepia(${preset.values.sepia}%) 
              hue-rotate(${preset.values.hueRotate}deg)
              blur(${preset.values.blur}px)
            `
          }}
        ></div>
        
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center"
          >
            <Check className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </div>
      
      <span className={cn(
        "text-xs text-center font-medium transition-colors duration-300",
        isActive ? "text-blue-600" : "text-gray-600 group-hover:text-gray-900"
      )}>
        {preset.name}
      </span>
    </motion.div>
  );
};

export default FilterPreset;
