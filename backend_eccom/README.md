# Mini Product Store Backend

A small but realistic **Django + Django REST Framework + MySQL** backend for learning API development and API integration.
It covers product CRUD, image and document uploads, dropdown and radio option APIs, a demo cart with stock checks, notifications, Django admin, CORS and Swagger docs.

> No authentication, no payments and no frontend. Every endpoint is public. The project is meant for local learning.

---

## 1. Project overview

| Item | Value |
|---|---|
| Language | Python 3.10+ (tested on 3.14) |
| Framework | Django 5.2 LTS + Django REST Framework 3.16 |
| Database | **MySQL** (driver: `mysqlclient`) |
| Uploads | Django `ImageField` / `FileField` → `media/` folder |
| Docs | Swagger UI (`/api/docs/`), ReDoc (`/api/redoc/`) via drf-spectacular |
| Apps | `products`, `cart`, `notifications` |

The backend is built for a client app, such as a mobile app, that shows a product list, a product details screen, a product form (dropdown for category, radio buttons for condition, image picker, document picker), a cart screen and a notifications screen.

---

## 2. Features

- **Product CRUD**: list, details, create, full update (PUT), partial update (PATCH), delete
- **Image upload** (`image`): stored in `media/products/` and returned as an absolute URL
- **Document upload** (`product_file`, PDF/DOC/DOCX): stored in `media/product_files/`
- **JSON and multipart/form-data** on the same endpoints
- **Option APIs**: `/api/categories/` (dropdown) and `/api/options/` (dropdown + radio)
- **Demo cart**: add, view (with subtotal and total), change quantity, remove
  - Adding the same product again **increases the quantity** instead of creating a duplicate row
  - Quantity can never exceed the product's stock: `{"detail": "Only 3 items are available."}`
- **Notifications**: CRUD plus mark as read; created automatically when a product is added or the cart changes
- **Django admin** for all three models (image preview, inline quantity and read-status editing, bulk "mark as read")
- **Swagger UI** for clicking through every API, including file uploads
- **Sample data** command: `python manage.py seed_products`
- Old image or document files are removed from disk when replaced or when a product is deleted

---

## 3. Installation commands (Windows)

Run in **PowerShell** or **Command Prompt**.

```powershell
# 1. Go to the project folder (this folder contains manage.py)
cd C:\Users\Salma\Desktop\react_native_sample_project\mini_store_backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate it
#    PowerShell:
venv\Scripts\Activate.ps1
#    Command Prompt (cmd.exe):
venv\Scripts\activate.bat

# 4. Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 5. Create the MySQL database (see section 5), then create .env and set DB_PASSWORD
copy .env.example .env      # skip if .env already exists

# 6. Apply migrations (creates all tables in MySQL)
python manage.py migrate

# 7. (Optional) add sample products
python manage.py seed_products

# 8. Create an admin user
python manage.py createsuperuser

# 9. Run the server (0.0.0.0 makes it reachable from your phone on the same Wi-Fi)
python manage.py runserver 0.0.0.0:8000
```

> If PowerShell refuses to run `Activate.ps1` ("running scripts is disabled"), run this once:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### Building the project from zero (for reference)

This repository already contains the finished files. These are the commands that originally created the skeleton:

```powershell
mkdir mini_store_backend
cd mini_store_backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
django-admin startproject config .      # the "." puts manage.py in the current folder
python manage.py startapp products
python manage.py startapp cart
python manage.py startapp notifications
```

After that: add the apps to `INSTALLED_APPS`, configure MySQL, REST Framework, CORS and media in `config/settings.py`, write the models, then run `makemigrations` and `migrate`.

---

## 4. Required packages

[requirements.txt](requirements.txt)

| Package | Why |
|---|---|
| `Django>=5.2,<6.0` | Web framework (5.2 is the current LTS) |
| `djangorestframework>=3.16,<3.17` | Serializers, ViewSets, routers, browsable API |
| `django-cors-headers>=4.7,<5.0` | Adds CORS headers so browser-based clients can call the API |
| `mysqlclient>=2.2.7,<2.3` | MySQL driver used by `django.db.backends.mysql` |
| `Pillow>=11.3,<13` | Required by `ImageField` to check that uploads are real images |
| `drf-spectacular>=0.28,<0.30` | Generates the OpenAPI schema and Swagger UI |
| `python-dotenv>=1.0,<2.0` | Loads `SECRET_KEY`, `DEBUG` and `DB_*` settings from the `.env` file |

---

## 5. MySQL setup

### 5.1 Install MySQL

