
import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface FilterSliderProps {
  label: string;
  value: number[];
  min: number;
  max: number;
  step: number;
  onChange: (value: number[]) => void;
}

const FilterSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange
}: FilterSliderProps) => {
  // Calculate percentage for visual display
  const percentage = ((value[0] - min) / (max - min)) * 100;
  
  // Default value indicator based on filter type
  const defaultValue = label === 'Brightness' || label === 'Contrast' || label === 'Saturation' ? 100 : 0;
  const isAtDefault = value[0] === defaultValue;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center">
          {!isAtDefault && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-blue-500 mr-2 hover:underline"
              onClick={() => onChange([defaultValue])}
            >
              Reset
            </motion.button>
          )}
          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
            {value[0].toFixed(label === 'Blur' ? 1 : 0)}
            {label === 'Hue Rotate' ? '°' : '%'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onValueChange={onChange}
          className={cn(
            "flex-1",
            isAtDefault ? "" : "slider-modified"
          )}
        />
      </div>
    </div>
  );
};

export default FilterSlider;
