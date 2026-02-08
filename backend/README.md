# Emotion Companion - Django Backend

Django REST API backend for the Emotion-Aware AI Companion application.

## Features

- ✅ User authentication (JWT)
- ✅ User registration and login
- ✅ Profile management
- ✅ PostgreSQL database
- ✅ RESTful API endpoints
- ⏳ ML model integration (Phase 2)

## Tech Stack

- **Django 5.0** - Web framework
- **Django REST Framework** - API toolkit
- **PostgreSQL** - Database
- **JWT Authentication** - djangorestframework-simplejwt
- **CORS Headers** - django-cors-headers

## Project Structure

```
backend/
├── emotion_companion/          # Django project
│   ├── settings.py            # Project settings
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI config
│   └── asgi.py                # ASGI config
├── users/                      # Users app
│   ├── models.py              # User model
│   ├── serializers.py         # API serializers
│   ├── views.py               # API views
│   ├── urls.py                # App URLs
│   └── admin.py               # Admin configuration
├── database/                   # Database scripts
│   ├── schema.sql             # PostgreSQL schema
│   ├── setup_db.py            # Database setup script
│   └── README.md              # Database docs
├── manage.py                   # Django CLI
├── requirements.txt            # Python dependencies
└── .env                        # Environment variables
```

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
copy .env.example .env
# Edit .env with your database credentials

# 5. Set up database
python database/setup_db.py

# 6. Run migrations
python manage.py makemigrations
python manage.py migrate

# 7. Create superuser (optional)
python manage.py createsuperuser

# 8. Run development server
python manage.py runserver
```

**API Base URL:** http://localhost:8000/api/

## Setup Instructions

### 1. Prerequisites

- Python 3.10 or higher
- PostgreSQL 14 or higher
- PostgreSQL 14 or higher
- pip and virtualenv

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
DATABASE_NAME=emotion_companion
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://10.0.2.2:8000
```

### 5. Database Setup

#### Option A: Automated Setup (Recommended)

```bash
python database/setup_db.py
```

#### Option B: Manual Setup

```bash
# Create database in PostgreSQL
psql -U postgres
CREATE DATABASE emotion_companion;
\q
```

### 6. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Start Development Server

```bash
python manage.py runserver
```

The server will run at `http://localhost:8000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword",
  "password_confirm": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe"
  },
  "tokens": {
    "refresh": "refresh_token_here",
    "access": "access_token_here"
  },
  "message": "Login successful"
}
```

#### Get Profile
```http
GET /api/auth/profile/
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/auth/profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

#### Change Password
```http
POST /api/auth/change-password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "oldpassword",
  "new_password": "newpassword",
  "new_password_confirm": "newpassword"
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

#### Refresh Token
```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "refresh_token_here"
}
```

### Health Check
```http
GET /api/health/
```

## Testing

Run tests with:

```bash
python manage.py test
```

Run specific app tests:

```bash
python manage.py test users
```

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/`

Login with your superuser credentials.

## Database

### Schema

The database includes:

- **users** - User accounts (Django managed)
- **emotion_sessions** - Emotion detection sessions (Phase 2)
- **conversations** - Chat history (Phase 2)
- **emotion_analytics** - Emotion patterns (Phase 2)
- **user_preferences** - User settings (Phase 2)

### Database Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Database shell
python manage.py dbshell
```

## Development

### Django Shell

```bash
python manage.py shell
```

### Create App

```bash
python manage.py startapp app_name
```

### Collect Static Files

```bash
python manage.py collectstatic
```

## Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up HTTPS
- [ ] Use production database
- [ ] Configure static files serving
- [ ] Set up CORS properly
- [ ] Enable database backups
- [ ] Set up logging
- [ ] Use environment variables

### Environment Variables for Production

```env
SECRET_KEY=<strong-random-key>
DEBUG=False
DATABASE_NAME=emotion_companion_prod
DATABASE_USER=prod_user
DATABASE_PASSWORD=<strong-password>
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## Future Integration

Phase 2 will include:

- Voice emotion detection API integration
- Face emotion detection API integration
- Real-time emotion analysis
- ML model serving endpoints
- WebSocket support for real-time updates

## Troubleshooting

### Import Error

```bash
pip install -r requirements.txt
```

### Database Connection Error

Check PostgreSQL is running:
```bash
# Windows
pg_ctl status

# Mac/Linux
sudo service postgresql status
```

### Migration Errors

Reset migrations (development only):
```bash
python manage.py migrate users zero
python manage.py migrate
```

## License

MIT License

## Support

For issues and questions, contact the development team.
