import sys
import os
import pandas as pd

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.ai_model import InstagramFakeDetector
from private_flow.image_processor import ImageProcessor

class PrivateAccountHandler:
    def __init__(self, tesseract_path=None):
        self.detector = InstagramFakeDetector()
        self.image_processor = ImageProcessor(tesseract_path)
        # Load the model
        self.detector.load_model()
    
    def analyze_private_account_manual(self, form_data):
        """Analyze private account with manually entered data"""
        try:
            # Validate and convert form data
            account_data = {
                'profile pic': int(form_data.get('profile_pic', 1)),
                'nums/length username': float(form_data.get('username_digits_ratio', 0.0)),
                'fullname words': int(form_data.get('fullname_words', 1)),
                'nums/length fullname': float(form_data.get('fullname_digits_ratio', 0.0)),
                'name==username': int(form_data.get('name_equals_username', 0)),
                'description length': int(form_data.get('bio_length', 50)),
                'external URL': int(form_data.get('external_url', 0)),
                'private': int(form_data.get('is_private', 0)),
                '#posts': int(form_data.get('posts', 50)),
                '#followers': int(form_data.get('followers', 200)),
                '#follows': int(form_data.get('following', 150))
            }
            
            # AI Analysis
            result = self.detector.explain_prediction(account_data)
            
            # Format results
            formatted_result = {
                'trust_score': result['trust_score'],
                'prediction': result['prediction'],
                'confidence': result['confidence'],
                'ffr_ratio': result['ffr_ratio'],
                'risk_factors': result['indicators'],
                'explanation': result['explanation'],
                'account_data': account_data,
                'analysis_type': 'private_manual'
            }
            
            return formatted_result
            
        except Exception as e:
            return {
                'error': f"Failed to analyze account: {str(e)}",
                'analysis_type': 'private_manual'
            }
    
    def analyze_private_account_images(self, image_paths, form_data=None):
        """Analyze private account using uploaded images"""
        try:
            # Initialize account data with defaults or form data
            if form_data:
                account_data = {
                    'profile pic': int(form_data.get('profile_pic', 1)),
                    'nums/length username': float(form_data.get('username_digits_ratio', 0.0)),
                    'fullname words': int(form_data.get('fullname_words', 1)),
                    'nums/length fullname': float(form_data.get('fullname_digits_ratio', 0.0)),
                    'name==username': int(form_data.get('name_equals_username', 0)),
                    'description length': int(form_data.get('bio_length', 50)),
                    'external URL': int(form_data.get('external_url', 0)),
                    'private': 1, # Default to 1 for this flow
                    '#posts': int(form_data.get('posts', 50)),
                    '#followers': int(form_data.get('followers', 200)),
                    '#follows': int(form_data.get('following', 150))
                }
            else:
                account_data = {
                    'profile pic': 1,
                    'nums/length username': 0.0,
                    'fullname words': 1,
                    'nums/length fullname': 0.0,
                    'name==username': 0,
                    'description length': 50,
                    'external URL': 0,
                    'private': 1, # Default to 1 for this flow
                    '#posts': 50,
                    '#followers': 200,
                    '#follows': 150
                }
            
            # Process each image
            ocr_data_extracted = False
            ocr_errors = []
            
            for image_path in image_paths:
                if os.path.exists(image_path):
                    # Try to extract text data
                    ocr_data = self.image_processor.extract_text_from_image(image_path)
                    
                    # CRITICAL FIX: Check if OCR actually extracted real data
                    if ocr_data is not None:
                        # Update account data with OCR results
                        for key, value in ocr_data.items():
                            if key in account_data:
                                account_data[key] = value
                        ocr_data_extracted = True
                    else:
                        ocr_errors.append(f"Could not extract data from {os.path.basename(image_path)}")
                    
                    # Check if this is a profile picture
                    if 'profile' in image_path.lower():
                        pic_quality = self.image_processor.analyze_profile_picture(image_path)
                        account_data['profile pic'] = pic_quality['has_profile_pic']
            
            # CRITICAL FIX: Return error if OCR failed to extract any data
            if not ocr_data_extracted and not form_data:
                return {
                    'error': "Could not extract data from screenshot. Please ensure it's a clear Instagram profile screenshot.",
                    'analysis_type': 'private_ocr',
                    'hint': 'Make sure the screenshot shows: Posts count, Followers count, Following count'
                }
            
            # AI Analysis
            result = self.detector.explain_prediction(account_data)
            
            # Format results
            formatted_result = {
                'trust_score': result['trust_score'],
                'prediction': result['prediction'],
                'confidence': result['confidence'],
                'ffr_ratio': result['ffr_ratio'],
                'risk_factors': result['indicators'],
                'explanation': result['explanation'],
                'account_data': account_data,
                'analysis_type': 'private_ocr',
                'ocr_status': 'success' if ocr_data_extracted else 'used_defaults',
                'ocr_warnings': ocr_errors if ocr_errors else None
            }
            
            return formatted_result
            
        except Exception as e:
            return {
                'error': f"Failed to analyze account: {str(e)}",
                'analysis_type': 'private_ocr'
            }
