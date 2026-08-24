import cv2
import numpy as np
import base64
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
from .utils import calculate_ear, calculate_mar
from .drowsiness import DrowsinessDetector as DrowsinessEngine

class DrowsinessDetector:
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self.left_eye_indices = [33, 160, 158, 133, 153, 144]
        self.right_eye_indices = [362, 385, 387, 263, 373, 380]
        self.mouth_indices = [13, 14, 78, 308, 82, 312]
        self.drowsiness = DrowsinessEngine()
    def analyze_frame(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb)        
        if not results.multi_face_landmarks:

            return {
                "face_detected": False,
                "status": "NO_FACE",
                "ear": 0.0,
                "mar": 0.0,
                "score": 0,
                "yawns": 0
            }

        landmarks = results.multi_face_landmarks[0].landmark
        image_height, image_width, _ = frame.shape

        left_eye = [
            self._landmark_to_point(landmarks[i], image_width, image_height)
            for i in self.left_eye_indices
        ]
        right_eye = [
            self._landmark_to_point(landmarks[i], image_width, image_height)
            for i in self.right_eye_indices
        ]
        mouth = [
            self._landmark_to_point(landmarks[i], image_width, image_height)
            for i in self.mouth_indices
        ]

        # Normalized landmark points (0-1) used for EAR/MAR, sent so the
        # frontend can outline eyes and mouth on the live camera feed.
        overlay = {
            "left_eye": [
                [round(landmarks[i].x, 3), round(landmarks[i].y, 3)]
                for i in self.left_eye_indices
            ],
            "right_eye": [
                [round(landmarks[i].x, 3), round(landmarks[i].y, 3)]
                for i in self.right_eye_indices
            ],
            "mouth": [
                [round(landmarks[i].x, 3), round(landmarks[i].y, 3)]
                for i in self.mouth_indices
            ],
        }

        try:
            left_ear = calculate_ear(left_eye)
        except Exception as e:
            print("CALCULATE_EAR ERROR:", repr(e))
            raise
        right_ear = calculate_ear(right_eye)
        ear = (left_ear + right_ear) / 2.0
        mar = calculate_mar(mouth)

        drowsiness_result = self.drowsiness.detect(ear, mar)

        return {
            "face_detected": True,
            "ear": round(ear, 3),
            "mar": round(mar, 3),
            "blink": ear < 0.20,
            "yawn": mar > 0.65,
            "overlay": overlay,
            **drowsiness_result
        }
            
    def process_frame(self, frame_data):
        try:
            if "," in frame_data:
                frame_data = frame_data.split(",")[1]

            image_bytes = base64.b64decode(frame_data)

            np_arr = np.frombuffer(image_bytes, np.uint8)

            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is None:
                return {
                    "face_detected": False,
                    "error": "Unable to decode frame"
                }

            return self.analyze_frame(frame)

        except Exception as e:
            return {
                "face_detected": False,
                "error": str(e)
            }
    
    def get_detector_state(self):
        return {
        "status": "running"
        }

    def reset(self):
        self.drowsiness.reset()

    def dismiss_alert(self):
        self.drowsiness.dismiss_alert()

    def close(self):
        if self.face_mesh:
            self.face_mesh.close()

    @staticmethod
    def _landmark_to_point(landmark, width, height):
        return (int(landmark.x * width), int(landmark.y * height))
    
    
