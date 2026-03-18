import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.dataset_lookup import DatasetLookup
from core.ai_model import InstagramFakeDetector

class PublicAccountHandler:
    def __init__(self):
        self.dataset_lookup = DatasetLookup()
        self.detector = InstagramFakeDetector()
        self.detector.load_model()
    
    def analyze_public_account(self, username):
        """Analyze public Instagram account using dataset lookup"""
        try:
            # Step 1: Lookup account in dataset
            account_data, is_actually_fake = self.dataset_lookup.lookup_account(username)
            
            # Step 2: AI Analysis
            result = self.detector.explain_prediction(account_data)
            
            # Step 3: Format results
            formatted_result = {
                'username': username,
                'trust_score': result['trust_score'],
                'prediction': result['prediction'],
                'confidence': result['confidence'],
                'ffr_ratio': result['ffr_ratio'],
                'risk_factors': result['indicators'],
                'explanation': result['explanation'],
                'account_data': account_data,
                'analysis_type': 'public_dataset'
            }
            
            return formatted_result
            
        except Exception as e:
            return {
                'error': f"Failed to analyze account: {str(e)}",
                'username': username
            }
