# core/ai_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

class InstagramFakeDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            'profile pic', 'nums/length username', 'fullname words', 
            'nums/length fullname', 'name==username', 'description length',
            'external URL', 'private', '#posts', '#followers', '#follows'
        ]
        
    def predict_account(self, account_features):
        """Predict if an account is fake or genuine"""
        if not self.is_trained:
            raise ValueError("Model must be loaded first!")
            
        # Convert to DataFrame if it's a dictionary
        if isinstance(account_features, dict):
            account_df = pd.DataFrame([account_features])
        else:
            account_df = account_features
            
        # Ensure all required features are present
        for feature in self.feature_names:
            if feature not in account_df.columns:
                raise ValueError(f"Missing feature: {feature}")
                
        # Reorder columns to match training data
        account_df = account_df[self.feature_names]
        
        # Scale the data
        account_scaled = self.scaler.transform(account_df)
        
        # Make prediction
        prediction = self.model.predict(account_scaled)[0]
        probability = self.model.predict_proba(account_scaled)[0]
        
        return {
            'prediction': 'FAKE' if prediction == 1 else 'GENUINE',
            'confidence': max(probability),
            'fake_probability': probability[1],
            'genuine_probability': probability[0]
        }
    
    def explain_prediction(self, account_features):
        """Provide explanation for why an account might be fake"""
        if not self.is_trained:
            raise ValueError("Model must be loaded first!")
            
        # Get prediction details
        result = self.predict_account(account_features)
        prediction = result['prediction']
        
        # Convert to Series if needed
        if isinstance(account_features, dict):
            account_series = pd.Series(account_features)
        else:
            account_series = account_features.iloc[0]
            
        # Analyze suspicious indicators
        suspicious_indicators = []
        
        # Follower/Following ratio
        if account_series['#follows'] > 0:
            ratio = account_series['#followers'] / account_series['#follows']
            if ratio < 0.1:
                suspicious_indicators.append(f"Very low follower/following ratio ({ratio:.2f})")
                
        # Excessive following
        if account_series['#follows'] > 1000 and account_series['#followers'] < 50:
            suspicious_indicators.append("Following many accounts but few followers")
            
        # Minimal activity
        if account_series['#posts'] < 5:
            suspicious_indicators.append("Very few posts")
            
        # No profile picture
        if account_series['profile pic'] == 0:
            suspicious_indicators.append("No profile picture")
            
        # Private account with suspicious metrics
        if account_series['private'] == 1 and account_series['#posts'] < 10:
            suspicious_indicators.append("Private account with very few posts")
            
        # Username anomalies
        if account_series['nums/length username'] > 0.5:
            suspicious_indicators.append("High proportion of numbers in username")
            
        # Lack of bio
        if account_series['description length'] == 0:
            suspicious_indicators.append("No profile description")
            
        return {
            'prediction': result['prediction'],
            'trust_score': result['genuine_probability'] * 100,
            'confidence': result['confidence'] * 100,
            'ffr_ratio': account_series['#followers'] / account_series['#follows'] if account_series['#follows'] > 0 else 0,
            'indicators': suspicious_indicators if prediction == 'FAKE' else [],
            'explanation': self._generate_explanation(suspicious_indicators, prediction)
        }
    
    def _generate_explanation(self, indicators, prediction):
        """Generate human-readable explanation"""
        if prediction == 'GENUINE':
            return "This account appears to be genuine based on typical user behavior patterns."
        else:
            if len(indicators) == 0:
                return "This account was flagged as potentially fake by the model, but no clear suspicious indicators were identified."
            else:
                return "This account shows several suspicious patterns commonly associated with fake accounts."
    
    def load_model(self, filepath='models/instagram_detector.pkl'):
        """Load a pre-trained model"""
        if os.path.exists(filepath):
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.is_trained = True
            print(f"Model loaded from {filepath}")
            return True
        else:
            print(f"Model file not found: {filepath}")
            return False

    def train_and_save_model(self, train_path='data/train.csv', test_path='data/test.csv'):
        """Train model and save it"""
        from sklearn.metrics import classification_report
        
        # Load data
        train_df = pd.read_csv(train_path)
        test_df = pd.read_csv(test_path)
        
        X_train = train_df.drop('fake', axis=1)
        y_train = train_df['fake']
        X_test = test_df.drop('fake', axis=1)
        y_test = test_df['fake']
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = self.model.score(X_test_scaled, y_test)
        
        print(f"Model trained with accuracy: {accuracy:.4f}")
        
        # Save model
        model_data = {
            'model': self.model,
            'scaler': self.scaler
        }
        os.makedirs('models', exist_ok=True)
        joblib.dump(model_data, 'models/instagram_detector.pkl')
        print("Model saved to models/instagram_detector.pkl")
        
        return accuracy
