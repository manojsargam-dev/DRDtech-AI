import os
import zipfile
import tempfile

import cv2
import numpy as np
import tensorflow as tf


# =========================================================
# PATHS
# =========================================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "resnet101_finetuned_best.keras",
)


# =========================================================
# APTOS CLASSES
# =========================================================

CLASS_NAMES = [
    "No DR",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative",
]


IMAGE_SIZE = (224, 224)


# =========================================================
# BUILD MODEL
# =========================================================

def build_aptos_model():

    inputs = tf.keras.Input(
        shape=(224, 224, 3),
        name="input_layer",
    )

    base_model = tf.keras.applications.ResNet101(
        weights=None,
        include_top=False,
        input_shape=(224, 224, 3),
    )

    base_model.trainable = True

    # Same fine-tuning setup as training
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    for layer in base_model.layers[-30:]:
        layer.trainable = True

    x = base_model(
        inputs,
        training=False,
    )

    x = tf.keras.layers.GlobalAveragePooling2D(
        name="global_average_pooling2d"
    )(x)

    x = tf.keras.layers.Dropout(
        0.3,
        name="dropout",
    )(x)

    outputs = tf.keras.layers.Dense(
        5,
        activation="softmax",
        name="dense",
    )(x)

    model = tf.keras.Model(
        inputs,
        outputs,
        name="aptos_resnet101",
    )

    return model, base_model


# =========================================================
# LOAD MODEL
# =========================================================

def load_aptos_model():

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"APTOS model not found: {MODEL_PATH}"
        )

    model, base_model = build_aptos_model()

    with tempfile.TemporaryDirectory() as tmpdir:

        with zipfile.ZipFile(
            MODEL_PATH,
            "r",
        ) as z:

            if "model.weights.h5" not in z.namelist():
                raise RuntimeError(
                    "model.weights.h5 was not found inside "
                    "the APTOS .keras file."
                )

            weights_path = os.path.join(
                tmpdir,
                "model.weights.h5",
            )

            with z.open("model.weights.h5") as src:
                with open(weights_path, "wb") as dst:
                    dst.write(src.read())

        model.load_weights(weights_path)

    return model, base_model


# =========================================================
# LOAD ORIGINAL IMAGE
# =========================================================

def load_original_image(image_path):

    image = cv2.imread(
        image_path,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise RuntimeError(
            f"Could not read image: {image_path}"
        )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB,
    )

    return image


# =========================================================
# FIND FUNDUS / REMOVE BLACK BORDER
# =========================================================

