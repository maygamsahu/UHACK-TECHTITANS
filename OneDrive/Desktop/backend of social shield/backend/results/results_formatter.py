class ResultsFormatter:
    @staticmethod
    def format_public_results(result):
        """Format results for public account analysis"""
        return {
            "trust_score": round(result['trust_score'], 1),
            "prediction": result['prediction'],
            "confidence": round(result['confidence'], 1),
            "ffr_ratio": round(result['ffr_ratio'], 2),
            "risk_factors": result['risk_factors'],
            "explanation": result['explanation'],
            "account_data": {
                "username": result.get('username', 'N/A'),
                "profile_pic": bool(result['account_data']['profile pic']),
                "posts": result['account_data']['#posts'],
                "followers": result['account_data']['#followers'],
                "following": result['account_data']['#follows'],
                "is_private": bool(result['account_data']['private'])
            },
            "analysis_type": "public"
        }
    
    @staticmethod
    def format_private_manual_results(result):
        """Format results for manual private account analysis"""
        return {
            "trust_score": round(result['trust_score'], 1),
            "prediction": result['prediction'],
            "confidence": round(result['confidence'], 1),
            "ffr_ratio": round(result['ffr_ratio'], 2),
            "risk_factors": result['risk_factors'],
            "explanation": result['explanation'],
            "account_data": {
                "profile_pic": bool(result['account_data']['profile pic']),
                "posts": result['account_data']['#posts'],
                "followers": result['account_data']['#followers'],
                "following": result['account_data']['#follows'],
                "is_private": bool(result['account_data']['private']),
                "username_digits_ratio": result['account_data']['nums/length username'],
                "bio_length": result['account_data']['description length']
            },
            "analysis_type": "private_manual"
        }
    
    @staticmethod
    def format_private_ocr_results(result):
        """Format results for OCR-based private account analysis"""
        return {
            "trust_score": round(result['trust_score'], 1),
            "prediction": result['prediction'],
            "confidence": round(result['confidence'], 1),
            "ffr_ratio": round(result['ffr_ratio'], 2),
            "risk_factors": result['risk_factors'],
            "explanation": result['explanation'],
            "account_data": {
                "profile_pic": bool(result['account_data']['profile pic']),
                "posts": result['account_data']['#posts'],
                "followers": result['account_data']['#followers'],
                "following": result['account_data']['#follows'],
                "is_private": bool(result['account_data']['private']),
                "username_digits_ratio": result['account_data']['nums/length username'],
                "bio_length": result['account_data']['description length'],
                "profile_pic_quality": result.get('profile_pic_quality', 75)
            },
            "analysis_type": "private_ocr"
        }
    
    @staticmethod
    def format_error(error_msg):
        """Format error responses for the frontend"""
        return {
            "error": error_msg,
            "status": "error"
        }
