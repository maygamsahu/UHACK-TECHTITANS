# instagram_fake_detector.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import seaborn as sns
import matplotlib.pyplot as plt

class InstagramFakeDetector:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
        self.scaler = StandardScaler()
        self.is_trained = False
        # Define feature names explicitly
        self.feature_names = [
            'profile pic', 'nums/length username', 'fullname words', 
            'nums/length fullname', 'name==username', 'description length',
            'external URL', 'private', '#posts', '#followers', '#follows'
        ]
        
    def load_data(self, train_path, test_path):
        """Load training and testing data"""
        self.train_df = pd.read_csv(train_path)
        self.test_df = pd.read_csv(test_path)
        
        # Separate features and targets
        self.X_train = self.train_df.drop('fake', axis=1)
        self.y_train = self.train_df['fake']
        self.X_test = self.test_df.drop('fake', axis=1)
        self.y_test = self.test_df['fake']
        
        print("Data loaded successfully!")
        print(f"Training set: {self.X_train.shape[0]} samples")
        print(f"Test set: {self.X_test.shape[0]} samples")
        
    def train_model(self):
        """Train the fake account detection model"""
        # Scale features
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        # Train model
        self.model.fit(self.X_train_scaled, self.y_train)
        self.is_trained = True
        
        # Evaluate on test set
        y_pred = self.model.predict(self.X_test_scaled)
        
        print("\n=== MODEL PERFORMANCE ===")
        print(classification_report(self.y_test, y_pred, target_names=['Genuine', 'Fake']))
        
        # Plot confusion matrix
        cm = confusion_matrix(self.y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Genuine', 'Fake'], 
                   yticklabels=['Genuine', 'Fake'])
        plt.title('Confusion Matrix')
        plt.ylabel('Actual')
        plt.xlabel('Predicted')
        plt.show()
        
        return self.model.score(self.X_test_scaled, self.y_test)
    
    def predict_account(self, account_features):
        """Predict if an account is fake or genuine"""
        if not self.is_trained:
            raise ValueError("Model must be trained first!")
            
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
            raise ValueError("Model must be trained first!")
            
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
    
    def save_model(self, filepath='instagram_fake_detector.pkl'):
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("No trained model to save!")
            
        model_data = {
            'model': self.model,
            'scaler': self.scaler
        }
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
        
    def load_model(self, filepath='instagram_fake_detector.pkl'):
        """Load a pre-trained model"""
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.is_trained = True
        print(f"Model loaded from {filepath}")

# Example usage
def main():
    # Initialize detector
    detector = InstagramFakeDetector()
    
    # Load data
    detector.load_data('train.csv', 'test.csv')
    
    # Train model
    accuracy = detector.train_model()
    print(f"\nModel Accuracy: {accuracy:.4f}")
    
    # Show feature importance
    feature_importance = pd.DataFrame({
        'feature': detector.feature_names,
        'importance': detector.model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 5 Most Important Features:")
    print(feature_importance.head())
    
    # Test with example accounts
    print("\n=== TESTING EXAMPLE ACCOUNTS ===")
    
    # Example 1: Likely genuine account
    genuine_account = {
        'profile pic': 1,
        'nums/length username': 0.1,
        'fullname words': 2,
        'nums/length fullname': 0.0,
        'name==username': 0,
        'description length': 50,
        'external URL': 0,
        'private': 0,
        '#posts': 150,
        '#followers': 1200,
        '#follows': 800
    }
    
    result = detector.explain_prediction(genuine_account)
    print(f"\nGenuine Account Analysis:")
    print(f"Prediction: {result['prediction']}")
    print(f"Trust Score: {result['trust_score']:.1f}%")
    print(f"Confidence: {result['confidence']:.1f}%")
    if result['indicators']:
        print("Suspicious Indicators:")
        for indicator in result['indicators']:
            print(f"  - {indicator}")
    else:
        print("No suspicious indicators found")
    
    # Example 2: Likely fake account
    fake_account = {
        'profile pic': 0,
        'nums/length username': 0.7,
        'fullname words': 0,
        'nums/length fullname': 0.0,
        'name==username': 1,
        'description length': 0,
        'external URL': 1,
        'private': 1,
        '#posts': 2,
        '#followers': 5,
        '#follows': 1500
    }
    
    result = detector.explain_prediction(fake_account)
    print(f"\nFake Account Analysis:")
    print(f"Prediction: {result['prediction']}")
    print(f"Trust Score: {result['trust_score']:.1f}%")
    print(f"Confidence: {result['confidence']:.1f}%")
    if result['indicators']:
        print("Suspicious Indicators:")
        for indicator in result['indicators']:
            print(f"  - {indicator}")
    else:
        print("No suspicious indicators found")
    
    # Save the model
    detector.save_model('instagram_fake_detector.pkl')
    
    return detector

def analyze_custom_account():
    """Analyze a custom account after training"""
    # Load trained model
    detector = InstagramFakeDetector()
    detector.load_model('instagram_fake_detector.pkl')
    
    # Test account
    test_account = {
        'profile pic': 1,
        'nums/length username': 0.25,
        'fullname words': 1,
        'nums/length fullname': 0.0,
        'name==username': 0,
        'description length': 60,
        'external URL': 0,
        'private': 0,
        '#posts': 156,
        '#followers': 789,
        '#follows': 456
    }
    
    result = detector.explain_prediction(test_account)
    print(f"\nCustom Account Analysis:")
    print(f"Prediction: {result['prediction']}")
    print(f"Trust Score: {result['trust_score']:.1f}%")
    print(f"Confidence: {result['confidence']:.1f}%")
    
    if result['indicators']:
        print("Suspicious Indicators:")
        for indicator in result['indicators']:
            print(f"  - {indicator}")

# Add this to the bottom:
if __name__ == "__main__":
    detector = main()
    analyze_custom_account()
