from fer.fer import FER
import cv2

# Emotion -> BGR color mapping for bounding box & label
EMOTION_COLORS = {
    "angry": (0, 0, 255),
    "disgust": (0, 140, 255),
    "fear": (255, 0, 255),
    "happy": (0, 255, 0),
    "sad": (255, 100, 50),
    "surprise": (0, 255, 255),
    "neutral": (200, 200, 200),
}

CONFIDENCE_THRESHOLD = 0.25


def open_camera():
    # Try common Windows backends first, then fallback to default backend.
    attempts = [
        (0, cv2.CAP_DSHOW),
        (0, cv2.CAP_MSMF),
        (0, None),
        (1, cv2.CAP_DSHOW),
        (1, cv2.CAP_MSMF),
        (1, None),
    ]

    for index, backend in attempts:
        cap = cv2.VideoCapture(index, backend) if backend is not None else cv2.VideoCapture(index)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret and frame is not None:
                print(f"[INFO] Camera opened: index={index}, backend={backend}", flush=True)
                return cap
        cap.release()

    return None


def draw_emotion(frame, face):
    x, y, w, h = face["box"]

    # Clamp box coordinates to frame bounds
    x, y = max(x, 0), max(y, 0)
    w = min(w, frame.shape[1] - x)
    h = min(h, frame.shape[0] - y)

    emotions = face["emotions"]
    dominant_emotion = max(emotions, key=emotions.get)
    score = emotions[dominant_emotion]

    if score < CONFIDENCE_THRESHOLD:
        return

    color = EMOTION_COLORS.get(dominant_emotion, (255, 255, 255))
    label = f"{dominant_emotion.upper()}  {score:.0%}"

    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

    (text_w, text_h), baseline = cv2.getTextSize(
        label, cv2.FONT_HERSHEY_DUPLEX, 0.65, 1
    )
    label_y = y - 10 if y - 10 > text_h else y + h + text_h + 10
    cv2.rectangle(
        frame,
        (x, label_y - text_h - baseline),
        (x + text_w + 6, label_y + baseline),
        color,
        cv2.FILLED,
    )
    cv2.putText(
        frame,
        label,
        (x + 3, label_y),
        cv2.FONT_HERSHEY_DUPLEX,
        0.65,
        (0, 0, 0),
        1,
        cv2.LINE_AA,
    )

    bar_x = x + w + 8
    if bar_x + 110 < frame.shape[1]:
        for i, (emo, val) in enumerate(sorted(emotions.items(), key=lambda e: -e[1])):
            bar_color = EMOTION_COLORS.get(emo, (255, 255, 255))
            bar_len = int(val * 80)
            by = y + i * 18
            cv2.rectangle(frame, (bar_x, by), (bar_x + bar_len, by + 14), bar_color, -1)
            cv2.putText(
                frame,
                emo[:3],
                (bar_x + bar_len + 4, by + 11),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.38,
                (220, 220, 220),
                1,
            )


def main():
    try:
        detector = FER(mtcnn=True)
        print("[INFO] Using MTCNN face detector (higher accuracy)", flush=True)
    except Exception as exc:
        detector = FER(mtcnn=False)
        print(f"[INFO] MTCNN unavailable ({exc}), using default detector", flush=True)

    cap = open_camera()
    if cap is None:
        print("[ERROR] Cannot open camera. Close other apps using camera and try again.", flush=True)
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    window_name = "Emotion Detection  [Q to quit]"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    print("[INFO] Press 'Q' to quit", flush=True)

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            print("[WARN] Camera read failed, retrying...", flush=True)
            continue

        enhanced = cv2.convertScaleAbs(frame, alpha=1.1, beta=15)
        try:
            results = detector.detect_emotions(enhanced)
        except Exception as exc:
            results = []
            cv2.putText(
                frame,
                f"Detection error: {str(exc)[:70]}",
                (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 255),
                2,
            )

        for face in results:
            draw_emotion(frame, face)

        cv2.putText(
            frame,
            f"Faces: {len(results)}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 0),
            2,
        )

        cv2.imshow(window_name, frame)
        if cv2.waitKey(1) & 0xFF in (ord("q"), ord("Q"), 27):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()