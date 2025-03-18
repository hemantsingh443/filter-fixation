
export interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  blur: number;
  invert: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  preview?: string;
  values: FilterValues;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Normal',
    preview: '/placeholder.svg',
    values: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'mono',
    name: 'Mono',
    preview: '/placeholder.svg',
    values: {
      brightness: 100,
      contrast: 100,
      saturation: 0,
      grayscale: 100,
      sepia: 0,
      hueRotate: 0,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'vintage',
    name: 'Vintage',
    preview: '/placeholder.svg',
    values: {
      brightness: 90,
      contrast: 110,
      saturation: 85,
      grayscale: 0,
      sepia: 40,
      hueRotate: 0,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'vivid',
    name: 'Vivid',
    preview: '/placeholder.svg',
    values: {
      brightness: 105,
      contrast: 120,
      saturation: 130,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'muted',
    name: 'Muted',
    preview: '/placeholder.svg',
    values: {
      brightness: 100,
      contrast: 90,
      saturation: 80,
      grayscale: 10,
      sepia: 10,
      hueRotate: 0,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'warm',
    name: 'Warm',
    preview: '/placeholder.svg',
    values: {
      brightness: 102,
      contrast: 105,
      saturation: 110,
      grayscale: 0,
      sepia: 30,
      hueRotate: 20,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'cool',
    name: 'Cool',
    preview: '/placeholder.svg',
    values: {
      brightness: 100,
      contrast: 105,
      saturation: 95,
      grayscale: 0,
      sepia: 0,
      hueRotate: 180,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    preview: '/placeholder.svg',
    values: {
      brightness: 90,
      contrast: 140,
      saturation: 90,
      grayscale: 40,
      sepia: 0,
      hueRotate: 0,
      blur: 0,
      invert: 0
    }
  },
  {
    id: 'dream',
    name: 'Dream',
    preview: '/placeholder.svg',
    values: {
      brightness: 110,
      contrast: 85,
      saturation: 90,
      grayscale: 0,
      sepia: 15,
      hueRotate: 0,
      blur: 1.5,
      invert: 0
    }
  }
];
