"""
Django settings for the Mini Product Store backend.

This is a LOCAL DEVELOPMENT configuration for a learning project.
Do not use these settings in production as-is.

Secrets and machine-specific values (secret key, debug flag, MySQL credentials)
are read from the .env file next to manage.py. Copy .env.example to .env to start.
"""
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / "subdir".
BASE_DIR = Path(__file__).resolve().parent.parent

# Load variables from mini_store_backend/.env into os.environ.
# Variables already set in the shell take priority over the file.
load_dotenv(BASE_DIR / ".env")


def env_bool(name, default=False):
    """Read "True"/"False" (also 1/0, yes/no) from the environment."""
    return os.getenv(name, str(default)).strip().lower() in ("true", "1", "yes", "on")


def env_list(name, default=""):
    """Read a comma-separated value like "localhost,127.0.0.1" as a list."""
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


# ---------------------------------------------------------------------------
# Core settings
# ---------------------------------------------------------------------------

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ImproperlyConfigured(
        "SECRET_KEY is not set. Copy .env.example to .env and fill in the values."
    )

DEBUG = env_bool("DEBUG", default=False)

# "*" lets a phone on the same Wi-Fi reach the server via http://YOUR_LAN_IP:8000.
# Fine for local learning; list real host names in production.
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", default="*")


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

INSTALLED_APPS = [
    # Django built-ins (auth/sessions are only needed by the Django admin)
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    # Local apps
    "products",
    "cart",
    "notifications",
]

MIDDLEWARE = [
    # CorsMiddleware must be placed as high as possible,
    # and before any middleware that can generate responses (e.g. CommonMiddleware).
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Database (MySQL)
# ---------------------------------------------------------------------------
# 1. Create the database first:  CREATE DATABASE mini_store_db CHARACTER SET utf8mb4;
# 2. Put your MySQL credentials in .env (DB_NAME, DB_USER, DB_PASSWORD, ...).

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME", "mini_store_db"),
        "USER": os.getenv("DB_USER", "root"),
        "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}


# ---------------------------------------------------------------------------
# Password validation (used only for the Django admin superuser)
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static files (CSS/JS for the admin, browsable API and Swagger UI)
# ---------------------------------------------------------------------------

STATIC_URL = "static/"


# ---------------------------------------------------------------------------
# Media files (user uploads: product images and product documents)
# ---------------------------------------------------------------------------
# MEDIA_ROOT: the folder on disk where uploads are saved.
# MEDIA_URL:  the URL prefix used to serve them, e.g.
#             http://YOUR_LAN_IP:8000/media/products/headphones.jpg

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Upload size limits enforced by the serializers (in bytes).
MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    # No authentication in this learning project: every endpoint is public.
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    # JSON for normal requests, multipart/form for file uploads.
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.MultiPartParser",
        "rest_framework.parsers.FormParser",
    ],
    # JSON for clients, browsable HTML API when opened in a web browser.
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    # OpenAPI schema generation for Swagger UI (drf-spectacular).
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# ---------------------------------------------------------------------------
# Swagger / OpenAPI (drf-spectacular)
# ---------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "Mini Product Store API",
    "DESCRIPTION": (
        "Learning backend for a mini product store: products (with image and "
        "document upload), dropdown/radio options, a demo cart and notifications. "
        "No authentication is required."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # Separate request/response components so file fields show up as
    # "choose file" inputs in Swagger UI for multipart requests.
    "COMPONENT_SPLIT_REQUEST": True,
}


# ---------------------------------------------------------------------------
# CORS (django-cors-headers)
# ---------------------------------------------------------------------------
# Browsers block JavaScript on one origin (e.g. http://localhost:8081) from
# reading responses from another origin (http://YOUR_LAN_IP:8000) unless the
# server sends CORS headers that allow it.
#
# Native mobile apps are not browsers, so CORS does not affect them; it matters
# for web clients (React web, Expo web, a page opened in the browser).
#
# For local learning we allow every origin. For a stricter setup, set this to
# False and list the allowed origins instead:
#
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:8081",
#     "http://localhost:3000",
#     "http://YOUR_LAN_IP:8081",
# ]

CORS_ALLOW_ALL_ORIGINS = True
