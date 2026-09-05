import os
import shutil
import uuid
import requests

from fastapi import FastAPI, File, UploadFile, Request, Form
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

from app.aptos import predict_aptos
from app.drive import extract_vessels_from_file


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="DR AI Server",
    description="Diabetic Retinopathy and Retinal Vessel Analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DIRECTORIES
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "outputs"
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# =========================================================
# SERVE GENERATED IMAGES
# =========================================================

app.mount(
    "/outputs",
    StaticFiles(directory=OUTPUT_DIR),
    name="outputs",
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "DR AI Server is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# =========================================================
# PREDICTION ENDPOINT
# =========================================================

@app.post("/predict")
async def predict(

    request: Request,

    file: UploadFile = File(None),

    image_url: str = Form(None),

):

    # =====================================================
    # VALIDATE INPUT
    # =====================================================

    if (
        (file is None or not file.filename)
        and not image_url
    ):

        return {

            "success": False,

            "error": (
                "Provide either an image file "
                "or image_url."
            )

        }


    # =====================================================
    # UNIQUE ID
    # =====================================================

    unique_id = str(
        uuid.uuid4()
    )


    # =====================================================
    # IMAGE UPLOAD
    # =====================================================

    if file is not None and file.filename:

        extension = os.path.splitext(
            file.filename
        )[1].lower()


        # -------------------------------------------------
        # Validate extension
        # -------------------------------------------------

        if extension not in [
            ".jpg",
            ".jpeg",
            ".png"
        ]:

            return {

                "success": False,

                "error": (
                    "Only JPG, JPEG and PNG "
                    "images are supported."
                )

            }


        # -------------------------------------------------
        # Create unique filename
        # -------------------------------------------------

        unique_name = (
            f"{unique_id}{extension}"
        )


        image_path = os.path.join(
            UPLOAD_DIR,
            unique_name
        )


        # -------------------------------------------------
        # Save uploaded image
        # -------------------------------------------------

        with open(
            image_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # -------------------------------------------------
        # Original image filename
        # -------------------------------------------------

        original_filename = (
            f"{unique_id}_original{extension}"
        )


        original_display_name = (
            file.filename
        )


    # =====================================================
    # IMAGE URL
    # =====================================================

    else:

        try:

            response = requests.get(

                image_url,

                timeout=20

            )

            response.raise_for_status()


            # -------------------------------------------------
            # Verify that URL returned an image
            # -------------------------------------------------

            content_type = (
                response.headers.get(
                    "content-type",
                    ""
                )
            )


            if not content_type.startswith(
                "image/"
            ):

                return {

                    "success": False,

                    "error": (
                        "URL did not return an image. "
                        f"Content-Type: {content_type}"
                    )

                }


        except requests.RequestException as e:

            return {

                "success": False,

                "error": (
                    "Could not download image "
                    f"from URL: {str(e)}"
                )

            }


        # -------------------------------------------------
        # Determine extension from URL
        # -------------------------------------------------

        url_path = image_url.split("?")[0]

        extension = os.path.splitext(
            url_path
        )[1].lower()


        if extension not in [
            ".jpg",
            ".jpeg",
            ".png"
        ]:

            # Cloudinary and similar URLs may not
            # contain an extension.
            extension = ".jpg"


        # -------------------------------------------------
        # Create unique filename
        # -------------------------------------------------

        unique_name = (
            f"{unique_id}{extension}"
        )


        image_path = os.path.join(
            UPLOAD_DIR,
            unique_name
        )


        # -------------------------------------------------
        # Save downloaded image
        # -------------------------------------------------

        with open(
            image_path,
            "wb"
        ) as buffer:

            buffer.write(
                response.content
            )


        # -------------------------------------------------
        # Original image filename
        # -------------------------------------------------

        original_filename = (
            f"{unique_id}_original{extension}"
        )


        original_display_name = (
            image_url
        )


    # =====================================================
    # APTOS DIABETIC RETINOPATHY PREDICTION
    # =====================================================

    aptos_result = predict_aptos(

        image_path,

        OUTPUT_DIR

    )


    # =====================================================
    # DRIVE VESSEL EXTRACTION
    # =====================================================

    vessel_filename = (

        f"{os.path.splitext(unique_name)[0]}"
        f"_vessels.png"

    )


    vessel_path = os.path.join(

        OUTPUT_DIR,

        vessel_filename

    )


    binary_mask, probability_map = (
        extract_vessels_from_file(

            image_path,

            vessel_path

        )
    )


    # =====================================================
    # SAVE ORIGINAL IMAGE
    # =====================================================

    original_path = os.path.join(

        OUTPUT_DIR,

        original_filename

    )


    shutil.copy2(

        image_path,

        original_path

    )


    # =====================================================
    # GRAD-CAM FILENAME
    # =====================================================

    heatmap_filename = os.path.basename(

        aptos_result[
            "heatmap_path"
        ]

    )


    # =====================================================
    # BASE URL
    # =====================================================

    base_url = str(

        request.base_url

    ).rstrip("/")


    # =====================================================
    # BUILD IMAGE URLs
    # =====================================================

    original_url = (

        f"{base_url}/outputs/"
        f"{original_filename}"

    )


    gradcam_url = (

        f"{base_url}/outputs/"
        f"{heatmap_filename}"

    )


    vessel_mask_url = (

        f"{base_url}/outputs/"
        f"{vessel_filename}"

    )


    # =====================================================
    # RETURN COMPLETE RESULT
    # =====================================================

    return {

        "success": True,


        # -------------------------------------------------
        # Input filename / URL
        # -------------------------------------------------

        "filename": original_display_name,


        # =================================================
        # APTOS
        # =================================================

        "aptos": {

            "predicted_class":
                aptos_result[
                    "predicted_class"
                ],


            "class_name":
                aptos_result[
                    "class_name"
                ],


            "confidence":
                aptos_result[
                    "confidence"
                ],


            "probabilities": {

                "No DR":
                    aptos_result[
                        "probabilities"
                    ][0],

                "Mild":
                    aptos_result[
                        "probabilities"
                    ][1],

                "Moderate":
                    aptos_result[
                        "probabilities"
                    ][2],

                "Severe":
                    aptos_result[
                        "probabilities"
                    ][3],

                "Proliferative DR":
                    aptos_result[
                        "probabilities"
                    ][4],

            },


            "heatmap_url":
                gradcam_url,

        },


        # =================================================
        # DRIVE
        # =================================================

        "drive": {

            "vessel_mask_url":
                vessel_mask_url,


            "mask_width":
                int(
                    binary_mask.shape[1]
                ),


            "mask_height":
                int(
                    binary_mask.shape[0]
                ),

        },


        # =================================================
        # ALL GENERATED IMAGES
        # =================================================

        "images": {

            "original":
                original_url,


            "gradcam":
                gradcam_url,


            "vessel_mask":
                vessel_mask_url,

        },

    }