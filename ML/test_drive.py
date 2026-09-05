from app.drive import extract_vessels_from_file

IMAGE_PATH = "test_images/lol.png"
OUTPUT_PATH = "outputs/lol_vessels.png"

binary_mask, probability_map = extract_vessels_from_file(
    IMAGE_PATH,
    OUTPUT_PATH
)

print(f"Vessel mask saved to: {OUTPUT_PATH}")
print("Mask shape:", binary_mask.shape)
print("Probability map shape:", probability_map.shape)