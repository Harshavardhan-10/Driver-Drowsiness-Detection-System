# Eye Aspect Ratio (EAR) threshold for eye closure detection
# Values below this threshold indicate the eye is closed
# Typical range: 0.15-0.25 (lower = eyes more closed before detection)
EAR_THRESHOLD = 0.25

# Mouth Aspect Ratio (MAR) threshold for yawning detection
# Values above this threshold indicate the mouth is open (yawning)
# Typical range: 0.5-0.7 (higher = wider mouth opening needed for detection)
MAR_THRESHOLD = 0.75

# Number of consecutive frames for initial drowsiness warning
# Once this threshold is reached, a warning is triggered
# At 20 FPS: 40 frames = 2 seconds of closed eyes
WARNING_FRAMES = 25

# Number of consecutive frames to declare driver as drowsy
# Once this threshold is reached, system triggers alert
# At 20 FPS: 60 frames = 3 seconds of closed eyes
DROWSY_FRAMES = 30

# Frames per second for video processing
# Lower FPS = faster processing but less accurate
# Higher FPS = more accurate but computationally expensive
# Typical range: 15-30 FPS
FPS = 20
