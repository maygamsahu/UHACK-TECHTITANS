from core.ai_model import InstagramFakeDetector

def main():
    detector = InstagramFakeDetector()
    accuracy = detector.train_and_save_model()
    print(f"Model trained with accuracy: {accuracy:.2%}")
    print("Model saved to models/instagram_detector.pkl")

if __name__ == "__main__":
    main()
