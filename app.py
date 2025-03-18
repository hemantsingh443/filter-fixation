import streamlit as st
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import numpy as np
import io
import base64

# Set page config and styling
st.set_page_config(page_title="Filter Fixation", page_icon="🎨", layout="wide")

# Custom CSS
st.markdown("""
    <style>
    .stButton>button {
        width: 100%;
        margin: 5px 0;
        background-color: #4CAF50;
        color: white;
    }
    .stButton>button:hover {
        background-color: #45a049;
    }
    .filter-section {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 10px 0;
    }
    .crop-preview {
        border: 2px dashed #4CAF50;
        padding: 10px;
        margin: 10px 0;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if "image" not in st.session_state:
    st.session_state.image = None
if "edited_image" not in st.session_state:
    st.session_state.edited_image = None
if "crop_coords" not in st.session_state:
    st.session_state.crop_coords = None
if "crop_mode" not in st.session_state:
    st.session_state.crop_mode = "Manual"
if "compression_settings" not in st.session_state:
    st.session_state.compression_settings = {
        "quality": 85,
        "format": "JPEG",
        "optimize": True,
        "progressive": False
    }

def apply_sepia(image):
    img_array = np.array(image)
    sepia_matrix = np.array([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131]
    ])
    sepia_array = img_array.dot(sepia_matrix.T)
    sepia_array = np.clip(sepia_array, 0, 255).astype(np.uint8)
    return Image.fromarray(sepia_array)

def apply_vignette(image, intensity=0.5):
    img_array = np.array(image)
    height, width = img_array.shape[:2]
    
    # Create radial gradient
    y, x = np.ogrid[:height, :width]
    center_y, center_x = height/2, width/2
    radius = np.sqrt((x - center_x)**2 + (y - center_y)**2)
    
    # Normalize radius
    max_radius = np.sqrt(center_x**2 + center_y**2)
    radius = radius / max_radius
    
    # Create vignette mask
    mask = 1 - (radius * intensity)
    mask = np.clip(mask, 0, 1)
    
    # Apply mask to each channel
    for i in range(3):
        img_array[:,:,i] = img_array[:,:,i] * mask
    
    return Image.fromarray(img_array.astype(np.uint8))

def compress_image(image, settings):
    """Compress image with advanced settings"""
    img_byte_arr = io.BytesIO()
    
    # Convert to RGB if needed for JPEG
    if settings["format"] == "JPEG" and image.mode != "RGB":
        image = image.convert("RGB")
    
    # Save with specified settings
    image.save(
        img_byte_arr,
        format=settings["format"],
        quality=settings["quality"],
        optimize=settings["optimize"],
        progressive=settings["progressive"]
    )
    
    img_byte_arr = img_byte_arr.getvalue()
    return Image.open(io.BytesIO(img_byte_arr))

def get_image_download_link(img, filename="filtered_image.png", text="Download Image"):
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    href = f'<a href="data:image/png;base64,{img_str}" download="{filename}">{text}</a>'
    return href

def apply_crop(image, crop_mode, aspect_ratio=None, crop_coords=None):
    """Apply cropping based on mode and parameters"""
    if crop_mode == "Manual":
        if crop_coords:
            return image.crop(crop_coords)
    elif crop_mode == "Aspect Ratio":
        if aspect_ratio:
            width, height = image.size
            if aspect_ratio > 1:  # Landscape
                new_width = int(height * aspect_ratio)
                left = (width - new_width) // 2
                return image.crop((left, 0, left + new_width, height))
            else:  # Portrait
                new_height = int(width / aspect_ratio)
                top = (height - new_height) // 2
                return image.crop((0, top, width, top + new_height))
    elif crop_mode == "Square":
        width, height = image.size
        size = min(width, height)
        left = (width - size) // 2
        top = (height - size) // 2
        return image.crop((left, top, left + size, top + size))
    return image

# Main app
st.title("🎨 Filter Fixation")
st.markdown("### Advanced Image Processing Tool")

# Sidebar for image upload and basic info
with st.sidebar:
    st.header("Image Upload")
    uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
    
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.session_state.image = image
        st.session_state.edited_image = image.copy()
        
        # Image information
        st.subheader("Image Information")
        st.write(f"Size: {image.size}")
        st.write(f"Mode: {image.mode}")
        st.write(f"Format: {image.format}")
        st.write(f"File Size: {uploaded_file.size / 1024:.2f} KB")

# Main content
if uploaded_file is not None:
    # Create tabs for different editing modes
    tabs = st.tabs(["Basic Filters", "Advanced Filters", "Image Editing", "Export"])
    
    # Basic Filters Tab
    with tabs[0]:
        st.subheader("Basic Adjustments")
        col1, col2 = st.columns(2)
        
        with col1:
            brightness = st.slider("Brightness", 0, 200, 100)
            contrast = st.slider("Contrast", 0, 200, 100)
            saturation = st.slider("Saturation", 0, 200, 100)
        
        with col2:
            sharpness = st.slider("Sharpness", 0, 200, 100)
            blur = st.slider("Blur", 0, 10, 0)
            
        # Apply basic filters
        processed = st.session_state.edited_image.copy()
        
        if brightness != 100:
            processed = ImageEnhance.Brightness(processed).enhance(brightness / 100)
        if contrast != 100:
            processed = ImageEnhance.Contrast(processed).enhance(contrast / 100)
        if saturation != 100:
            processed = ImageEnhance.Color(processed).enhance(saturation / 100)
        if sharpness != 100:
            processed = ImageEnhance.Sharpness(processed).enhance(sharpness / 100)
        if blur > 0:
            processed = processed.filter(ImageFilter.GaussianBlur(radius=blur))
            
        st.session_state.edited_image = processed
    
    # Advanced Filters Tab
    with tabs[1]:
        st.subheader("Advanced Filters")
        col1, col2 = st.columns(2)
        
        with col1:
            sepia_amount = st.slider("Sepia", 0, 100, 0)
            vignette = st.slider("Vignette", 0, 100, 0)
            grayscale = st.checkbox("Grayscale")
            invert = st.checkbox("Invert Colors")
            
        with col2:
            edge_enhance = st.checkbox("Edge Enhance")
            emboss = st.checkbox("Emboss")
            posterize = st.slider("Posterize", 2, 8, 8)
        
        # Apply advanced filters
        processed = st.session_state.edited_image.copy()
        
        if sepia_amount > 0:
            sepia_img = apply_sepia(processed)
            processed = Image.blend(processed, sepia_img, sepia_amount / 100)
        
        if vignette > 0:
            processed = apply_vignette(processed, vignette / 100)
            
        if grayscale:
            processed = processed.convert('L').convert('RGB')
            
        if invert:
            processed = ImageOps.invert(processed)
            
        if edge_enhance:
            processed = processed.filter(ImageFilter.EDGE_ENHANCE)
            
        if emboss:
            processed = processed.filter(ImageFilter.EMBOSS)
            
        if posterize < 8:
            processed = ImageOps.posterize(processed, posterize)
            
        st.session_state.edited_image = processed
    
    # Image Editing Tab
    with tabs[2]:
        st.subheader("Image Editing")
        col1, col2 = st.columns(2)
        
        with col1:
            # Rotation
            rotation = st.slider("Rotate", -180, 180, 0)
            if rotation != 0:
                processed = st.session_state.edited_image.rotate(rotation, expand=True)
                st.session_state.edited_image = processed
            
            # Flip options
            if st.button("Flip Horizontal"):
                st.session_state.edited_image = ImageOps.mirror(st.session_state.edited_image)
            if st.button("Flip Vertical"):
                st.session_state.edited_image = ImageOps.flip(st.session_state.edited_image)
        
        with col2:
            # Enhanced Cropping
            st.write("Crop Image")
            crop_mode = st.selectbox(
                "Crop Mode",
                ["Manual", "Aspect Ratio", "Square"],
                key="crop_mode"
            )
            
            if crop_mode == "Manual":
                width, height = st.session_state.edited_image.size
                col1, col2 = st.columns(2)
                
                with col1:
                    left = st.slider("Left", 0, width, 0)
                    top = st.slider("Top", 0, height, 0)
                
                with col2:
                    right = st.slider("Right", left, width, width)
                    bottom = st.slider("Bottom", top, height, height)
                
                # Show crop preview
                preview = st.session_state.edited_image.copy()
                preview = preview.crop((left, top, right, bottom))
                st.image(preview, caption="Crop Preview", use_column_width=True)
                
                if st.button("Apply Crop"):
                    st.session_state.edited_image = preview
            
            elif crop_mode == "Aspect Ratio":
                aspect_ratio = st.select_slider(
                    "Aspect Ratio",
                    options=["1:1", "4:3", "16:9", "3:4", "9:16"],
                    value="1:1"
                )
                w, h = map(int, aspect_ratio.split(":"))
                ratio = w / h
                
                # Show crop preview
                preview = apply_crop(st.session_state.edited_image, "Aspect Ratio", ratio)
                st.image(preview, caption="Crop Preview", use_column_width=True)
                
                if st.button("Apply Crop"):
                    st.session_state.edited_image = preview
            
            else:  # Square
                # Show crop preview
                preview = apply_crop(st.session_state.edited_image, "Square")
                st.image(preview, caption="Crop Preview", use_column_width=True)
                
                if st.button("Apply Crop"):
                    st.session_state.edited_image = preview
            
            # Reset crop
            if st.button("Reset Crop"):
                st.session_state.edited_image = st.session_state.image.copy()
    
    # Export Tab
    with tabs[3]:
        st.subheader("Export Options")
        col1, col2 = st.columns(2)
        
        with col1:
            # Advanced compression settings
            st.write("Compression Settings")
            st.session_state.compression_settings["format"] = st.selectbox(
                "Format",
                ["JPEG", "PNG", "BMP", "WebP"],
                key="compression_format"
            )
            
            if st.session_state.compression_settings["format"] == "JPEG":
                st.session_state.compression_settings["quality"] = st.slider(
                    "Quality",
                    1, 100, 85,
                    key="compression_quality"
                )
                st.session_state.compression_settings["optimize"] = st.checkbox(
                    "Optimize",
                    True,
                    key="compression_optimize"
                )
                st.session_state.compression_settings["progressive"] = st.checkbox(
                    "Progressive",
                    False,
                    key="compression_progressive"
                )
            
            if st.button("Apply Compression"):
                st.session_state.edited_image = compress_image(
                    st.session_state.edited_image,
                    st.session_state.compression_settings
                )
            
            # Size settings
            resize_percent = st.slider("Resize %", 1, 200, 100)
            if st.button("Resize Image"):
                width, height = st.session_state.edited_image.size
                new_size = (int(width * resize_percent / 100), int(height * resize_percent / 100))
                st.session_state.edited_image = st.session_state.edited_image.resize(new_size, Image.Resampling.LANCZOS)
        
        with col2:
            # Download options
            st.write("Download Options")
            if st.button("Generate Download Link"):
                st.markdown(get_image_download_link(
                    st.session_state.edited_image,
                    f"filtered_image.{st.session_state.compression_settings['format'].lower()}",
                    "📥 Click here to download"
                ), unsafe_allow_html=True)
            
            # Show file size comparison
            if st.button("Show Size Comparison"):
                original_size = len(st.session_state.image.tobytes())
                processed_size = len(st.session_state.edited_image.tobytes())
                reduction = ((original_size - processed_size) / original_size) * 100
                
                st.write(f"Original Size: {original_size / 1024:.2f} KB")
                st.write(f"Processed Size: {processed_size / 1024:.2f} KB")
                st.write(f"Size Reduction: {reduction:.1f}%")
    
    # Display original and processed images
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Original Image")
        st.image(st.session_state.image, use_column_width=True)
    
    with col2:
        st.subheader("Processed Image")
        st.image(st.session_state.edited_image, use_column_width=True)

# Footer
st.markdown("---")
st.markdown("Made with ❤️ using Streamlit")