1. Download **MySQL Installer for Windows** from <https://dev.mysql.com/downloads/installer/>.
2. Choose **Server only** (or "Developer Default" if you also want MySQL Workbench).
3. Keep port **3306**, choose **Use Strong Password Encryption**, and set a **root password**. Remember it.
4. Leave "Configure MySQL Server as a Windows Service" checked so MySQL starts automatically.

### 5.2 Create the database

Open **MySQL Command Line Client** (Start menu) or run `mysql -u root -p`, then:

```sql
CREATE DATABASE mini_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
```

Optional: use a dedicated user instead of root:

```sql
CREATE USER 'mini_store_user'@'localhost' IDENTIFIED BY 'choose_a_password';
GRANT ALL PRIVILEGES ON mini_store_db.* TO 'mini_store_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5.3 Configure Django (the .env file)

Secrets and machine-specific values live in a **`.env`** file next to `manage.py`, not in the code.
`python-dotenv` loads it when Django starts (`load_dotenv(BASE_DIR / ".env")` in [config/settings.py](config/settings.py)).

| File | Committed to git? | Purpose |
|---|---|---|
| `.env` | **No** (listed in `.gitignore`) | Your real values: secret key, MySQL password |
| `.env.example` | Yes | Template showing which variables exist |

If you don't have a `.env` yet:

```powershell
copy .env.example .env
```

Then edit `.env`:

```ini
# Django secret key - keep it private; generate a new one for production.
SECRET_KEY='paste-a-long-random-string-here'

# Set to False in production
DEBUG=True

# Comma-separated host names allowed to reach the server (* = any, local dev only)
ALLOWED_HOSTS=*

# MySQL database settings
DB_NAME=mini_store_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

- Set `DB_PASSWORD` to the root password you chose when installing MySQL.
- Generate a secret key with:
  ```powershell
  python -c "from django.core.management.utils import get_random_secret_key as g; print(g())"
  ```
  Keep the **single quotes** around `SECRET_KEY`: keys can contain `$` and `#`, which would otherwise be misread.
- If `SECRET_KEY` is missing, Django stops with `SECRET_KEY is not set. Copy .env.example to .env ...`.
- A variable already set in the shell (e.g. `$env:DB_PASSWORD = "..."`) overrides the `.env` value.

`settings.py` reads the values like this:

```python
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
```

`utf8mb4` supports all Unicode, including emoji. `STRICT_TRANS_TABLES` makes MySQL reject invalid data instead of silently truncating it.

### 5.4 Install the Python MySQL driver

`mysqlclient` is already in `requirements.txt`:

```powershell
pip install mysqlclient
```

