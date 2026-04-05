import streamlit as st
import numpy as np
from PIL import Image
import pandas as pd

from inference import (
    RAF_DB_EMOTIONS,
    detect_largest_face,
    load_face_detector,
    load_model,
    predict_emotion,
)

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
                            face = detect_largest_face(image, detector=detector)
                            
                            if face is not None:
                                processed_image = face
                                face_detected = True
                            else:
                                st.warning("⚠️ No face detected, using full image")

                        if processed_image is None:
                            processed_image = image

                        try:
                            prediction = predict_emotion(model, processed_image, target_size=target_size)
                            emotion = prediction["emotion"]
                            confidence = prediction["confidence"]
                            all_preds = [prediction["probabilities"][e] for e in RAF_DB_EMOTIONS]
                        except Exception as e:
                            st.error(f"Prediction error: {e}")
                            emotion, confidence, all_preds = None, 0, None

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