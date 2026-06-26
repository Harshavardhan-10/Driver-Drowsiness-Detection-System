from app.config import EAR_THRESHOLD, MAR_THRESHOLD, WARNING_FRAMES, DROWSY_FRAMES


class DrowsinessDetector:
    
    def __init__(self):
        """Initialize drowsiness detector with default values."""
        self.closed_eye_frames = 0
        self.yawn_count = 0
        self.score = 0
        self.status = "NORMAL"
        self.prev_mar_high = False
        self.yawn_frames = 0
        self.dismiss_frames = 0
    
    def detect(self, ear, mar):

        if self.dismiss_frames > 0:
            self.dismiss_frames -= 1

            return {
                "score": 0,
                "status": "NORMAL",
                "yawns": self.yawn_count,
                "alert": False
            }
                # Check for closed eyes (EAR below threshold)
        if ear < EAR_THRESHOLD:
            self.closed_eye_frames += 1
        else:
            self.closed_eye_frames = 0
        
        # Check for yawning (MAR above threshold)
        # Only count once per yawn sequence (when MAR transitions from low to high)
        if mar > MAR_THRESHOLD:
            self.yawn_frames += 1

            if self.yawn_frames >= 10 and not self.prev_mar_high:
                self.yawn_count += 1
                self.prev_mar_high = True
        else:
            self.yawn_frames = 0
            self.prev_mar_high = False
        
        # Calculate drowsiness score (0-100)
        self.score = self._calculate_score()
        # Determine status based on closed eye frames
        if self.score >= 60:
            self.status = "DROWSY"

        elif self.score >= 30:
            self.status = "WARNING"

        else:
            self.status = "NORMAL"
        
        alert = self.status == "DROWSY"
        # Return detection result
        return {
            "score": self.score,
            "status": self.status,
            "yawns": self.yawn_count,
            "alert": alert
        }
    
    def _calculate_score(self):
        FRAME_BUFFER = 30

        if self.closed_eye_frames > FRAME_BUFFER:
            eye_score = (self.closed_eye_frames - FRAME_BUFFER) * 1
        else:
            eye_score = 0

        yawn_score = self.yawn_count * 2
        proposed = eye_score + yawn_score

        if proposed > self.score:
            self.score = proposed

        return min(100, self.score)
    
    def reset(self):
        """Reset all counters and status to initial state."""
        self.closed_eye_frames = 0
        self.yawn_count = 0
        self.score = 0
        self.status = "NORMAL"
        self.prev_mar_high = False
        self.yawn_frames = 0
    
    def get_state(self):
        """
        Get current detector state for serialization/logging.
        """
        return {
            "closed_eye_frames": self.closed_eye_frames,
            "yawn_count": self.yawn_count,
            "score": self.score,
            "status": self.status
        }
    
    def dismiss_alert(self):
        self.score = 0
        self.closed_eye_frames = 0
        self.yawn_count = 0
        self.status = "NORMAL"
        self.prev_mar_high = False
        self.yawn_frames = 0
        self.dismiss_frames = 90