Pre-built Windows wheels exist, so no compiler is needed on current Python versions. See [Common errors](#23-common-errors-and-fixes) if the install fails.

### 5.5 Run migrations

```powershell
python manage.py migrate
```

Check in MySQL:

```sql
USE mini_store_db;
SHOW TABLES;   -- products_product, cart_cartitem, notifications_notification, auth_*, django_* ...
```

---

## 6. Folder structure

```
mini_store_backend/
├── manage.py
├── requirements.txt
├── README.md
├── .gitignore
├── config/                     # project settings package
│   ├── __init__.py
│   ├── settings.py             # MySQL, DRF, CORS, media, Swagger settings
│   ├── urls.py                 # /admin/, /api/..., /api/docs/, media serving
│   ├── asgi.py
│   └── wsgi.py
├── products/
│   ├── migrations/0001_initial.py
│   ├── management/commands/seed_products.py   # sample data
│   ├── admin.py
│   ├── apps.py
│   ├── models.py               # Product + Category/Condition choices
│   ├── serializers.py          # ProductSerializer + option serializers
│   ├── urls.py                 # products router, categories/, options/
│   └── views.py                # ProductViewSet, CategoryListView, OptionsView
├── cart/
│   ├── migrations/0001_initial.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py               # CartItem (one row per product)
│   ├── serializers.py          # CartItemSerializer, CartResponseSerializer
│   ├── urls.py
│   └── views.py                # CartItemViewSet (merge + stock logic)
├── notifications/
│   ├── migrations/0001_initial.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py               # Notification
│   ├── serializers.py
│   ├── urls.py
│   └── views.py                # NotificationViewSet
└── media/                      # uploaded files (created/filled at runtime)
    ├── products/               # images
    └── product_files/          # PDFs / DOC / DOCX
```

---

## 7. settings.py

File: [config/settings.py](config/settings.py). The key parts:

| Setting | Purpose |
|---|---|
| `load_dotenv(BASE_DIR / ".env")` | Loads `.env` into the environment before any setting is read |
| `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` | Read from `.env` (`SECRET_KEY`, `DEBUG=True`, `ALLOWED_HOSTS=*`) |
| `INSTALLED_APPS` | Django built-ins + `rest_framework`, `corsheaders`, `drf_spectacular` + the three local apps |
| `MIDDLEWARE` | `CorsMiddleware` is **first**, so CORS headers are added to every response |
| `ALLOWED_HOSTS = ["*"]` | Lets your phone call `http://YOUR_LAN_IP:8000` (dev only) |
| `DATABASES` | MySQL (see section 5) |
| `MEDIA_URL`, `MEDIA_ROOT` | Where uploads are stored and the URL they're served at |
| `MAX_IMAGE_UPLOAD_SIZE`, `MAX_FILE_UPLOAD_SIZE` | 5 MB and 10 MB limits used by the serializer |
| `REST_FRAMEWORK` | No auth (`DEFAULT_AUTHENTICATION_CLASSES: []`, `AllowAny`), JSON + multipart + form parsers, JSON + browsable renderers, drf-spectacular schema |
| `SPECTACULAR_SETTINGS` | Swagger title and description; `COMPONENT_SPLIT_REQUEST=True` makes file fields show as file pickers |
| `CORS_ALLOW_ALL_ORIGINS = True` | Permissive CORS for local development |

Why `DEFAULT_AUTHENTICATION_CLASSES: []`? With no authentication class, DRF does not enforce CSRF. POST, PATCH and DELETE from Swagger, the browsable API, Postman or a mobile app work without tokens or cookies.

---

## 8. Models

### Product ([products/models.py](products/models.py))

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | automatic |
| `name` | CharField(200) | required |
| `description` | TextField | optional |
| `price` | DecimalField(10, 2) | must be > 0 |
| `category` | CharField + `Category` choices | `electronics`, `clothing`, `shoes`, `books`, `accessories`, `home` |
| `condition` | CharField + `Condition` choices | `new` (default), `used`, `refurbished` |
| `image` | ImageField → `media/products/` | optional; jpg, jpeg, png, gif, webp |
| `product_file` | FileField → `media/product_files/` | optional; pdf, doc, docx |
| `stock` | PositiveIntegerField | ≥ 0, default 0 |
| `created_at` / `updated_at` | DateTimeField | `auto_now_add` / `auto_now` |

Choices use `models.TextChoices`. Each choice has a stored **value** (`"electronics"`) and a display **label** (`"Electronics"`). The options API returns these pairs directly.

### CartItem ([cart/models.py](cart/models.py))

| Field | Type | Notes |
|---|---|---|
| `product` | ForeignKey → Product | `CASCADE`: deleting a product removes it from the cart |
| `quantity` | PositiveIntegerField | ≥ 1 |
| `created_at` / `updated_at` | DateTimeField | |

- `UniqueConstraint(fields=["product"])`: the database guarantees one row per product.
- `subtotal` property: `product.price * quantity`.
- `clean()` checks the stock, so edits in the Django admin also respect it.
- There is no user field: this is a single global demo cart.

### Notification ([notifications/models.py](notifications/models.py))

`title`, `message`, `is_read` (default `False`), `created_at`. Ordered newest first.

---

## 9. Serializers

| Serializer | File | What it does |
|---|---|---|
| `ProductSerializer` | [products/serializers.py](products/serializers.py) | All product fields plus read-only `category_label` and `condition_label`. `ImageField`/`FileField` accept uploads and return **absolute URLs** (DRF builds them from the request). Validates name, price, image size and file size. |
| `OptionSerializer`, `CategoriesResponseSerializer`, `OptionsResponseSerializer` | same | Describe the option API responses for Swagger |
| `CartItemSerializer` | [cart/serializers.py](cart/serializers.py) | Input `product` + `quantity`. Output adds `product_name`, `product_image`, `price`, `stock`, `subtotal`. The product can't be changed on PATCH. |
| `CartResponseSerializer` | same | Describes `{items, count, total}` for Swagger |
| `NotificationSerializer` | [notifications/serializers.py](notifications/serializers.py) | Plain ModelSerializer |

---

## 10. Views / ViewSets

| View | File | Notes |
|---|---|---|
| `ProductViewSet` (ModelViewSet) | [products/views.py](products/views.py) | Full CRUD. `parser_classes = [JSONParser, MultiPartParser, FormParser]`. Creates a "New Product" notification. Deletes old files when they're replaced or the product is deleted. |
| `CategoryListView` (APIView) | same | `GET /api/categories/` |
| `OptionsView` (APIView) | same | `GET /api/options/` |
| `CartItemViewSet` (ModelViewSet) | [cart/views.py](cart/views.py) | Custom `list()` adds `total`. Custom `create()` merges duplicates and checks stock. `perform_update()` checks stock. PUT is disabled. |
| `NotificationViewSet` (ModelViewSet) | [notifications/views.py](notifications/views.py) | CRUD. PUT is disabled; use PATCH. |

The add-to-cart flow (`CartItemViewSet.create`):

1. Validate input: the product exists and quantity ≥ 1.
2. Look for an existing cart row for that product.
3. `new_quantity = requested + existing quantity (or 0)`.
4. If `new_quantity > product.stock`, return 400 `{"detail": "Only N items are available."}`.
5. Update the existing row (200) or create a new row (201).
6. Create a "Cart Updated" notification.

---

## 11. URLs

[config/urls.py](config/urls.py) includes each app's `urls.py` under `/api/`. Each app uses a DRF **SimpleRouter** (not DefaultRouter, which would add three competing API root pages).

```
/admin/                         Django admin
/api/products/                  ProductViewSet (list, create)
/api/products/{id}/             ProductViewSet (retrieve, update, partial_update, destroy)
/api/categories/                CategoryListView
/api/options/                   OptionsView
/api/cart/                      CartItemViewSet (list, create)
/api/cart/{id}/                 CartItemViewSet (retrieve, partial_update, destroy)
/api/notifications/             NotificationViewSet (list, create)
/api/notifications/{id}/        NotificationViewSet (retrieve, partial_update, destroy)
/api/docs/                      Swagger UI
/api/redoc/                     ReDoc
/api/schema/                    OpenAPI schema (YAML)
/media/...                      uploaded files (DEBUG only)
```

---

## 12. Admin

Open `http://127.0.0.1:8000/admin/` and log in with the superuser.

- **Products**: create, edit, delete; upload an image and a document; image thumbnail in the list and a preview on the edit page; filter by category and condition; search.
- **Cart items**: view with price and subtotal; edit quantity directly in the list (stock is checked); delete.
- **Notifications**: create, edit, delete; toggle `is_read` in the list; bulk actions "Mark selected as read/unread".

---

## 13. Media configuration

```python
# config/settings.py
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# config/urls.py
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

- An uploaded image is saved to `media/products/headphones.jpg` and served at `http://YOUR_LAN_IP:8000/media/products/headphones.jpg`.
- If a file with the same name already exists, Django adds a suffix (`headphones_K1QXwbs.jpg`), so nothing is overwritten.
- `static()` serves media **only when `DEBUG = True`**. In production, a web server or cloud storage serves media.

### Why YOUR_LAN_IP and not 127.0.0.1?

`127.0.0.1` (localhost) always means **"this same device"**. On your computer it's the computer. On your phone it's the phone, where no Django server is running.

When the client app runs on a **physical phone**:

1. Start Django with `python manage.py runserver 0.0.0.0:8000` so it listens on all network interfaces, not only localhost.
2. Find your computer's LAN IP: run `ipconfig` and look for **IPv4 Address** under your Wi-Fi adapter (e.g. `192.168.1.5`).
3. Use `http://YOUR_LAN_IP:8000/api/` as the API base URL in the client (e.g. `http://192.168.1.5:8000/api/`).
4. Keep the phone and the computer on the **same Wi-Fi**, and allow Python through Windows Firewall when prompted (Private networks).

Image and file URLs are built from the **host the request was sent to**. If the app calls `http://192.168.1.5:8000/api/products/`, the image URLs come back as `http://192.168.1.5:8000/media/...`, which work on the phone. Nothing is hard-coded.

Android emulator: use `http://10.0.2.2:8000`. iOS simulator: `http://127.0.0.1:8000` works.

---

## 14. CORS configuration

**What is CORS?** Browsers enforce the *same-origin policy*: JavaScript loaded from one origin (scheme + host + port, e.g. `http://localhost:8081`) cannot read responses from another origin (`http://192.168.1.5:8000`) unless that server says it's allowed. It does this with CORS headers such as `Access-Control-Allow-Origin`. This protects users: a random website can't read data from other sites using the user's browser.

**Who is affected?** Only browser-based clients (React web, Expo web, a page in a browser). Native mobile apps, Postman and curl ignore CORS.

**Configuration** ([config/settings.py](config/settings.py)):

```python
INSTALLED_APPS = [..., "corsheaders", ...]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", ...]   # first

CORS_ALLOW_ALL_ORIGINS = True        # permissive: fine for local learning
```

Stricter alternative (recommended outside local learning). Remove `CORS_ALLOW_ALL_ORIGINS` and list the allowed origins instead:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:3000",
    "http://YOUR_LAN_IP:8081",
]
```

---

## 15. Migrations

The initial migrations are included:

- `products/migrations/0001_initial.py`
- `cart/migrations/0001_initial.py`
- `notifications/migrations/0001_initial.py`

```powershell
python manage.py migrate                 # create or update tables in MySQL
python manage.py showmigrations          # see what has been applied
```

When you change a model later:

```powershell
python manage.py makemigrations          # create a new migration file from model changes
python manage.py migrate                 # apply it
```

---

## 16. API endpoint table

Base URL: `http://YOUR_LAN_IP:8000` (or `http://127.0.0.1:8000` on the same computer).

