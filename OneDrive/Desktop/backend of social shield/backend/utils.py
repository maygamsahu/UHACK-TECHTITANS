import re
import os
import pandas as pd
import numpy as np
from datetime import datetime

def generate_analysis_id():
    """Generate a unique analysis ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = f"{np.random.randint(1000, 9999)}"
    return f"ANL-{timestamp}-{random_suffix}"

def sanitize_input(text):
    """Sanitize user input to prevent XSS and other attacks"""
    return re.sub(r'[^\w\s@.-]', '', text)

def validate_instagram_username(username):
    """Validate Instagram username format"""
    if not username:
        return False
    
    username = username.strip('@')
    if len(username) < 3 or len(username) > 30:
        return False
    
    # Instagram username rules
    pattern = r'^[a-zA-Z0-9_.]+$'
    return bool(re.match(pattern, username))

def calculate_ffr_ratio(followers, following):
    """Calculate follower/following ratio"""
    if following == 0:
        return 0.0
    return round(followers / following, 2)

def get_risk_severity(trust_score):
    """Get risk severity based on trust score"""
    if trust_score >= 75:
        return "LOW"
    elif trust_score >= 40:
        return "MEDIUM"
    else:
        return "HIGH"

def format_duration(seconds):
    """Format duration in seconds to human-readable format"""
    if seconds < 60:
        return f"{seconds:.1f} seconds"
    elif seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f} minutes"
    else:
        hours = seconds / 3600
        return f"{hours:.1f} hours"
