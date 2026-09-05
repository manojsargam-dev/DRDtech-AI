from app.aptos import predict_aptos

IMAGE_PATH = "test_images/lol.png"
OUTPUT_DIR = "outputs"

result = predict_aptos(
    IMAGE_PATH,
    OUTPUT_DIR
)

print("\n========== APTOS RESULT ==========")
print("Predicted class:", result["predicted_class"])
print("Class name:", result["class_name"])
print("Confidence:", result["confidence"])
print("Probabilities:", result["probabilities"])
print("Grad-CAM:", result["heatmap_path"])
print("==================================")