| Method | Endpoint | Purpose | Request type | Authentication |
|---|---|---|---|---|
| GET | `/api/products/` | List all products | – | None |
| POST | `/api/products/` | Create product | JSON or multipart/form-data | None |
| GET | `/api/products/{id}/` | Product details | – | None |
| PUT | `/api/products/{id}/` | Replace product (all required fields) | JSON or multipart/form-data | None |
| PATCH | `/api/products/{id}/` | Update some fields / replace image or file | JSON or multipart/form-data | None |
| DELETE | `/api/products/{id}/` | Delete product (and its files) | – | None |
| GET | `/api/categories/` | Category options (dropdown) | – | None |
| GET | `/api/options/` | Category + condition options | – | None |
| GET | `/api/cart/` | Cart items + total | – | None |
| POST | `/api/cart/` | Add product (merges duplicates) | JSON | None |
| GET | `/api/cart/{id}/` | One cart item | – | None |
| PATCH | `/api/cart/{id}/` | Change quantity | JSON | None |
| DELETE | `/api/cart/{id}/` | Remove from cart | – | None |
| GET | `/api/notifications/` | List notifications (newest first) | – | None |
| POST | `/api/notifications/` | Create notification | JSON | None |
| GET | `/api/notifications/{id}/` | One notification | – | None |
| PATCH | `/api/notifications/{id}/` | Update / mark as read | JSON | None |
| DELETE | `/api/notifications/{id}/` | Delete notification | – | None |
| GET | `/api/docs/` | Swagger UI | – | None |
| GET | `/api/redoc/` | ReDoc | – | None |
| GET | `/api/schema/` | OpenAPI schema | – | None |

