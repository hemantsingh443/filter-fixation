
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RefreshCcw,
  Sliders,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Crop as CropIcon,
  FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ImageFilterPreview from '@/components/ImageFilterPreview';
import FilterSlider from '@/components/FilterSlider';
import FilterPreset from '@/components/FilterPreset';
import ImageCropper from '@/components/ImageCropper';
import ImageCompressor from '@/components/ImageCompressor';
import { FILTER_PRESETS } from '@/data/filterPresets';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Index = () => {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilterSet, setActiveFilterSet] = useState('basic');
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<'filter' | 'crop' | 'compress' | null>('filter');
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Track compression stats
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    blur: 0,
    invert: 0
  });

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target) {
          const imageDataUrl = event.target.result as string;
          setImage(imageDataUrl);
          setOriginalImage(imageDataUrl);
          resetFilters();
          setCurrentPreset(null);
          setCompressionRatio(null);
          
          toast({
            title: "Image uploaded successfully",
            description: "Your image is ready for editing",
          });
        }
        setIsLoading(false);
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      blur: 0,
      invert: 0
    });
    setCurrentPreset(null);
    
    toast({
      title: "Filters reset",
      description: "All adjustments have been reset to default",
    });
  };

  // Apply preset filter
  const applyPreset = (presetName: string) => {
    const preset = FILTER_PRESETS.find(p => p.id === presetName);
    if (preset) {
      setFilters(preset.values);
      setCurrentPreset(presetName);
      
      toast({
        title: `${preset.name} applied`,
        description: "Filter preset has been applied to your image",
      });
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!image) return;
    
    // Create a temporary canvas to apply filters
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Apply filters to canvas
        ctx.filter = `
          brightness(${filters.brightness}%) 
          contrast(${filters.contrast}%) 
          saturate(${filters.saturation}%) 
          grayscale(${filters.grayscale}%) 
          sepia(${filters.sepia}%) 
          hue-rotate(${filters.hueRotate}deg)
          blur(${filters.blur}px)
          invert(${filters.invert}%)
        `;
        
        ctx.drawImage(img, 0, 0);
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'filtered-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Image downloaded",
          description: "Your filtered image has been saved",
        });
      }
    };
    
    img.src = image;
  };

  // CSS filter string
  const getFilterString = () => {
    return `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      grayscale(${filters.grayscale}%) 
      sepia(${filters.sepia}%) 
      hue-rotate(${filters.hueRotate}deg)
      blur(${filters.blur}px)
      invert(${filters.invert}%)
    `;
  };

  // Revert to original image
  const revertToOriginal = () => {
    if (originalImage) {
      setImage(originalImage);
      resetFilters();
      setCompressionRatio(null);
      
      toast({
        title: "Reverted to original",
        description: "Your image has been restored to its original state",
      });
    }
  };

  // Handle crop completion
  const handleCropComplete = (croppedImageUrl: string) => {
    setImage(croppedImageUrl);
    setEditingMode('filter');
    
    toast({
      title: "Image cropped",
      description: "Your image has been cropped successfully",
    });
  };

  // Handle compression completion
  const handleCompressionComplete = (compressedImageUrl: string, ratio: number) => {
    setImage(compressedImageUrl);
    setCompressionRatio(ratio);
    setEditingMode('filter');
    
    toast({
      title: "Image compressed",
      description: `Reduced to ${ratio.toFixed(1)}% of original size`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center"
      >
        <div className="flex items-center">
          <span className="text-xl font-medium text-gray-900">Filter Fixation</span>
          <span className="ml-2 text-sm px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">Beta</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {image && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={revertToOriginal} 
                className="flex items-center"
              >
                <RefreshCcw className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
              
              <Button 
                size="sm" 
                onClick={downloadImage}
                className="flex items-center"
              >
                <Download className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center"
          >
            <Upload className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Upload Image</span>
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </motion.header>

      <div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden">
        {/* Image Preview Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full md:w-3/4 h-full flex items-center justify-center bg-[#fafafa] p-4 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full w-full"
              >
                <div className="h-16 w-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 text-sm">Loading your image...</p>
              </motion.div>
            ) : image ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative max-w-full max-h-full flex items-center justify-center"
              >
                {editingMode === 'filter' && (
                  <div className="relative rounded-lg overflow-hidden shadow-lg transition-all duration-500">
                    <img
                      src={image}
                      alt="Uploaded"
                      style={{ filter: getFilterString() }}
                      className="max-h-[70vh] object-contain transition-all duration-300"
                    />
                    
                    {compressionRatio !== null && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        Compressed: {compressionRatio.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}
                
                {editingMode === 'crop' && image && (
                  <Sheet defaultOpen={true} onOpenChange={(open) => !open && setEditingMode('filter')}>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <ImageCropper 
                        imageUrl={image} 
                        onCropComplete={handleCropComplete}
                        onCancel={() => setEditingMode('filter')}
                      />
                    </SheetContent>
                  </Sheet>
                )}
                
                {editingMode === 'compress' && image && (
                  <Sheet defaultOpen={true} onOpenChange={(open) => !open && setEditingMode('filter')}>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <ImageCompressor 
                        imageUrl={image} 
                        onCompressionComplete={handleCompressionComplete}
                        onCancel={() => setEditingMode('filter')}
                      />
                    </SheetContent>
                  </Sheet>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full w-full max-w-md text-center"
              >
                <div 
                  className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mb-6 cursor-pointer"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-medium text-gray-800 mb-2">Start by uploading an image</h2>
                <p className="text-gray-500 mb-6">Supported formats: JPG, PNG, GIF</p>
                <Button 
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select an Image
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Controls Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "md:w-1/4 bg-white border-l border-gray-100 overflow-auto transition-all duration-300",
            !image && "opacity-50 pointer-events-none"
          )}
        >
          {image && (
            <div className="p-4">
              {/* Edit Mode Selector */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Edit Tools</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={editingMode === 'filter' ? "default" : "outline"}
                    className="flex flex-col items-center justify-center py-3 h-auto"
                    onClick={() => setEditingMode('filter')}
                  >
                    <Sliders className="h-5 w-5 mb-1" />
                    <span className="text-xs">Filters</span>
                  </Button>
                  <Button
                    variant={editingMode === 'crop' ? "default" : "outline"}
                    className="flex flex-col items-center justify-center py-3 h-auto"
                    onClick={() => setEditingMode('crop')}
                  >
                    <CropIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Crop</span>
                  </Button>
                  <Button
                    variant={editingMode === 'compress' ? "default" : "outline"}
                    className="flex flex-col items-center justify-center py-3 h-auto"
                    onClick={() => setEditingMode('compress')}
                  >
                    <FileDown className="h-5 w-5 mb-1" />
                    <span className="text-xs">Compress</span>
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {editingMode === 'filter' && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Filter Presets</h3>
                  <div className="flex overflow-x-auto pb-4 space-x-3 scrollbar-hide">
                    {FILTER_PRESETS.map((preset) => (
                      <FilterPreset
                        key={preset.id}
                        preset={preset}
                        isActive={currentPreset === preset.id}
                        onClick={() => applyPreset(preset.id)}
                      />
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mt-6">
                    <Tabs defaultValue="basic" onValueChange={setActiveFilterSet}>
                      <TabsList className="w-full mb-4">
                        <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                        <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic">
                        <div className="space-y-6">
                          <FilterSlider
                            label="Brightness"
                            value={[filters.brightness]}
                            min={0}
                            max={200}
                            step={1}
                            onChange={(value) => setFilters({ ...filters, brightness: value[0] })}
                          />
                          
                          <FilterSlider
                            label="Contrast"
                            value={[filters.contrast]}
                            min={0}
                            max={200}
                            step={1}
                            onChange={(value) => setFilters({ ...filters, contrast: value[0] })}
                          />
                          
                          <FilterSlider
                            label="Saturation"
                            value={[filters.saturation]}
                            min={0}
                            max={200}
                            step={1}
                            onChange={(value) => setFilters({ ...filters, saturation: value[0] })}
                          />
                          
                          <FilterSlider
                            label="Grayscale"
                            value={[filters.grayscale]}
                            min={0}
                            max={100}
                            step={1}
                            onChange={(value) => setFilters({ ...filters, grayscale: value[0] })}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="advanced">
                        <div className="space-y-6">
                          <FilterSlider
                            label="Sepia"
                            value={[filters.sepia]}
                            min={0}
                            max={100}
                            step={1}
                            onChange={(value) => setFilters({ ...filters, sepia: value[0] })}
                          />
                          
                          <FilterSlider
                            label="Hue Rotate"
                            value={[filters.hueRotate]}
                            min={0}
                            max={360}
                            step={1}
                            onChange={(value) => setFilters({ ...filters, hueRotate: value[0] })}
                          />
                          
                          <FilterSlider
                            label="Blur"
                            value={[filters.blur]}
                            min={0}
                            max={20}
                            step={0.1}
                            onChange={(value) => setFilters({ ...filters, blur: value[0] })}
                          />
                          
                          <FilterSlider
                            label="Invert"
                            value={[filters.invert]}
                            min={0}
                            max={100}
                            step={1}
                            onChange={(value) => setFilters({ ...filters, invert: value[0] })}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="mt-8 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="flex items-center"
                      >
                        <RefreshCcw className="mr-2 h-3 w-3" />
                        Reset Filters
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadImage}
                        className="flex items-center"
                      >
                        <Download className="mr-2 h-3 w-3" />
                        Save Image
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
