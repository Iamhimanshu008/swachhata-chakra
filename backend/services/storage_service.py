"""
Storage service: Handle image uploads to MinIO (S3 compatible) storage.
Falls back to local file storage when MinIO is not configured (e.g. Render).
"""
import json
import logging
import os
import uuid
from fastapi import HTTPException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MinIO Configuration — use .get() so missing keys don't crash the app
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "")
BUCKET_NAME = "smartwaste-photos"
PUBLIC_URL_PREFIX = os.environ.get("MINIO_PUBLIC_URL", "http://localhost:9000")

# Upload directory for local fallback
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")

# Initialize boto3 client only if MinIO credentials are provided
s3_client = None

if MINIO_ACCESS_KEY and MINIO_SECRET_KEY and MINIO_ENDPOINT:
    try:
        import boto3
        from botocore.client import Config
        from botocore.exceptions import ClientError

        s3_client = boto3.client(
            "s3",
            endpoint_url=MINIO_ENDPOINT,
            aws_access_key_id=MINIO_ACCESS_KEY,
            aws_secret_access_key=MINIO_SECRET_KEY,
            config=Config(signature_version="s3v4"),
        )
        logger.info("✅ MinIO client initialized successfully")
    except Exception as e:
        s3_client = None
        logger.warning(f"⚠️ MinIO client init failed: {e}")
else:
    logger.info("⚠️ MinIO not configured — using local file storage fallback")


def _init_bucket():
    """Ensure the bucket exists and has a public read policy."""
    if s3_client is None:
        return

    from botocore.exceptions import ClientError

    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
        logger.info(f"Bucket '{BUCKET_NAME}' already exists.")
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "404":
            logger.info(f"Bucket '{BUCKET_NAME}' not found. Creating...")
            s3_client.create_bucket(Bucket=BUCKET_NAME)
            
            # Set public read policy so images can be accessed directly via URL
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
                    }
                ]
            }
            s3_client.put_bucket_policy(Bucket=BUCKET_NAME, Policy=json.dumps(policy))
            logger.info(f"Public read policy applied to '{BUCKET_NAME}'.")
        else:
            logger.error(f"Error checking bucket: {e}")
            raise


# Run bucket initialization synchronously on module load
try:
    _init_bucket()
except Exception as e:
    logger.warning(f"Could not initialize MinIO bucket on startup: {e}")


def upload_image(file_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> str:
    """
    Upload an image to MinIO and return its public URL.
    Falls back to local file storage when MinIO is not available.
    """
    if not filename:
        ext = ".jpg" if "jpeg" in content_type else ".png"
        filename = f"{uuid.uuid4().hex}{ext}"

    # ── Fallback: save to local uploads/ directory ──
    if s3_client is None:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        local_path = os.path.join(UPLOAD_DIR, filename)
        try:
            with open(local_path, "wb") as f:
                f.write(file_bytes)
            logger.info(f"Saved locally: {local_path}")
            return f"/uploads/{filename}"
        except Exception as e:
            logger.error(f"Local file save failed: {e}")
            raise HTTPException(status_code=500, detail="File storage error.")

    # ── Primary: upload to MinIO ──
    from botocore.exceptions import ClientError

    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=filename,
            Body=file_bytes,
            ContentType=content_type,
        )
        
        return f"{PUBLIC_URL_PREFIX}/{BUCKET_NAME}/{filename}"
        
    except ClientError as e:
        logger.error(f"S3 Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Storage service error during image upload.")
