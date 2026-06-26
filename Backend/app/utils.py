from math import sqrt



def euclidean_distance(point1, point2):
    """
    Calculate Euclidean distance between two points in 2D space.
    
    Formula: distance = sqrt((x2-x1)^2 + (y2-y1)^2)
    
    Args:
        point1: Tuple of (x, y) coordinates
        point2: Tuple of (x, y) coordinates
        
    Returns:
        Float value representing distance between points
    """
    x1, y1 = point1[0], point1[1]
    x2, y2 = point2[0], point2[1]
    
    distance = sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    
    return distance


def calculate_ear(eye):
    """
    Calculate Eye Aspect Ratio (EAR) from eye landmarks.
    The eye landmarks are ordered as:
    0 = left corner
    3 = right corner
    1,5 = vertical pair
    2,4 = vertical pair
    
    """
    if len(eye) != 6:
        return 0.0

    A = euclidean_distance(eye[1], eye[5])
    B = euclidean_distance(eye[2], eye[4])
    C = euclidean_distance(eye[0], eye[3])

    if C == 0:
        return 0.0

    return (A + B) / (2.0 * C)


def calculate_mar(mouth):
    """
    MAR calculation for 6 mouth landmarks
    """

    if len(mouth) != 6:
        return 0.0

    vertical = euclidean_distance(mouth[0], mouth[1])
    horizontal = euclidean_distance(mouth[2], mouth[3])

    if horizontal == 0:
        return 0.0

    return vertical / horizontal

