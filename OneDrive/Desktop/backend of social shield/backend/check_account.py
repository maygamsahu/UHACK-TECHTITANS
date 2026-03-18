# check_account.py
from instagram_fake_detector import InstagramFakeDetector

def main():
    # Load trained model
    detector = InstagramFakeDetector()
    try:
        detector.load_model('instagram_fake_detector.pkl')
    except FileNotFoundError:
        print("Model not found! Please run 'python instagram_fake_detector.py' first.")
        return
    
    # Analyze any account by changing these values:
    account = {
        'profile pic': 1,
        'nums/length username': 0.15,
        'fullname words': 2,
        'nums/length fullname': 0.0,
        'name==username': 0,
        'description length': 75,
        'external URL': 0,
        'private': 0,
        '#posts': 89,
        '#followers': 456,
        '#follows': 320
    }

    result = detector.explain_prediction(account)
    print(f"\n=== ACCOUNT ANALYSIS ===")
    print(f"Prediction: {result['prediction']}")
    print(f"Trust Score: {result['trust_score']:.1f}%")
    print(f"Confidence: {result['confidence']:.1f}%")
    
    if result['indicators']:
        print("\n⚠️  Red Flags Found:")
        for indicator in result['indicators']:
            print(f"  • {indicator}")
    else:
        print("\n✅ No suspicious indicators found")

if __name__ == "__main__":
    main()
