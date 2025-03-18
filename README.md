# Filter Fixation

A powerful image processing web application built with Streamlit that allows users to apply various filters and effects to their images.

## Features

- Basic image adjustments (brightness, contrast, saturation, sharpness, blur)
- Advanced filters (sepia, vignette, grayscale, invert, edge enhance, emboss, posterize)
- Image editing (rotation, flipping, cropping)
- Export options with compression and resizing
- Real-time preview
- Multiple export formats (JPEG, PNG, BMP, WebP)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/filter-fixation.git
cd filter-fixation
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
streamlit run app.py
```

## Usage

1. Upload an image using the sidebar
2. Use the tabs to access different editing features:
   - Basic Filters: Adjust brightness, contrast, saturation, etc.
   - Advanced Filters: Apply special effects like sepia, vignette, etc.
   - Image Editing: Rotate, flip, or crop the image
   - Export: Compress, resize, and download the processed image

## Live Demo

Visit [Streamlit Cloud](https://your-app-url.streamlit.app) to try the application.

## License

MIT License
