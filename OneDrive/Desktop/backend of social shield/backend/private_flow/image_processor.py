# private_flow/image_processor.py
import cv2
import numpy as np
from PIL import Image
import pytesseract
import re
from typing import Dict
import os

class ImageProcessor:
    def __init__(self, tesseract_path=None):
        # Set tesseract path if provided (Windows)
        if tesseract_path and os.name == 'nt':  # Windows
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
    
    def extract_text_from_image(self, image_path: str) -> Dict:
        """Extract text data from image using OCR with preprocessing"""
        try:
            # Load image using OpenCV
            img = cv2.imread(image_path)
            if img is None:
                return None  # Return None to indicate failure

            # Preprocessing for better OCR
            # 1. Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # 2. Rescale image (2x) for better OCR of small text
            gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            
            # 3. Denoising
            denoised = cv2.fastNlMeansDenoising(gray, h=10)
            
            # 4. Thresholding (Otsu's Binarization)
            _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # Perform OCR on processed image
            # Using custom config for better result
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(thresh, config=custom_config)
            
            # If preprocessing didn't yield results, fallback to raw image
            if not text.strip():
                text = pytesseract.image_to_string(img)
            
            # Extract key information from OCR result
            data = self._parse_text(text)
            
            # CRITICAL FIX: Return None if OCR didn't extract actual metrics
            if data and self._is_meaningful_data(data):
                return data
            else:
                return None  # Signal that OCR failed to extract real data
                
        except Exception as e:
            print(f"OCR Error: {e}")
            return None  # Return None on error, not defaults
    
    def _is_meaningful_data(self, data: Dict) -> bool:
        """Check if OCR extracted real data or just defaults"""
        if not data:
            return False
        
        # If metrics are still at defaults AND we have no username, it's likely OCR failed
        is_all_defaults = (
            data.get('#posts', 50) == 50 and
            data.get('#followers', 200) == 200 and
            data.get('#follows', 150) == 150
        )
        
        # At least one metric was changed from defaults
        return not is_all_defaults
    
    def _parse_text(self, text: str) -> Dict:
        """Robust parsing of extracted text to find Instagram metrics"""
        data = self._get_default_data()
        
        if not text or not text.strip():
            return data
        
        # Normalize text
        text = text.replace(',', '')
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Extract metrics with multiple pattern variations
        full_text = ' '.join(lines).lower()
        
        # Pattern 1: "123 Posts" or "posts 123"
        posts_match = re.search(r'(\d+)\s*posts?\b|\bposts?\s*(\d+)', full_text)
        if posts_match:
            data['#posts'] = int(posts_match.group(1) or posts_match.group(2))
        
        # Pattern 2: "123 Followers" or "followers 123"
        followers_match = re.search(r'(\d+)\s*followers?\b|\bfollowers?\s*(\d+)', full_text)
        if followers_match:
            data['#followers'] = int(followers_match.group(1) or followers_match.group(2))
        
        # Pattern 3: "123 Following" or "following 123"
        following_match = re.search(r'(\d+)\s*following\b|\bfollowing\s*(\d+)', full_text)
        if following_match:
            data['#follows'] = int(following_match.group(1) or following_match.group(2))

        # Handle column layout (number on one line, label on next)
        for i in range(len(lines) - 1):
            if lines[i].isdigit():
                val = int(lines[i])
                label = lines[i+1].lower() if i+1 < len(lines) else ""
                
                # Check label in next 2 lines for flexibility
                for j in range(i+1, min(i+3, len(lines))):
                    label_check = lines[j].lower()
                    if 'post' in label_check and data['#posts'] == 50:
                        data['#posts'] = val
                    elif 'follow' in label_check and 'follower' in label_check and data['#followers'] == 200:
                        data['#followers'] = val
                    elif 'follow' in label_check and 'follower' not in label_check and data['#follows'] == 150:
                        data['#follows'] = val
        
        # Username Extraction
        for line in lines:
            if line.startswith('@'):
                username = line[1:].split()[0]  # Handle lines like "@ username"
                break
        else:
            # Fallback: find line that looks like username (no spaces, reasonable length)
            username = None
            for line in lines:
                if (3 <= len(line) <= 30 and 
                    ' ' not in line and 
                    not line.isdigit() and
                    not any(word in line.lower() for word in ['post', 'follow', 'edit', 'message'])):
                    username = line
                    break

        if username:
            digit_count = len([c for c in username if c.isdigit()])
            data['nums/length username'] = digit_count / len(username) if username else 0

        # Fullname and bio extraction
        fullname = None
        bio = None
        
        for i, line in enumerate(lines):
            if fullname is None and line != username and not line.isdigit():
                if not any(m in line.lower() for m in ['post', 'follow', 'edit', 'message']):
                    if len(line) > 0 and len(line) < 50:
                        fullname = line
                        words = line.split()
                        if len(words) <= 3:
                            data['fullname words'] = len(words)
                            digit_count_fn = len([c for c in line if c.isdigit()])
                            data['nums/length fullname'] = digit_count_fn / len(line) if line else 0
            elif fullname and bio is None and line != username and line != fullname:
                if (len(line) > 10 and not any(m in line.lower() for m in ['post', 'follow', 'edit', 'message']) 
                    and not line.isdigit()):
                    bio = line
                    data['description length'] = len(line)
                    if re.search(r'https?://[^\s]+', line) or '.com' in line or '.in' in line:
                        data['external URL'] = 1
                    break
                
        return data
    
    def _get_default_data(self) -> Dict:
        """Return default data structure"""
        return {
            'profile pic': 1,
            'nums/length username': 0.0,
            'fullname words': 1,
            'nums/length fullname': 0.0,
            'name==username': 0,
            'description length': 50,
            'external URL': 0,
            'private': 1,  # Fixed: consistent with analyze_private_account_images (private mode)
            '#posts': 50,
            '#followers': 200,
            '#follows': 150
        }
    
    def analyze_profile_picture(self, image_path: str) -> Dict:
        """Analyze profile picture quality"""
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                return {'profile_pic_quality': 50, 'has_profile_pic': 1}
                
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # SIFT features for quality assessment
            try:
                sift = cv2.SIFT_create()
                keypoints = sift.detect(gray, None)
                keypoint_count = len(keypoints)
            except:
                # Fallback if SIFT not available
                keypoint_count = 100
            
            # Calculate quality score
            quality_score = min(95, max(10, keypoint_count / 8))
            
            # Sharpness calculation
            try:
                laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
                sharpness_score = min(95, max(5, laplacian_var / 10))
            except:
                sharpness_score = 50
            
            return {
                'profile_pic_quality': quality_score,
                'sharpness_score': sharpness_score,
                'has_profile_pic': 1
            }
        except Exception as e:
            print(f"Profile pic analysis error: {e}")
            return {'profile_pic_quality': 50, 'has_profile_pic': 1}

# Example usage
if __name__ == "__main__":
    processor = ImageProcessor()
    # result = processor.extract_text_from_image('sample_screenshot.png')
    # print("OCR Result:", result)
