from functools import lru_cache
from pathlib import Path

RAF_DB_EMOTIONS = [
    "Surprise",
    "Fear",
    "Disgust",
    "Happiness",
    "Sadness",
    "Anger",
    "Neutral",
]


@lru_cache(maxsize=4)
def load_model(model_path: str):
    from tensorflow.keras.models import load_model as keras_load_model

    return keras_load_model(str(model_path))


@lru_cache(maxsize=1)
def load_face_detector():
    from mtcnn import MTCNN

    return MTCNN()


def _ensure_rgb_array(image):
    from PIL import Image
    import numpy as np

    if isinstance(image, Image.Image):
        image = np.array(image)

    if not isinstance(image, np.ndarray):
        raise ValueError("Image input must be a PIL Image or NumPy array")

    if len(image.shape) == 2:
        return np.stack([image, image, image], axis=-1)

    if len(image.shape) != 3:
        raise ValueError("Unsupported image shape")

    channels = image.shape[2]
    if channels == 3:
        return image
    if channels == 4:
        return image[:, :, :3]
    if channels == 1:
        return np.concatenate([image, image, image], axis=-1)

    raise ValueError("Unsupported channel format")


def preprocess_image(image, target_size=(100, 100)):
    import cv2
    import numpy as np

    rgb_image = _ensure_rgb_array(image)
    resized = cv2.resize(rgb_image, target_size)
    normalized = resized.astype(np.float32) / 255.0
    return np.expand_dims(normalized, axis=0)


def detect_largest_face(image, detector=None):
    rgb_image = _ensure_rgb_array(image)
    detector = detector or load_face_detector()

    try:
        results = detector.detect_faces(rgb_image)
    except Exception:
        return None

    if not results:
        return None

    largest_face = max(results, key=lambda x: x["box"][2] * x["box"][3])
    x, y, w, h = largest_face["box"]

    padding = int(max(w, h) * 0.2)
    x1 = max(0, x - padding)
    y1 = max(0, y - padding)
    x2 = min(rgb_image.shape[1], x + w + padding)
    y2 = min(rgb_image.shape[0], y + h + padding)

    if x1 >= x2 or y1 >= y2:
        return None

    return rgb_image[y1:y2, x1:x2]


def predict_emotion(model, image, target_size=(100, 100), labels=None):
    import numpy as np

    labels = labels or RAF_DB_EMOTIONS
    processed = preprocess_image(image, target_size=target_size)
    probabilities = model.predict(processed, verbose=0)[0]

    top_idx = int(np.argmax(probabilities))
    confidence = float(probabilities[top_idx])

    return {
        "emotion": labels[top_idx],
        "confidence": confidence,
        "probabilities": {label: float(probabilities[i]) for i, label in enumerate(labels)},
    }


def resolve_model_path(model_path=None):
    if model_path:
        return str(Path(model_path).resolve())
    return str((Path(__file__).resolve().parent / "emotion_model.keras").resolve())