---

## 17. Example JSON request bodies

Create product (no files): `POST /api/products/` with `Content-Type: application/json`

```json
{
  "name": "Wireless Headphones",
  "description": "Bluetooth wireless headphones",
  "price": "2999.00",
  "category": "electronics",
  "condition": "new",
  "stock": 10
}
```

Full update: `PUT /api/products/1/` (all required fields: name, price, category, stock)

```json
{
  "name": "Wireless Headphones Pro",
  "description": "Noise cancelling",
  "price": "3499.00",
  "category": "electronics",
  "condition": "new",
  "stock": 8
}
```

Partial update: `PATCH /api/products/1/`

```json
{ "price": "2799.00", "stock": 12 }
```

Remove an image or document with JSON PATCH:

```json
{ "image": null, "product_file": null }
```

Add to cart: `POST /api/cart/`

```json
{ "product": 1, "quantity": 1 }
```

`quantity` is optional and defaults to 1.

Change quantity: `PATCH /api/cart/1/`

```json
{ "quantity": 3 }
```

Create notification: `POST /api/notifications/`

```json
{ "title": "New Product", "message": "A new product has been added." }
```

Mark as read: `PATCH /api/notifications/1/`

```json
{ "is_read": true }
```

---

## 18. Multipart/form-data examples

Use `multipart/form-data` whenever you send an **image or document**. Every field is a separate form part:

| Field | Part type | Example |
|---|---|---|
| `name` | text | `Wireless Headphones` |
| `description` | text | `Bluetooth wireless headphones` |
| `price` | text | `2999.00` |
| `category` | text | `electronics` |
| `condition` | text | `new` |
| `stock` | text | `10` |
| `image` | **file** | `headphones.jpg` (jpg/jpeg/png/gif/webp, ≤ 5 MB) |
| `product_file` | **file** | `manual.pdf` (pdf/doc/docx, ≤ 10 MB) |

Numbers are sent as text in multipart; DRF converts them.
Don't set the `Content-Type` header yourself. The HTTP client must generate it, including the `boundary=...` part.

### curl (Windows 10/11 ships with `curl.exe`)

In PowerShell, type `curl.exe`, not `curl`. Plain `curl` is an alias for `Invoke-WebRequest`.