def crop_fundus(image):
    """
    Detect the retinal region and remove large black borders.

    Returns:
        cropped_image
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY,
    )

    # Anything brighter than almost-black
    mask = gray > 10

    # Find non-black pixels
    coords = np.column_stack(
        np.where(mask)
    )

    if coords.size == 0:
        return image

    y_min, x_min = coords.min(axis=0)
    y_max, x_max = coords.max(axis=0)

    # Small padding
    padding = 5

    y_min = max(0, y_min - padding)
    x_min = max(0, x_min - padding)

    y_max = min(
        image.shape[0],
        y_max + padding,
    )

    x_max = min(
        image.shape[1],
        x_max + padding,
    )

    cropped = image[
        y_min:y_max,
        x_min:x_max,
    ]

    return cropped


# =========================================================
# CREATE FUNDUS MASK
# =========================================================

def create_fundus_mask(image):
    """
    Creates a circular/elliptical mask around the
    visible retinal region.

    This prevents Grad-CAM colors from appearing
    in the black corners.
    """

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY,
    )

    # Detect non-black area
    binary = np.where(
        gray > 8,
        255,
        0,
    ).astype(np.uint8)

    # Remove tiny noise
    kernel = np.ones(
        (9, 9),
        np.uint8,
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_CLOSE,
        kernel,
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        kernel,
    )

    # Find contours
    contours, _ = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    mask = np.zeros(
        gray.shape,
        dtype=np.uint8,
    )

    if contours:

        largest = max(
            contours,
            key=cv2.contourArea,
        )

        area = cv2.contourArea(largest)

        total_area = (
            image.shape[0] *
            image.shape[1]
        )

        # Only use contour if it is significant
        if area > total_area * 0.15:

            cv2.drawContours(
                mask,
                [largest],
                -1,
                255,
                thickness=-1,
            )

        else:
            mask[:] = 255

    else:
        mask[:] = 255

    # Slightly smooth mask
    mask = cv2.GaussianBlur(
        mask,
        (11, 11),
        0,
    )

    return mask


# =========================================================
# PREPROCESS FOR RESNET
# =========================================================

def preprocess_image(image):

    resized = cv2.resize(
        image,
        IMAGE_SIZE,
        interpolation=cv2.INTER_AREA,
    )

    image_array = resized.astype(
        np.float32
    )

    batch = np.expand_dims(
        image_array,
        axis=0,
    )

    processed = (
        tf.keras.applications.resnet.preprocess_input(
            batch.copy()
        )
    )

    return resized, processed


# =========================================================
# FIND LAST CONVOLUTIONAL LAYER
# =========================================================

def find_last_conv_layer(base_model):

    for layer in reversed(base_model.layers):

        if isinstance(
            layer,
            tf.keras.layers.Conv2D,
        ):

            return layer

    raise RuntimeError(
        "No Conv2D layer was found in ResNet101."
    )


# =========================================================
# GRAD-CAM
# =========================================================

def make_gradcam_heatmap(
    processed_image,
    model,
    base_model,
    last_conv_layer,
    target_class,
):

    conv_model = tf.keras.Model(
        inputs=base_model.input,
        outputs=last_conv_layer.output,
    )

    gap_layer = model.get_layer(
        "global_average_pooling2d"
    )

    dropout_layer = model.get_layer(
        "dropout"
    )

    dense_layer = model.get_layer(
        "dense"
    )

    with tf.GradientTape() as tape:

        conv_outputs = conv_model(
            processed_image,
            training=False,
        )

        tape.watch(conv_outputs)

        x = gap_layer(
            conv_outputs
        )

        x = dropout_layer(
            x,
            training=False,
        )

        predictions = dense_layer(x)

        class_output = predictions[
            :,
            target_class,
        ]

    grads = tape.gradient(
        class_output,
        conv_outputs,
    )

    if grads is None:
        raise RuntimeError(
            "Could not calculate Grad-CAM gradients."
        )

    pooled_grads = tf.reduce_mean(
        grads,
        axis=(1, 2),
    )

    conv_outputs = conv_outputs[0]
    pooled_grads = pooled_grads[0]

    heatmap = tf.reduce_sum(
        conv_outputs * pooled_grads,
        axis=-1,
    )

    heatmap = tf.maximum(
        heatmap,
        0,
    )

    max_value = tf.reduce_max(
        heatmap
    )

    if float(max_value) > 0:
        heatmap = (
            heatmap /
            max_value
        )

    return heatmap.numpy()


# =========================================================
# SAVE GRAD-CAM
# =========================================================

def save_gradcam_overlay(
    original_image,
    heatmap,
    fundus_mask,
    output_path,
):
    """
    Creates a large Grad-CAM image.

    Important:
    - Heatmap is resized to original/cropped image.
    - Black corners are protected.
    - Heatmap is only visible inside the fundus.
    """

    height = original_image.shape[0]
    width = original_image.shape[1]

    # Resize Grad-CAM
    heatmap_uint8 = np.uint8(
        np.clip(
            heatmap * 255,
            0,
            255,
        )
    )

    heatmap_uint8 = cv2.resize(
        heatmap_uint8,
        (width, height),
        interpolation=cv2.INTER_CUBIC,
    )

    # -----------------------------------------------------
    # APPLY FUNDUS MASK
    # -----------------------------------------------------

    mask_float = (
        fundus_mask.astype(np.float32)
        / 255.0
    )

    # Smooth mask boundaries
    mask_float = np.clip(
        mask_float,
        0,
        1,
    )

    heatmap_float = (
        heatmap_uint8.astype(np.float32)
        * mask_float
    )

    heatmap_uint8 = np.uint8(
        np.clip(
            heatmap_float,
            0,
            255,
        )
    )

    # -----------------------------------------------------
    # COLOR MAP
    # -----------------------------------------------------

    heatmap_color = cv2.applyColorMap(
        heatmap_uint8,
        cv2.COLORMAP_JET,
    )

    heatmap_color = cv2.cvtColor(
        heatmap_color,
        cv2.COLOR_BGR2RGB,
    )

    # -----------------------------------------------------
    # ORIGINAL IMAGE
    # -----------------------------------------------------

    original_float = (
        original_image.astype(np.float32)
    )

    heatmap_float = (
        heatmap_color.astype(np.float32)
    )

    # -----------------------------------------------------
    # BLEND
    # -----------------------------------------------------

    overlay = (
        original_float * 0.60
        +
        heatmap_float * 0.40
    )

    overlay = np.uint8(
        np.clip(
            overlay,
            0,
            255,
        )
    )

    # -----------------------------------------------------
    # PROTECT BLACK BACKGROUND
    # -----------------------------------------------------

    mask_3channel = np.repeat(
        mask_float[:, :, np.newaxis],
        3,
        axis=2,
    )

    # Keep original outside fundus
    overlay = (
        overlay * mask_3channel
        +
        original_image *
        (1 - mask_3channel)
    )

    overlay = np.uint8(
        np.clip(
            overlay,
            0,
            255,
        )
    )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    overlay_bgr = cv2.cvtColor(
        overlay,
        cv2.COLOR_RGB2BGR,
    )

    os.makedirs(
        os.path.dirname(output_path)
        or ".",
        exist_ok=True,
    )

    cv2.imwrite(
        output_path,
        overlay_bgr,
        [
            cv2.IMWRITE_JPEG_QUALITY,
            95,
        ],
    )

    return output_path


# =========================================================
# LOAD MODEL ONCE
# =========================================================

model, base_model = load_aptos_model()

last_conv_layer = find_last_conv_layer(
    base_model
)


# =========================================================
# MAIN PREDICTION FUNCTION
# =========================================================

def predict_aptos(
    image_path,
    output_dir=None,
):

    if output_dir is None:

        output_dir = os.path.join(
            os.path.dirname(
                os.path.dirname(__file__)
            ),
            "outputs",
        )

    os.makedirs(
        output_dir,
        exist_ok=True,
    )

    # -----------------------------------------------------
    # LOAD ORIGINAL
    # -----------------------------------------------------

    original_image = load_original_image(
        image_path
    )

    # -----------------------------------------------------
    # CROP BLACK BORDER
    # -----------------------------------------------------

    cropped_image = crop_fundus(
        original_image
    )

    # -----------------------------------------------------
    # CREATE FUNDUS MASK
    # -----------------------------------------------------

    fundus_mask = create_fundus_mask(
        cropped_image
    )

    # -----------------------------------------------------
    # MODEL PREPROCESSING
    # -----------------------------------------------------

    resized_image, processed_image = (
        preprocess_image(
            cropped_image
        )
    )

    # -----------------------------------------------------
    # PREDICTION
    # -----------------------------------------------------

    predictions = model.predict(
        processed_image,
        verbose=0,
    )[0]

    predicted_class = int(
        np.argmax(predictions)
    )

    confidence = float(
        predictions[predicted_class]
    )

    # -----------------------------------------------------
    # GRAD-CAM
    # -----------------------------------------------------
    #
    # IMPORTANT:
    # We explicitly use the predicted class.
    # This prevents the previous error:
    #
    # "Grad-CAM class does not match prediction class"
    #
    # -----------------------------------------------------

    heatmap = make_gradcam_heatmap(
        processed_image,
        model,
        base_model,
        last_conv_layer,
        predicted_class,
    )

    # -----------------------------------------------------
    # OUTPUT FILE
    # -----------------------------------------------------

    filename = os.path.splitext(
        os.path.basename(image_path)
    )[0]

    heatmap_path = os.path.join(
        output_dir,
        f"{filename}_gradcam.jpg",
    )

    # -----------------------------------------------------
    # SAVE LARGE GRAD-CAM
    # -----------------------------------------------------

    save_gradcam_overlay(
        cropped_image,
        heatmap,
        fundus_mask,
        heatmap_path,
    )

    # -----------------------------------------------------
    # RESULT
    # -----------------------------------------------------

    return {

        "predicted_class":
            predicted_class,

        "class_name":
            CLASS_NAMES[predicted_class],

        "confidence":
            confidence,

        "probabilities":
            [
                float(x)
                for x in predictions
            ],

        "heatmap_path":
            heatmap_path,
    }