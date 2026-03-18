from flask import Flask, request, jsonify
import os
import sys
import tempfile
from werkzeug.utils import secure_filename
import shutil

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.ai_model import InstagramFakeDetector
from core.dataset_lookup import DatasetLookup
from public_flow.public_handler import PublicAccountHandler
from private_flow.private_handler import PrivateAccountHandler
from private_flow.form_handler import FormHandler
from results.results_formatter import ResultsFormatter
from flask_cors import CORS

# After creating the app
app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



# Configure upload folder
UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'instagram_uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Initialize handlers
public_handler = PublicAccountHandler()
private_handler = PrivateAccountHandler()
form_handler = FormHandler()

# Initialize model (this will train if needed)
def initialize_model():
    detector = InstagramFakeDetector()
    model_path = os.path.join('models', 'instagram_detector.pkl')
    
    if not os.path.exists(model_path):
        print("Model not found. Training model...")
        detector.train_and_save_model()
    else:
        detector.load_model(model_path)
    
    return detector

# Make sure model is initialized
model = initialize_model()

@app.route('/analyze-public', methods=['POST'])
def analyze_public():
    logger.info(f"API Request: /analyze-public | Data: {request.json}")
    try:
        data = request.json
        username = data.get('username')
        
        if not username:
            logger.warning("Missing username in request")
            return jsonify(ResultsFormatter.format_error("Username is required")), 400
        
        # Analyze the account
        logger.info(f"Starting analysis for user: {username}")
        result = public_handler.analyze_public_account(username)
        
        # Format results
        if 'error' in result:
            logger.error(f"Analysis error for {username}: {result['error']}")
            return jsonify(ResultsFormatter.format_error(result['error'])), 400
        
        formatted_result = ResultsFormatter.format_public_results(result)
        logger.info(f"Analysis successful for {username}. Prediction: {formatted_result['prediction']}")
        return jsonify(formatted_result)
    
    except Exception as e:
        logger.exception(f"Unexpected server error during /analyze-public")
        return jsonify(ResultsFormatter.format_error(f"Server error: {str(e)}")), 500

@app.route('/analyze-private-manual', methods=['POST'])
def analyze_private_manual():
    try:
        form_data = request.json
        
        # Analyze the account
        result = form_handler.process_form_data(form_data)
        
        # Format results
        if 'error' in result:
            return jsonify(ResultsFormatter.format_error(result['error'])), 400
        
        formatted_result = ResultsFormatter.format_private_manual_results(result)
        return jsonify(formatted_result)
    
    except Exception as e:
        return jsonify(ResultsFormatter.format_error(f"Server error: {str(e)}")), 500

@app.route('/analyze-private-ocr', methods=['POST'])
def analyze_private_ocr():
    try:
        # Check if images were uploaded
        if 'images' not in request.files:
            return jsonify(ResultsFormatter.format_error("No images uploaded")), 400
        
        # Save uploaded images
        image_paths = []
        for file in request.files.getlist('images'):
            if file.filename == '':
                continue
                
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            image_paths.append(file_path)
        
        # Get form data if available
        form_data = request.form.to_dict() if request.form else None
        
        # Analyze the account
        result = form_handler.process_image_uploads(image_paths, form_data)
        
        # Clean up temporary files
        for path in image_paths:
            try:
                os.remove(path)
            except:
                pass
        
        # Format results
        if 'error' in result:
            return jsonify(ResultsFormatter.format_error(result['error'])), 400
        
        formatted_result = ResultsFormatter.format_private_ocr_results(result)
        return jsonify(formatted_result)
    
    except Exception as e:
        # Clean up temporary files in case of error
        for path in image_paths:
            try:
                os.remove(path)
            except:
                pass
                
        return jsonify(ResultsFormatter.format_error(f"Server error: {str(e)}")), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model.is_trained,
        "model_path": os.path.join('models', 'instagram_detector.pkl'),
        "version": "1.0.0"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