```powershell
# Create with image + document
curl.exe -X POST http://127.0.0.1:8000/api/products/ `
  -F "name=Wireless Headphones" `
  -F "description=Bluetooth wireless headphones" `
  -F "price=2999.00" `
  -F "category=electronics" `
  -F "condition=new" `
  -F "stock=10" `
  -F "image=@C:\path\to\headphones.jpg" `
  -F "product_file=@C:\path\to\manual.pdf"

# Create with image only
curl.exe -X POST http://127.0.0.1:8000/api/products/ `
  -F "name=Running Shoes" -F "price=2499" -F "category=shoes" -F "condition=new" -F "stock=15" `
  -F "image=@C:\path\to\shoes.png"

# Replace only the image of product 1
curl.exe -X PATCH http://127.0.0.1:8000/api/products/1/ -F "image=@C:\path\to\new_photo.jpg"
```

In `cmd.exe`, use `^` instead of the backtick for line continuation, or put everything on one line.

### Postman

1. Method `POST`, URL `http://127.0.0.1:8000/api/products/`.
2. Body → **form-data**.
3. Add the text keys (`name`, `price`, ...) with type **Text**.
4. Add `image` and `product_file` with type **File** (dropdown next to the key) and choose the files.
5. Send. Postman sets the `multipart/form-data; boundary=...` header automatically.

### Swagger UI

