import streamlit as st
import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
from mtcnn import MTCNN
import pandas as pd

# Must be the first Streamlit command
st.set_page_config(
    page_title="Emotion Detector",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1E88E5;
        margin-bottom: 0px;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #616161;
        margin-bottom: 2rem;
    }
    .prediction-card {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        margin-top: 10px;
        margin-bottom: 20px;
        border: 1px solid #e9ecef;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
</style>
""", unsafe_allow_html=True)

# Constants
RAF_DB_EMOTIONS = [
    "Surprise",
    "Fear",
    "Disgust",
    "Happiness",
    "Sadness",
    "Anger",
    "Neutral",
]


@st.cache_resource
def load_model(model_path):
    return tf.keras.models.load_model(model_path)


@st.cache_resource
def load_face_detector():
    return MTCNN()


def preprocess_image(image, target_size=(100, 100)):
    # Convert PIL to numpy
    if isinstance(image, Image.Image):
        image = np.array(image)

    # Handle different image formats
    if len(image.shape) == 2:  # Grayscale
        image = np.stack([image, image, image], axis=-1)
    elif len(image.shape) == 3:
        if image.shape[2] == 4:  # RGBA
            image = image[:, :, :3]
        elif image.shape[2] == 1:  # Single channel
            image = np.concatenate([image, image, image], axis=-1)

    # Resize to target size
    image = cv2.resize(image, target_size)

    # Normalize to [0, 1]
    image = image.astype(np.float32) / 255.0

    # Add batch dimension
    image = np.expand_dims(image, axis=0)

    return image


def detect_face(image, detector):
    # Convert PIL to numpy
    if isinstance(image, Image.Image):
        image = np.array(image)

    # Ensure RGB format for MTCNN
    if len(image.shape) == 2:
        rgb_image = np.stack([image, image, image], axis=-1)
    elif len(image.shape) == 3:
        if image.shape[2] == 3:
            rgb_image = image.copy()
        elif image.shape[2] == 4:
            rgb_image = image[:, :, :3]
        else:
            return None
    else:
        return None

    try:
        # Detect faces
        results = detector.detect_faces(rgb_image)

        if results:
            # Get the largest face
            largest_face = max(results, key=lambda x: x["box"][2] * x["box"][3])
            x, y, w, h = largest_face["box"]

            # Add padding
            padding = int(max(w, h) * 0.2)
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(rgb_image.shape[1], x + w + padding)
            y2 = min(rgb_image.shape[0], y + h + padding)

            # Extract face
            face = rgb_image[y1:y2, x1:x2]
            return face
        
        return None
    
    except Exception as e:
        st.error(f"Error during face detection: {e}")
        return None
    

def predict_emotion(model, image):
    try:
        predictions = model.predict(image, verbose=0)
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        return RAF_DB_EMOTIONS[predicted_class], confidence, predictions[0]
    except Exception as e:
        st.error(f"Prediction error: {e}")
        return None, 0, None


# Main app header
st.markdown('<p class="main-header">🎭 Emotion Detection</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Detect emotions from facial expressions using CNN and MTCNN</p>', unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.header("⚙️ Configuration")
    model_file = st.file_uploader("Upload .keras model", type=["keras"], help="Upload your trained model to begin")
    
    st.markdown("---")
    st.header("🛠️ Settings")
    use_face_detection = st.checkbox("🔍 Use face detection (MTCNN)", value=True, help="Detects and crops faces before prediction for better accuracy.")
    
    st.markdown("---")
    st.markdown("**About**")
    st.caption("This tool uses a Convolutional Neural Network (CNN) to detect emotions from images. Optionally, it uses MTCNN to extract faces before classification.")
    st.markdown("---")
    st.caption("**Built with Streamlit**")

if model_file:
    # Save and load model
    with st.spinner("Loading model..."):
        with open("temp_model.keras", "wb") as f:
            f.write(model_file.getbuffer())

    try:
        model = load_model("temp_model.keras")
        st.sidebar.success("✅ Model loaded successfully!")
        
        # Extract target size
        if len(model.input_shape) == 4:
            target_h, target_w = model.input_shape[1], model.input_shape[2]
            target_size = (target_w, target_h)
        else:
            target_size = (100, 100)

        with st.sidebar.expander("Model Details"):
            st.info(f"Input shape: {model.input_shape}")
            st.info(f"Target size: {target_size}")

        # Main content layout
        col_input, col_results = st.columns([1, 1], gap="large")

        with col_input:
            st.header("📤 Input Image")
            uploaded_file = st.file_uploader(
                "Choose an image file",
                type=["png", "jpg", "jpeg", "bmp", "tiff"],
                help="Supports both RGB and grayscale images",
                label_visibility="collapsed"
            )

            if uploaded_file:
                image = Image.open(uploaded_file)
                st.image(image, caption="Input Image", use_container_width=True)
                
                with st.expander("ℹ️ Image Info"):
                    c1, c2, c3 = st.columns(3)
                    c1.metric("Size", f"{image.size[0]}x{image.size[1]}")
                    c2.metric("Mode", image.mode)
                    if hasattr(image, "format"):
                        c3.metric("Format", image.format)

                predict_button = st.button("🔍 Predict Emotion", type="primary", use_container_width=True)

        with col_results:
            st.header("🎯 Results")
            
            if not uploaded_file:
                st.info("Upload an image and click 'Predict Emotion' to see results here.")
            else:
                if 'predict_button' in locals() and predict_button:
                    with st.spinner("Analyzing image..."):
                        processed_image = None
                        face_detected = False
                        
                        if use_face_detection:
                            detector = load_face_detector()
                            face = detect_face(image, detector)
                            
                            if face is not None:
                                processed_image = preprocess_image(face, target_size)
                                face_detected = True
                            else:
                                st.warning("⚠️ No face detected, using full image")

                        if processed_image is None:
                            processed_image = preprocess_image(image, target_size)

                        emotion, confidence, all_preds = predict_emotion(model, processed_image)

                        if emotion is not None:
                            # Display main result
                            st.markdown(f"""
                            <div class="prediction-card">
                                <h3>Predicted Emotion</h3>
                                <h1 style="color: #1E88E5; font-size: 3.5rem; margin: 10px 0;">{emotion}</h1>
                                <p style="font-size: 1.2rem; color: #424242; margin-bottom: 0;">Confidence: <b>{confidence:.1%}</b></p>
                            </div>
                            """, unsafe_allow_html=True)
                            
                            st.subheader("Analysis Breakdown")
                            
                            if face_detected:
                                rc1, rc2 = st.columns([1, 2])
                                with rc1:
                                    st.image(face, caption="Detected Face", use_container_width=True)
                                with rc2:
                                    # Create bar chart
                                    df = pd.DataFrame({
                                        "Emotion": RAF_DB_EMOTIONS,
                                        "Probability": all_preds
                                    }).sort_values(by="Probability", ascending=False)
                                    st.bar_chart(df.set_index("Emotion"), height=200)
                            else:
                                df = pd.DataFrame({
                                    "Emotion": RAF_DB_EMOTIONS,
                                    "Probability": all_preds
                                }).sort_values(by="Probability", ascending=False)
                                st.bar_chart(df.set_index("Emotion"), height=250)

                            with st.expander("See Detailed Probabilities"):
                                for emo, prob in zip(RAF_DB_EMOTIONS, all_preds):
                                    st.progress(float(prob), text=f"{emo}: {prob:.1%}")

                        else:
                            st.error("❌ Prediction failed")
                else:
                    st.info("Click 'Predict Emotion' to analyze the image.")

    except Exception as e:
        st.sidebar.error(f"❌ Model loading failed: {e}")
        st.error("Please ensure you uploaded a valid .keras model file")

else:
    st.info("👉 Upload your trained emotion detection model in the sidebar to begin")