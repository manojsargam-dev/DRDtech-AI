import os
import cv2
import numpy as np
import tensorflow as tf


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "drive_vessel_unet.keras"
)

PATCH_SIZE = 128
STRIDE = 64

# Vessel probability threshold
THRESHOLD = 0.5


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading DRIVE vessel segmentation model...")

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("DRIVE model loaded successfully.")
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)


# ============================================================
# CALCULATE PATCH POSITIONS
# ============================================================

def get_patch_positions(length, patch_size, stride):
    """
    Generate patch starting positions so that the ENTIRE image
    is covered, including the final edge.

    Example:
        image = 579 pixels
        patch = 128
        stride = 64

    The final patch is explicitly placed at:
        579 - 128 = 451
    """

    if length <= patch_size:
        return [0]

    positions = list(
        range(
            0,
            length - patch_size + 1,
            stride
        )
    )

    final_position = length - patch_size

    if positions[-1] != final_position:
        positions.append(final_position)

    return positions


# ============================================================
# FULL IMAGE VESSEL PREDICTION
# ============================================================

def predict_vessels(image):
    """
    Predict retinal blood vessels from a full RGB fundus image.

    Parameters
    ----------
    image : numpy.ndarray
        RGB image with shape (H, W, 3).

    Returns
    -------
    binary_mask : numpy.ndarray
        Binary vessel mask.
        Values are 0 or 255.

    probability_map : numpy.ndarray
        Full-resolution vessel probability map.
        Values range from 0 to 1.
    """

    if image is None:
        raise ValueError(
            "Input image is None."
        )

    if len(image.shape) != 3 or image.shape[2] != 3:
        raise ValueError(
            f"Expected RGB image with shape (H, W, 3), "
            f"got {image.shape}"
        )

    original_height, original_width = image.shape[:2]

    # --------------------------------------------------------
    # Convert to float [0, 1]
    # --------------------------------------------------------

    image_float = (
        image.astype(np.float32) / 255.0
    )

    # --------------------------------------------------------
    # Pad image if smaller than patch size
    # --------------------------------------------------------

    padded_height = max(
        original_height,
        PATCH_SIZE
    )

    padded_width = max(
        original_width,
        PATCH_SIZE
    )

    # Make sure the dimensions allow complete stride coverage.
    #
    # We don't strictly need dimensions to be multiples of STRIDE
    # because get_patch_positions() places the final patch at the edge,
    # but padding here guarantees that small images also work.
    pad_bottom = padded_height - original_height
    pad_right = padded_width - original_width

    padded_image = np.pad(
        image_float,
        (
            (0, pad_bottom),
            (0, pad_right),
            (0, 0)
        ),
        mode="reflect"
    )

    # --------------------------------------------------------
    # Get patch coordinates
    # --------------------------------------------------------

    y_positions = get_patch_positions(
        padded_height,
        PATCH_SIZE,
        STRIDE
    )

    x_positions = get_patch_positions(
        padded_width,
        PATCH_SIZE,
        STRIDE
    )

    # --------------------------------------------------------
    # Prediction accumulators
    # --------------------------------------------------------

    prediction_sum = np.zeros(
        (padded_height, padded_width),
        dtype=np.float32
    )

    prediction_count = np.zeros(
        (padded_height, padded_width),
        dtype=np.float32
    )

    # --------------------------------------------------------
    # Process patches
    # --------------------------------------------------------

    for y in y_positions:

        for x in x_positions:

            patch = padded_image[
                y:y + PATCH_SIZE,
                x:x + PATCH_SIZE
            ]

            if patch.shape[0] != PATCH_SIZE or \
               patch.shape[1] != PATCH_SIZE:

                continue

            patch_batch = np.expand_dims(
                patch,
                axis=0
            )

            # ------------------------------------------------
            # U-Net prediction
            # ------------------------------------------------

            prediction = model.predict(
                patch_batch,
                verbose=0
            )[0]

            # ------------------------------------------------
            # Convert to 2D
            # ------------------------------------------------

            prediction = np.squeeze(
                prediction
            )

            # Safety check
            if prediction.shape != (
                PATCH_SIZE,
                PATCH_SIZE
            ):
                prediction = cv2.resize(
                    prediction,
                    (
                        PATCH_SIZE,
                        PATCH_SIZE
                    ),
                    interpolation=cv2.INTER_LINEAR
                )

            # ------------------------------------------------
            # Accumulate overlapping predictions
            # ------------------------------------------------

            prediction_sum[
                y:y + PATCH_SIZE,
                x:x + PATCH_SIZE
            ] += prediction

            prediction_count[
                y:y + PATCH_SIZE,
                x:x + PATCH_SIZE
            ] += 1.0

    # --------------------------------------------------------
    # Avoid division by zero
    # --------------------------------------------------------

    prediction_count[
        prediction_count == 0
    ] = 1.0

    # --------------------------------------------------------
    # Average overlapping predictions
    # --------------------------------------------------------

    probability_map = (
        prediction_sum /
        prediction_count
    )

    # --------------------------------------------------------
    # Crop back to ORIGINAL image dimensions
    # --------------------------------------------------------

    probability_map = probability_map[
        :original_height,
        :original_width
    ]

    # --------------------------------------------------------
    # Convert probability -> binary mask
    # --------------------------------------------------------

    binary_mask = (
        probability_map > THRESHOLD
    ).astype(np.uint8) * 255

    return binary_mask, probability_map


# ============================================================
# IMAGE FILE HELPER
# ============================================================

def extract_vessels_from_file(
    image_path,
    output_path=None
):
    """
    Load an image from disk and generate its retinal
    vessel segmentation mask.

    Parameters
    ----------
    image_path : str
        Path to input fundus image.

    output_path : str, optional
        Path where vessel mask should be saved.

    Returns
    -------
    binary_mask : numpy.ndarray
        Binary vessel mask.

    probability_map : numpy.ndarray
        Vessel probability map.
    """

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    image = cv2.imread(
        image_path,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError(
            f"Could not read image: {image_path}"
        )

    # --------------------------------------------------------
    # OpenCV loads BGR.
    #
    # The DRIVE model was trained using RGB images,
    # so convert BGR -> RGB.
    # --------------------------------------------------------

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    # --------------------------------------------------------
    # Predict vessels
    # --------------------------------------------------------

    binary_mask, probability_map = (
        predict_vessels(image)
    )

    # --------------------------------------------------------
    # Save mask
    # --------------------------------------------------------

    if output_path is not None:

        output_directory = os.path.dirname(
            output_path
        )

        if output_directory:
            os.makedirs(
                output_directory,
                exist_ok=True
            )

        success = cv2.imwrite(
            output_path,
            binary_mask
        )

        if not success:
            raise RuntimeError(
                f"Could not save vessel mask to: "
                f"{output_path}"
            )

    return (
        binary_mask,
        probability_map
    )