import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from private_flow.private_handler import PrivateAccountHandler

class FormHandler:
    def __init__(self, tesseract_path=None):
        self.private_handler = PrivateAccountHandler(tesseract_path)
    
    def process_form_data(self, form_data):
        """Process manual form data for private account analysis"""
        return self.private_handler.analyze_private_account_manual(form_data)
    
    def process_image_uploads(self, image_paths, form_data=None):
        """Process uploaded images for private account analysis"""
        return self.private_handler.analyze_private_account_images(image_paths, form_data)