Open `/api/docs/` → **POST /api/products/** → *Try it out* → change the request body type dropdown to **multipart/form-data**. `image` and `product_file` appear as **Choose File** buttons.

---

## 19. Example API responses

`GET /api/products/1/` → 200

```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "Bluetooth wireless headphones",
  "price": "2999.00",
  "category": "electronics",
  "category_label": "Electronics",
  "condition": "new",
  "condition_label": "New",
  "image": "http://YOUR_LAN_IP:8000/media/products/headphones.jpg",
  "product_file": "http://YOUR_LAN_IP:8000/media/product_files/manual.pdf",
  "stock": 10,
  "created_at": "2026-10-03T06:29:55.138857Z",
  "updated_at": "2026-10-03T06:29:55.138926Z"
}
```

A product without uploads returns `"image": null, "product_file": null`. Show a placeholder image in the client.

`GET /api/products/` → 200: a JSON **array** of products, newest first. It returns `[]` when there are none (empty state).

`GET /api/categories/` → 200

```json
{
  "categories": [
    { "label": "Electronics", "value": "electronics" },
    { "label": "Clothing", "value": "clothing" },
    { "label": "Shoes", "value": "shoes" },
    { "label": "Books", "value": "books" },
    { "label": "Accessories", "value": "accessories" },
    { "label": "Home", "value": "home" }
  ]
}
```

`GET /api/options/` → 200: the same `categories` plus

```json
"conditions": [
  { "label": "New", "value": "new" },
  { "label": "Used", "value": "used" },
  { "label": "Refurbished", "value": "refurbished" }
]
```

`POST /api/cart/` → **201** (new row) or **200** (existing row, quantity increased)

```json
{
  "id": 1,
  "product": 1,
  "product_name": "Wireless Headphones",
  "product_image": "http://YOUR_LAN_IP:8000/media/products/headphones.jpg",
  "price": "2999.00",
  "stock": 10,
  "quantity": 3,
  "subtotal": "8997.00",
  "created_at": "...",
  "updated_at": "..."
}
```

`GET /api/cart/` → 200

```json
{
  "items": [
    {
      "id": 1,
      "product": 1,
      "product_name": "Wireless Headphones",
      "product_image": "http://YOUR_LAN_IP:8000/media/products/headphones.jpg",
      "price": "2999.00",
      "stock": 10,
      "quantity": 2,
      "subtotal": "5998.00",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "count": 1,
  "total": "5998.00"
}
```

An empty cart returns `{"items": [], "count": 0, "total": "0.00"}`.

`GET /api/notifications/` → 200

```json
[
  {
    "id": 2,
    "title": "Cart Updated",
    "message": "\"Wireless Headphones\" was added to your cart (quantity: 2).",
    "is_read": false,
    "created_at": "..."
  },
  {
    "id": 1,
    "title": "New Product",
    "message": "\"Wireless Headphones\" has been added to the store.",
    "is_read": false,
    "created_at": "..."
  }
]
```

| Situation | Status | Body |
|---|---|---|
| Created | 201 | the new object |
| Updated / read | 200 | the object |
| Deleted | 204 | empty |
| Validation error | 400 | `{"field": ["message"]}` or `{"detail": "message"}` |
| Not found | 404 | `{"detail": "No Product matches the given query."}` |
| Method not allowed (e.g. PUT on cart) | 405 | `{"detail": "Method \"PUT\" not allowed."}` |

---

## 20. Validation behavior

| Rule | Where | Error example |
|---|---|---|
| Name not empty or whitespace | ProductSerializer | `{"name": ["Product name cannot be empty."]}` |
| Price > 0 | ProductSerializer | `{"price": ["Price must be greater than 0."]}` |
| Stock ≥ 0 | PositiveIntegerField | `{"stock": ["Ensure this value is greater than or equal to 0."]}` |
| Valid category | choices | `{"category": ["\"cars\" is not a valid choice."]}` |
| Valid condition | choices | `{"condition": ["\"broken\" is not a valid choice."]}` |
| Image is a real image | DRF ImageField + Pillow | `{"image": ["Upload a valid image. ..."]}` |
| Image extension | FileExtensionValidator | `{"image": ["File extension “bmp” is not allowed. ..."]}` |
| Image ≤ 5 MB | ProductSerializer | `{"image": ["Image must be 5 MB or smaller."]}` |
| Document is pdf/doc/docx | FileExtensionValidator | `{"product_file": ["File extension “exe” is not allowed. Allowed extensions are: pdf, doc, docx."]}` |
| Document ≤ 10 MB | ProductSerializer | `{"product_file": ["File must be 10 MB or smaller."]}` |
| Cart quantity ≥ 1 | CartItemSerializer | `{"quantity": ["Ensure this value is greater than or equal to 1."]}` |
| Cart product exists | PrimaryKeyRelatedField | `{"product": ["Invalid pk \"999\" - object does not exist."]}` |
| Cart quantity ≤ stock (incl. merged total) | CartItemViewSet | `{"detail": "Only 3 items are available."}` / `"Only 1 item is available."` / `"This product is out of stock."` |
| Cart product cannot change on PATCH | CartItemSerializer | `{"product": ["The product of a cart item cannot be changed. ..."]}` |

Field errors always come back as `{field_name: [messages]}`. A client can show each message under its form input.

---

## 21. How to test each API

The easiest options are **Swagger UI** (`http://127.0.0.1:8000/api/docs/`) or the **DRF browsable API** (open any `/api/...` URL in a browser; there is a form at the bottom of the page). Postman works too.

The JSON examples below use PowerShell's `Invoke-RestMethod` (`irm`), which handles JSON quoting cleanly. `$B` is the base URL.

```powershell
$B = "http://127.0.0.1:8000/api"
```

| # | Test | How |
|---|---|---|
| 1 | Create product without image | `irm "$B/products/" -Method Post -ContentType "application/json" -Body '{"name":"Backpack","price":"1499","category":"accessories","condition":"new","stock":20}'` → 201, `"image": null` |
| 2 | Create product with image | `curl.exe -X POST "$B/products/" -F "name=Running Shoes" -F "price=2499" -F "category=shoes" -F "condition=new" -F "stock=15" -F "image=@C:\path\shoes.jpg"` → 201; open the returned `image` URL in a browser |
| 3 | Create with image + file | same as 2, plus `-F "product_file=@C:\path\manual.pdf"` → 201; both URLs open |
| 4 | Get products | `irm "$B/products/"` → array |
| 5 | Get one product | `irm "$B/products/1/"` (and `irm "$B/products/999/"` → 404) |
| 6 | Update product | PATCH: `irm "$B/products/1/" -Method Patch -ContentType "application/json" -Body '{"price":"1299"}'`; PUT: send all fields; image: `curl.exe -X PATCH "$B/products/1/" -F "image=@C:\path\new.jpg"` |
| 7 | Delete product | `irm "$B/products/1/" -Method Delete` → 204; the files are removed from `media/` |
| 8 | Get categories | `irm "$B/categories/"` |
| 9 | Get options | `irm "$B/options/"` |
| 10 | Add product to cart | `irm "$B/cart/" -Method Post -ContentType "application/json" -Body '{"product":2,"quantity":2}'` → 201 |
| 11 | Add the same product again | repeat with `{"product":2,"quantity":1}` → **200**, same `id`, quantity 3; then `irm "$B/cart/"` shows one row. Request more than the stock → 400 `"Only N items are available."` |
| 12 | Update cart quantity | `irm "$B/cart/1/" -Method Patch -ContentType "application/json" -Body '{"quantity":1}'` |
| 13 | Remove cart item | `irm "$B/cart/1/" -Method Delete` → 204 |
| 14 | Get notifications | `irm "$B/notifications/"`: "New Product" and "Cart Updated" entries from the steps above |
| 15 | Create notification | `irm "$B/notifications/" -Method Post -ContentType "application/json" -Body '{"title":"Sale","message":"10% off today"}'` |
| 16 | Mark as read | `irm "$B/notifications/1/" -Method Patch -ContentType "application/json" -Body '{"is_read":true}'` |
| 17 | Delete notification | `irm "$B/notifications/1/" -Method Delete` |

To see the full status code and error body in PowerShell 5.1, use `curl.exe -i ...` instead of `irm`. `irm` raises an exception on 4xx.

Validation checks to try:
- `{"name":"  ","price":"0","category":"cars","condition":"broken","stock":-1}` → 400 with five field errors
- Upload a `.txt` renamed to `.jpg` as `image` → "Upload a valid image"
- Upload a `.exe` as `product_file` → extension error

---

## 22. How to run the backend

```powershell
cd C:\Users\Salma\Desktop\react_native_sample_project\mini_store_backend
venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

| URL | What |
|---|---|
| `http://127.0.0.1:8000/api/products/` | Browsable API |
| `http://127.0.0.1:8000/api/docs/` | Swagger UI |
| `http://127.0.0.1:8000/api/redoc/` | ReDoc |
| `http://127.0.0.1:8000/admin/` | Django admin |
| `http://YOUR_LAN_IP:8000/api/` | Base URL for a client app on a physical phone |

Make sure the MySQL service is running first (Windows: *Services* → `MySQL80` → Running).

Note: Swagger UI and ReDoc load their JavaScript from a CDN, so the docs pages need internet access. The API itself does not.

---

## 23. Common errors and fixes

| Error | Cause | Fix |
|---|---|---|
| `pip install mysqlclient` fails with "Microsoft Visual C++ 14.0 is required" or "mysql_config not found" | No pre-built wheel for your Python version, so pip tries to compile | `python -m pip install --upgrade pip`, then retry. If it still fails, use a Python version with wheels (3.10–3.14). Last resort: `pip install pymysql` and add `import pymysql; pymysql.install_as_MySQLdb()` at the top of `config/__init__.py`. |
| `django.core.exceptions.ImproperlyConfigured: Error loading MySQLdb module` | Driver not installed in the **active** venv | Activate the venv, then `pip install -r requirements.txt` |
| `(1045, "Access denied for user 'root'@'localhost'")` | Wrong password | Fix `DB_PASSWORD` in `.env` |
| `ImproperlyConfigured: SECRET_KEY is not set` | No `.env` file, or `SECRET_KEY` missing from it | `copy .env.example .env` and fill in the values |
| `ModuleNotFoundError: No module named 'dotenv'` | `python-dotenv` not installed in the active venv | `pip install -r requirements.txt` |
| Media files return 404 right after setup | `DEBUG` is `False` in `.env` | Set `DEBUG=True` for local development |
| `(1049, "Unknown database 'mini_store_db'")` | Database not created | `CREATE DATABASE mini_store_db CHARACTER SET utf8mb4;` |
| `(2003, "Can't connect to MySQL server on 'localhost' (10061)")` | MySQL service not running or wrong port | Start the `MySQL80` service; check the port is 3306 |
| `(1146, "Table 'mini_store_db.products_product' doesn't exist")` | Migrations not applied | `python manage.py migrate` |
| `Invalid HTTP_HOST header` / DisallowedHost | Host not allowed | `ALLOWED_HOSTS = ["*"]` (already set) |
| Phone gets "Network request failed" / timeout | Server only on localhost, wrong IP, different Wi-Fi, or firewall | Run with `0.0.0.0:8000`, use the IPv4 from `ipconfig`, same Wi-Fi, allow Python in Windows Firewall (Private) |
| Image URL is `http://127.0.0.1:8000/...` on the phone | The client called the API via 127.0.0.1 | Call the API using `http://YOUR_LAN_IP:8000`; URLs follow the request host |
| Media URL returns 404 | `DEBUG = False`, or the file doesn't exist | Keep `DEBUG = True` for local dev; check the file in `media/` |
| `"The submitted data was not a file. Check the encoding type on the form."` | File sent as JSON or text | Send as multipart/form-data with the field type **File** |
| `"Upload a valid image..."` | File isn't a real image | Upload a real JPG/PNG |
| 415 `Unsupported media type` | Wrong `Content-Type` | Use `application/json` or `multipart/form-data` |
| Multipart request has no files / boundary error | `Content-Type` was set manually without a boundary | Let the HTTP client set the multipart header itself |
| 405 `Method "PUT" not allowed` on cart/notifications | PUT is disabled there | Use PATCH |
| Browser console: "blocked by CORS policy" | CORS headers missing | Check `corsheaders` is in `INSTALLED_APPS`, `CorsMiddleware` is first, `CORS_ALLOW_ALL_ORIGINS = True` |
| `"Only 3 items are available."` | Requested cart quantity (existing + new) > stock | Lower the quantity or raise stock in admin |
| `Activate.ps1 cannot be loaded because running scripts is disabled` | PowerShell execution policy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Swagger page is blank | No internet (UI assets come from a CDN) | Connect to the internet, or use the browsable API |
